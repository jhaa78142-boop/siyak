import DrugInfoCache from "../models/DrugInfoCache.js";
import { ApiError } from "../utils/ApiError.js";

const DRUG_ALIASES = new Map([
  ["crocin", "acetaminophen"],
  ["dolo", "acetaminophen"],
  ["calpol", "acetaminophen"],
  ["paracetamol", "acetaminophen"],
]);

function normalizeDrugName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|μg|g|ml|iu|units?)\b/gi, " ")
    .replace(/\b(tablets?|capsules?|syrups?|oral\s+solution)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function findLabel(term) {
  const search = `openfda.brand_name:"${term}" OR openfda.generic_name:"${term}"`;
  const params = new URLSearchParams({ search, limit: "1" });
  if (process.env.OPENFDA_API_KEY) params.set("api_key", process.env.OPENFDA_API_KEY);

  const response = await fetch(`https://api.fda.gov/drug/label.json?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`OpenFDA returned HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.results?.[0] || null;
}

function joinLabelField(value) {
  return Array.isArray(value) ? value.join("\n\n") : value || "";
}

function toDrugLabel(result) {
  return {
    found: true,
    purpose: joinLabelField(result.purpose),
    warnings: joinLabelField(result.warnings),
    dosage_and_administration: joinLabelField(result.dosage_and_administration),
    adverse_reactions: joinLabelField(result.adverse_reactions),
    drug_interactions: joinLabelField(result.drug_interactions),
    brand_name: (result.openfda?.brand_name || []).join(", "),
    generic_name: (result.openfda?.generic_name || []).join(", "),
  };
}

export async function getDrugLabel(drugName) {
  const requestedName = String(drugName || "").trim();
  const key = requestedName.toLowerCase();
  if (!key) return { found: false };

  const cached = await DrugInfoCache.findOne({ drugName: key });
  if (cached && Date.now() - cached.fetchedAt.getTime() < 30 * 24 * 60 * 60 * 1000) {
    return cached.data;
  }

  const normalizedName = normalizeDrugName(requestedName);
  const aliasedName = DRUG_ALIASES.get(normalizedName);
  const searchTerms = [...new Set([normalizedName, aliasedName].filter(Boolean))];

  try {
    let result = null;
    let matchedTerm = normalizedName;
    for (const term of searchTerms) {
      result = await findLabel(term);
      if (result) {
        matchedTerm = term;
        break;
      }
    }

    if (!result) return { found: false };

    const data = toDrugLabel(result);
    if (matchedTerm !== normalizedName) {
      data.matchedIngredient = matchedTerm;
      data.matchedAlias = requestedName;
    }

    await DrugInfoCache.findOneAndUpdate(
      { drugName: key },
      { data, fetchedAt: new Date() },
      { upsert: true, new: true }
    );
    return data;
  } catch (error) {
    console.error(`[drugInfoService] Label lookup failed for "${key}":`, error.message);
    throw new ApiError(502, "The OpenFDA drug label service is temporarily unavailable. Please try again.");
  }
}
