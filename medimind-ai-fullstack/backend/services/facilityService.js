import FacilityCache from "../models/FacilityCache.js";

/**
 * Facility search using OpenStreetMap Nominatim API.
 * 
 * Overpass API is unreliable (frequently times out or is blocked on many
 * networks). Nominatim is faster, more reliable, and provides the same
 * OSM data. We search for hospitals, clinics, and pharmacies using
 * Nominatim's structured search with viewbox bounding.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "MediMindAI/1.0 (https://medimind.ai; dev@medimind.ai)";

// Rate limiting: Nominatim allows 1 req/sec — we space requests
let lastNominatimCall = 0;
async function rateLimitedNominatim() {
  const now = Date.now();
  const wait = Math.max(0, 1100 - (now - lastNominatimCall));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastNominatimCall = Date.now();
}

function sanitizeText(text) {
  if (!text) return "";
  return String(text).replace(/<[^>]*>/g, " ").replace(/&[a-z0-9#]+;/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Convert a center point + radius (meters) to a bounding box.
 * Returns [west, south, east, north] in degrees.
 */
function radiusToBBox(lat, lng, radiusMeters) {
  const R = 6371000; // Earth radius in meters
  const dLat = (radiusMeters / R) * (180 / Math.PI);
  const dLng = (radiusMeters / (R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return {
    west: lng - dLng,
    south: lat - dLat,
    east: lng + dLng,
    north: lat + dLat,
  };
}

function classifyType(item) {
  const type = (item.type || "").toLowerCase();
  const cls = (item.class || "").toLowerCase();
  const name = (item.display_name || "").toLowerCase();

  if (cls === "amenity" && type === "hospital") return "hospital";
  if (cls === "amenity" && type === "clinic") return "clinic";
  if (cls === "amenity" && type === "doctors") return "clinic";
  if (cls === "amenity" && type === "pharmacy") return "pharmacy";
  if (cls === "healthcare") {
    if (type === "hospital") return "hospital";
    if (type === "clinic" || type === "centre" || type === "doctor") return "clinic";
    if (type === "pharmacy") return "pharmacy";
  }
  // Fallback: guess from name
  if (name.includes("hospital")) return "hospital";
  if (name.includes("clinic") || name.includes("doctor") || name.includes("medical centre")) return "clinic";
  if (name.includes("pharmacy") || name.includes("chemist") || name.includes("medical store")) return "pharmacy";
  return "hospital"; // default for healthcare facilities
}

function buildAddress(item) {
  const addr = item.address || {};
  const parts = [
    addr.house_number,
    addr.road || addr.street,
    addr.suburb || addr.neighbourhood || addr.quarter,
    addr.city || addr.town || addr.village || addr.county,
    addr.postcode,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * Search Nominatim for a specific amenity type near a bounding box.
 */
async function searchNominatim(query, bbox, limit = 20) {
  await rateLimitedNominatim();

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: String(limit),
    addressdetails: "1",
    extratags: "1",
    viewbox: `${bbox.west},${bbox.north},${bbox.east},${bbox.south}`,
    bounded: "1",
  });

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    clearTimeout(t);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Nominatim ${res.status}: ${sanitizeText(body).slice(0, 100)}` };
    }
    const data = await res.json();
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    clearTimeout(t);
    return { ok: false, error: err?.name === "AbortError" ? "Search timed out" : (err?.message || "Search failed") };
  }
}

/**
 * Search for facilities near a lat/lng within a radius.
 * Uses Nominatim with bounded viewbox search.
 */
export async function findNearbyFacilities(lat, lng, radiusMeters = 5000) {
  if (lat == null || lng == null || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
    return { success: false, error: "Invalid coordinates" };
  }

  const latN = Number(parseFloat(lat));
  const lngN = Number(parseFloat(lng));
  const requestRadius = Number(radiusMeters) > 0 ? Number(radiusMeters) : 5000;

  // Check cache first
  const cacheKey = `f_${latN.toFixed(3)}_${lngN.toFixed(3)}_${requestRadius}`;
  try {
    const cached = await FacilityCache.findOne({ cacheKey });
    if (cached && (Date.now() - cached.fetchedAt.getTime()) < 60 * 60 * 1000) {
      return { success: true, facilities: cached.data, usedRadius: requestRadius };
    }
  } catch (err) {
    console.warn("[facilityService] Cache read error:", err.message);
  }

  const bbox = radiusToBBox(latN, lngN, requestRadius);
  const seen = new Set();
  const facilities = [];
  let lastError = null;

  // Search for each facility type separately to get better coverage
  const searches = [
    { query: "hospital", expectedType: "hospital" },
    { query: "clinic", expectedType: "clinic" },
    { query: "pharmacy", expectedType: "pharmacy" },
  ];

  for (const search of searches) {
    const result = await searchNominatim(search.query, bbox, 15);
    if (!result.ok) {
      lastError = result.error;
      continue;
    }

    for (const item of result.data) {
      const name = (item.display_name || "").split(",")[0].trim();
      if (!name) continue;

      const itemLat = parseFloat(item.lat);
      const itemLng = parseFloat(item.lon);
      if (isNaN(itemLat) || isNaN(itemLng)) continue;

      // Deduplicate by name + approximate location
      const key = `${name.toLowerCase()}|${itemLat.toFixed(4)}|${itemLng.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const type = classifyType(item);
      const address = buildAddress(item);
      const extratags = item.extratags || {};

      facilities.push({
        name,
        type,
        lat: itemLat,
        lng: itemLng,
        address,
        phone: extratags.phone || extratags["contact:phone"] || "",
        website: extratags.website || extratags["contact:website"] || "",
        emergency: extratags.emergency === "yes" ? true : undefined,
        openingHours: extratags.opening_hours || "",
      });
    }
  }

  // If we got no results at all and had errors, report the error
  if (facilities.length === 0 && lastError) {
    return { success: false, error: `Facility search failed: ${lastError}` };
  }

  // Sort: hospitals first, then clinics, then pharmacies
  const typePriority = { hospital: 0, clinic: 1, pharmacy: 2, facility: 3 };
  facilities.sort((a, b) => (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9));

  // Cache results in background
  FacilityCache.findOneAndUpdate(
    { cacheKey },
    { data: facilities, fetchedAt: new Date() },
    { upsert: true, new: true }
  ).catch((err) => console.warn("[facilityService] Cache write error:", err.message));

  return { success: true, facilities, usedRadius: requestRadius };
}

/**
 * Search for facilities by area/city/landmark name.
 * First geocodes the query, then searches for facilities near that location.
 */
export async function searchFacilitiesByArea(query, radiusMeters = 5000) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return { success: false, error: "Please enter a location to search." };
  }

  // Step 1: Geocode the query to get lat/lng
  await rateLimitedNominatim();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: "json",
      limit: "1",
      addressdetails: "1",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    clearTimeout(t);
    if (!res.ok) {
      return { success: false, error: `Location lookup failed (${res.status}). Please try again.` };
    }
    const arr = await res.json();
    const first = arr?.[0];
    if (!first?.lat || !first?.lon) {
      return { success: false, error: "No results for that location. Try a different spelling or a nearby landmark." };
    }

    // Step 2: Search for facilities near the geocoded location
    const result = await findNearbyFacilities(first.lat, first.lon, radiusMeters);
    return {
      ...result,
      geocoded: {
        lat: Number(first.lat),
        lng: Number(first.lon),
        displayName: first.display_name || query,
      },
    };
  } catch (err) {
    clearTimeout(t);
    if (err?.name === "AbortError") {
      return { success: false, error: "Location lookup timed out. Please try again." };
    }
    return { success: false, error: err?.message || "Location lookup failed." };
  }
}
