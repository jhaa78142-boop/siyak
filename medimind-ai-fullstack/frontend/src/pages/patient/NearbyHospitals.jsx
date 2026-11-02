import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Loader2, AlertTriangle, Navigation, Info, Phone, Globe, Clock, Building2, Cross, Pill } from "lucide-react";
import { api } from "../../lib/api";
import {
  PageStack, Reveal, SectionCard, ListRow,
  PageHeader, SearchField, SegmentedControl, Chip, PremiumButton, Drawer,
  EmptyState, ErrorState,
} from "../../components/premium";

/* ---------- Leaflet icon fix ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------- Custom colored markers ---------- */
function colorIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}
const ICONS = {
  hospital: colorIcon("red"),
  clinic: colorIcon("blue"),
  pharmacy: colorIcon("green"),
  facility: colorIcon("grey"),
  user: colorIcon("gold"),
};

/* ---------- Helpers ---------- */
function MapRecenter({ lat, lng, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      map.setView([lat, lng], zoom, { animate: true });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

const TYPE_LABELS = { hospital: "Hospital", clinic: "Clinic", pharmacy: "Pharmacy", facility: "Facility" };
const TYPE_ICONS = { hospital: Building2, clinic: Cross, pharmacy: Pill, facility: Building2 };
const TYPE_TONE_CLASS = {
  hospital: "bg-rose-100 text-rose-600",
  clinic: "bg-blue-100 text-blue-600",
  pharmacy: "bg-emerald-100 text-emerald-600",
  facility: "bg-slate-100 text-slate-500",
};

function stripHtml(text) {
  if (!text) return "";
  return String(text).replace(/<[^>]*>/g, " ").replace(/<![^>]*>/g, " ").replace(/&[a-z0-9#]+;/g, " ").replace(/\s+/g, " ").trim();
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(metres) {
  if (!Number.isFinite(metres)) return "";
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

function openStatus(hours) {
  if (!hours) return null;
  const h = String(hours).toLowerCase();
  if (h.includes("24/7") || h.includes("24 hours") || h.includes("00:00-24:00")) {
    return { open: true, label: "Open 24/7" };
  }
  const m = h.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
  const open = end > start ? cur >= start && cur <= end : cur >= start || cur <= end;
  return { open, label: open ? "Open now" : "Closed now" };
}

/* ---------- Component ---------- */
export default function NearbyHospitals() {
  const [position, setPosition] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | denied | error
  const [errorMsg, setErrorMsg] = useState("");
  const [radius, setRadius] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [usedRadius, setUsedRadius] = useState(null);
  const [searchMode, setSearchMode] = useState("auto"); // auto | search
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all | hospital | clinic | pharmacy
  const lastSearchRef = useRef(0);

  /* --- Load from lat/lng via backend --- */
  const loadFacilities = useCallback(async (lat, lng, rad = radius) => {
    setStatus("loading");
    setErrorMsg("");
    setUsedRadius(null);
    try {
      const r = Number(rad) > 0 ? Number(rad) : 5000;
      const res = await api.get(`/facilities/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${r}`);
      setFacilities(Array.isArray(res?.data) ? res.data : []);
      setPosition({ lat: Number(lat), lng: Number(lng) });
      setUsedRadius(res?.usedRadius != null ? Number(res.usedRadius) : null);
      setStatus("ready");
    } catch (err) {
      const raw = err?.message || "Could not load nearby facilities. Please try again.";
      setErrorMsg(stripHtml(raw));
      setStatus("error");
    }
  }, [radius]);

  /* --- Search by area/location name via backend --- */
  const searchByArea = async (query, rad = radius) => {
    if (!query?.trim()) return;
    const now = Date.now();
    if (now - lastSearchRef.current < 1100) {
      setErrorMsg("Please wait a moment before searching again.");
      return;
    }
    lastSearchRef.current = now;
    setSearchLoading(true);
    setErrorMsg("");
    setUsedRadius(null);
    try {
      const r = Number(rad) > 0 ? Number(rad) : 5000;
      const res = await api.get(`/facilities/search?q=${encodeURIComponent(query.trim())}&radius=${r}`);
      setFacilities(Array.isArray(res?.data) ? res.data : []);
      if (res?.geocoded?.lat && res?.geocoded?.lng) {
        setPosition({ lat: res.geocoded.lat, lng: res.geocoded.lng });
      }
      setUsedRadius(res?.usedRadius != null ? Number(res.usedRadius) : null);
      setSearchMode("search");
      setStatus("ready");
    } catch (err) {
      setErrorMsg(stripHtml(err?.message || "Search failed. Please try again."));
      setStatus("error");
    } finally {
      setSearchLoading(false);
    }
  };

  /* --- Auto-detect location on mount --- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      setErrorMsg("Geolocation is not supported by this browser. Use the search form below.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSearchMode("auto");
        loadFacilities(latitude, longitude, radius);
      },
      (err) => {
        setStatus("denied");
        setErrorMsg(
          err?.code === 1
            ? "Location permission was denied. Search by city, area, or address below."
            : "Could not determine your location. Search by city, area, or address below."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- Re-request geolocation --- */
  const requestGeolocationAgain = () => {
    if (!navigator.geolocation) return;
    setStatus("loading");
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchMode("auto");
        loadFacilities(pos.coords.latitude, pos.coords.longitude, radius);
      },
      () => {
        setStatus("denied");
        setErrorMsg("Location permission is still unavailable. Please use the search form.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  /* --- Submit search form --- */
  const onSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      searchByArea(searchQuery, radius);
    }
  };

  /* --- Re-search with current position when radius changes --- */
  const onRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (position) {
      if (searchMode === "search" && searchQuery.trim()) {
        searchByArea(searchQuery, newRadius);
      } else {
        loadFacilities(position.lat, position.lng, newRadius);
      }
    }
  };

  /* --- Retry the last meaningful request --- */
  const retryLast = () => {
    if (searchMode === "search" && searchQuery.trim()) {
      searchByArea(searchQuery, radius);
    } else if (position) {
      loadFacilities(position.lat, position.lng, radius);
    } else {
      requestGeolocationAgain();
    }
  };

  /* --- Filtered facilities --- */
  const filteredFacilities = filterType === "all"
    ? facilities
    : facilities.filter((f) => f.type === filterType);

  /* --- Type counts --- */
  const typeCounts = facilities.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {});

  const isLoading = status === "loading" || searchLoading;

  const radiusOptions = [
    { value: 1000, label: "1 km" },
    { value: 2500, label: "2.5 km" },
    { value: 5000, label: "5 km" },
    { value: 10000, label: "10 km" },
    { value: 20000, label: "20 km" },
  ];

  const typeFilterOptions = facilities.length > 0
    ? [
        { key: "all", label: `All (${facilities.length})` },
        ...(typeCounts.hospital ? [{ key: "hospital", label: `Hospitals (${typeCounts.hospital})` }] : []),
        ...(typeCounts.clinic ? [{ key: "clinic", label: `Clinics (${typeCounts.clinic})` }] : []),
        ...(typeCounts.pharmacy ? [{ key: "pharmacy", label: `Pharmacies (${typeCounts.pharmacy})` }] : []),
      ]
    : [];

  const distanceFor = (f) => {
    if (!position || typeof f.lat !== "number" || typeof f.lng !== "number") return "";
    return formatDistance(distanceMeters(position.lat, position.lng, f.lat, f.lng));
  };

  const selected = selectedFacility != null ? filteredFacilities[selectedFacility] : null;

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="OpenStreetMap + Overpass"
          title="Nearby Hospitals & Facilities"
          description="Find hospitals, clinics, and pharmacies near you — search by area, city, or use your current GPS location."
          actions={<Chip tone="accent" pulse>Live map</Chip>}
        />
      </Reveal>

      <Reveal index={1} className="w-full">
        <div className="w-full space-y-4">
          <SectionCard
              icon={Search}
              title="Find care nearby"
              subtitle="Search by city, area, or address and choose how far to look."
              bodyClassName="!pt-3"
          >
              {(status === "denied" || (status === "error" && !position)) && (
                <div className={`rounded-xl p-3 mb-3 text-xs flex items-start gap-2 ${errorMsg.includes("permission") || errorMsg.includes("denied") ? "bg-amber-50 border border-amber-100 text-amber-800" : "bg-rose-50 border border-rose-100 text-rose-700"}`}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg || "Location unavailable."}</span>
                </div>
              )}

              <form onSubmit={onSearchSubmit} className="flex flex-col lg:flex-row lg:items-end gap-3">
                <div className="flex-1 min-w-0">
                  <p className="block text-xs font-semibold text-[var(--mm-muted)] mb-1.5">
                    Location
                  </p>
                  <SearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="e.g. Connaught Place, Delhi or Mumbai"
                    className="w-full"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--mm-muted)] mb-1.5">Search radius</p>
                  <div className="overflow-x-auto scrollbar-none">
                    <SegmentedControl options={radiusOptions} value={radius} onChange={onRadiusChange} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PremiumButton
                    type="submit"
                    role="patient"
                    icon={Search}
                    loading={searchLoading}
                    disabled={searchLoading || !searchQuery.trim()}
                  >
                    Search
                  </PremiumButton>
                  <PremiumButton
                    type="button"
                    variant="outline"
                    icon={Navigation}
                    onClick={position && status !== "denied" ? () => loadFacilities(position.lat, position.lng, radius) : requestGeolocationAgain}
                  >
                    {position && status !== "denied" ? "My location" : "Use location"}
                  </PremiumButton>
                </div>
              </form>

              {(position && status !== "loading" || usedRadius != null && Number(usedRadius) !== Number(radius)) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--mm-border)] pt-3">
                  {position && status !== "loading" && (
                    <p className="text-xs text-[var(--mm-accent-deep)] flex items-center gap-1.5">
                      <MapPin size={13} className="shrink-0" />
                      <span className="font-semibold">Showing results near</span>
                      <span className="opacity-80">Lat {position.lat.toFixed(4)}, Lng {position.lng.toFixed(4)}</span>
                    </p>
                  )}
                  {usedRadius != null && Number(usedRadius) !== Number(radius) && (
                    <p className="text-xs text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      Search radius reduced to {(Number(usedRadius) / 1000).toFixed(1)} km because the map service timed out.
                    </p>
                  )}
                </div>
              )}
          </SectionCard>

          <div className="grid w-full lg:grid-cols-12 gap-4">
              {/* ═══════ FACILITY RESULTS ═══════ */}
              <div className="lg:col-span-5 min-w-0">
                <SectionCard
                  className="h-full"
                  icon={Info}
                  title={isLoading ? "Searching…" : `Nearby facilities (${facilities.length})`}
                  subtitle="Select a result for details and directions."
                  action={filteredFacilities.length > 0 ? <Chip tone="neutral">{filteredFacilities.length} shown</Chip> : null}
                  bodyClassName="!pt-3"
                >
                  {typeFilterOptions.length > 0 && (
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {typeFilterOptions.map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setFilterType(f.key)}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                            filterType === f.key
                              ? "bg-[var(--mm-accent)] text-white border-[var(--mm-accent)]"
                              : "border-[var(--mm-border)] text-[var(--mm-muted)] hover:border-[var(--mm-accent)] hover:text-[var(--mm-accent-deep)]"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="max-h-[440px] overflow-y-auto pr-1">
                    {!filteredFacilities.length && (
                      isLoading ? (
                        <p className="text-sm text-[var(--mm-muted)] flex items-center gap-2 py-3">
                          <Loader2 size={13} className="animate-spin" /> Loading facilities…
                        </p>
                      ) : status === "error" ? (
                        <ErrorState
                          title="Facility lookup failed"
                          detail={errorMsg || "We couldn't load nearby facilities."}
                          onRetry={retryLast}
                        />
                      ) : (
                        <EmptyState
                          icon={Search}
                          title="No facilities found"
                          detail="Try a larger radius or search a different location."
                        />
                      )
                    )}

                    {filteredFacilities.map((f, i) => {
                      const TypeIcon = TYPE_ICONS[f.type] || Building2;
                      const isSelected = selectedFacility === i;
                      const dist = distanceFor(f);
                      const os = openStatus(f.openingHours);
                      return (
                        <div
                          key={`${f.name}-${i}`}
                          className={`mb-1 rounded-xl transition-colors ${isSelected ? "bg-[var(--mm-accent-soft)]" : ""}`}
                        >
                          <ListRow
                            onClick={() => setSelectedFacility(isSelected ? null : i)}
                            leading={
                              <span className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_TONE_CLASS[f.type] || TYPE_TONE_CLASS.facility}`}>
                                <TypeIcon size={15} />
                              </span>
                            }
                            title={f.name}
                            meta={
                              <>
                                {TYPE_LABELS[f.type] || f.type}
                                {f.address ? ` · ${f.address}` : ""}
                              </>
                            }
                            trailing={
                              <>
                                {dist && <Chip tone="info">{dist}</Chip>}
                                {f.emergency && <Chip tone="bad">ER</Chip>}
                                {os && <Chip tone={os.open ? "good" : "neutral"}>{os.label}</Chip>}
                              </>
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              </div>

              {/* ═══════ MAP CANVAS ═══════ */}
              <div className="lg:col-span-7 min-w-0">
                <SectionCard
                  className="h-full"
                  icon={MapPin}
                  title="Map view"
                  subtitle="Select a marker or result to explore nearby care."
                  spotlight={false}
                  hover={false}
                  bodyClassName="!pt-3"
                >
                  <div className="relative rounded-2xl overflow-hidden" style={{ height: "clamp(360px, 62vh, 640px)", width: "100%" }}>
                    <MapContainer
                      center={position ? [position.lat, position.lng] : [20.5937, 78.9629]}
                      zoom={position ? 14 : 3}
                      style={{ height: "100%", width: "100%", zIndex: 0 }}
                      scrollWheelZoom
                      className="overflow-hidden"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                      />
                      {position && <MapRecenter lat={position.lat} lng={position.lng} zoom={14} />}

                      {position && (
                        <Marker position={[position.lat, position.lng]} icon={ICONS.user}>
                          <Popup>
                            <div style={{ fontSize: "12px" }}>
                              <b style={{ fontSize: "13px" }}>📍 Your location</b><br/>
                              <small style={{ color: "#94a3b8" }}>Search center point</small>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {status === "ready" && filteredFacilities.map((f, i) => f.lat && f.lng && (
                        <Marker
                          key={`${f.name}-${i}-${f.lat.toFixed(4)}`}
                          position={[f.lat, f.lng]}
                          icon={ICONS[f.type] || ICONS.facility}
                        >
                          <Popup>
                            <div style={{ fontSize: "12px", maxWidth: "220px" }}>
                              <b style={{ fontSize: "13px" }}>{f.name}</b><br/>
                              <span style={{ color: "#64748b", textTransform: "capitalize" }}>{TYPE_LABELS[f.type] || f.type}</span>
                              {f.address && <><br/><small style={{ color: "#94a3b8" }}>{f.address}</small></>}
                              {f.phone && <><br/><small>📞 {f.phone}</small></>}
                              {f.emergency && <><br/><small style={{ color: "#dc2626", fontWeight: 600 }}>🚨 Emergency services</small></>}
                              <br/>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#0d9488", fontSize: "11px", fontWeight: 600 }}
                              >
                                Get directions →
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>

                    {isLoading && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-slate-500 bg-white/80 backdrop-blur-sm rounded-2xl">
                        <Loader2 size={26} className="animate-spin mb-3 text-[var(--mm-accent)]"/>
                        <p className="text-sm">{position ? "Loading facilities…" : "Determining your location…"}</p>
                      </div>
                    )}

                    {status === "denied" && !position && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-slate-500 text-center px-8 bg-white/85 backdrop-blur-sm rounded-2xl border-2 border-dashed border-[var(--mm-border)]">
                        <MapPin size={30} className="mb-3 opacity-40" />
                        <p className="text-sm font-medium text-slate-600 mb-1">Search for a location to see the map</p>
                        <p className="text-xs text-slate-400 max-w-sm">Type a city, area, or address and search, or use your current location.</p>
                      </div>
                    )}

                    {status === "error" && !position && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-rose-500 text-center px-8 bg-rose-50/75 backdrop-blur-sm rounded-2xl border-2 border-dashed border-rose-200">
                        <AlertTriangle size={30} className="mb-3" />
                        <p className="text-sm font-medium">{errorMsg || "Facility lookup failed."}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 px-1">
                    <span className="text-[10px] text-[var(--mm-muted)] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span> Your location</span>
                    <span className="text-[10px] text-[var(--mm-muted)] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Hospital</span>
                    <span className="text-[10px] text-[var(--mm-muted)] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Clinic</span>
                    <span className="text-[10px] text-[var(--mm-muted)] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Pharmacy</span>
                  </div>
                </SectionCard>
              </div>
          </div>
        </div>
      </Reveal>

      {/* ═══════ FACILITY DETAIL DRAWER ═══════ */}
      <Drawer
        open={!!selected}
        onClose={() => setSelectedFacility(null)}
        title={selected?.name || "Facility"}
        width="max-w-md"
      >
        {selected && (() => {
          const DetailIcon = TYPE_ICONS[selected.type] || Building2;
          const os = openStatus(selected.openingHours);
          const dist = distanceFor(selected);
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${TYPE_TONE_CLASS[selected.type] || TYPE_TONE_CLASS.facility}`}>
                  <DetailIcon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--mm-ink)]">{TYPE_LABELS[selected.type] || selected.type}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {os && <Chip tone={os.open ? "good" : "neutral"}>{os.label}</Chip>}
                    {selected.emergency && <Chip tone="bad">Emergency services</Chip>}
                    {dist && <Chip tone="info">{dist} away</Chip>}
                  </div>
                </div>
              </div>

              {selected.address && (
                <div className="flex items-start gap-2.5 text-sm text-[var(--mm-muted)]">
                  <MapPin size={15} className="shrink-0 mt-0.5 text-[var(--mm-accent-deep)]" />
                  <span>{selected.address}</span>
                </div>
              )}

              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2.5 text-sm text-[var(--mm-accent-deep)] hover:underline">
                  <Phone size={15} /> {selected.phone}
                </a>
              )}

              {selected.website && (
                <a
                  href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[var(--mm-accent-deep)] hover:underline break-all"
                >
                  <Globe size={15} className="shrink-0" /> {selected.website.replace(/^https?:\/\//, "")}
                </a>
              )}

              {selected.openingHours && (
                <div className="flex items-center gap-2.5 text-sm text-[var(--mm-muted)]">
                  <Clock size={15} className="shrink-0 text-[var(--mm-accent-deep)]" /> {selected.openingHours}
                </div>
              )}

              <PremiumButton
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                icon={Navigation}
                fullWidth
              >
                Get directions
              </PremiumButton>
            </div>
          );
        })()}
      </Drawer>
    </PageStack>
  );
}
