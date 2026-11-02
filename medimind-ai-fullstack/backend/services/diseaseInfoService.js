import DiseaseInfoCache from "../models/DiseaseInfoCache.js";

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15000;
const NOT_FOUND = {
  found: false,
  title: null,
  extract: null,
  thumbnail: null,
  wikipediaUrl: null,
};

const WIKI_HEADERS = {
  Accept: "application/json",
  // Wikipedia asks API clients to identify themselves
  "User-Agent": "MediMindAI/1.0 (disease-info; educational healthcare app)",
};

async function wikiFetch(params) {
  const url = new URL(WIKI_API);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      signal: ctrl.signal,
      headers: WIKI_HEADERS,
    });
    if (!res.ok) throw new Error(`wiki ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve a search term to the best Wikipedia page title via Action API. */
async function resolveTitle(term) {
  // Prefer opensearch — good at resolving common names / redirects
  try {
    const os = await wikiFetch({
      action: "opensearch",
      search: term,
      limit: 1,
      namespace: 0,
    });
    const title = os?.[1]?.[0];
    if (title) return title;
  } catch {
    // fall through to list=search
  }

  const data = await wikiFetch({
    action: "query",
    list: "search",
    srsearch: term,
    srlimit: 1,
    srnamespace: 0,
  });
  return data?.query?.search?.[0]?.title || null;
}

/** Fetch intro extract + thumbnail + canonical URL for a page title. */
async function fetchPageSummary(title) {
  const data = await wikiFetch({
    action: "query",
    prop: "extracts|pageimages|info",
    titles: title,
    redirects: 1,
    exintro: 1,
    explaintext: 1,
    exsectionformat: "plain",
    pithumbsize: 500,
    inprop: "url",
  });

  const pages = data?.query?.pages;
  if (!pages) return NOT_FOUND;

  const page = Object.values(pages)[0];
  if (!page || page.missing != null || page.invalid != null) return NOT_FOUND;

  const extract = (page.extract || "").trim();
  if (!extract) return NOT_FOUND;

  return {
    found: true,
    title: page.title || title,
    extract,
    thumbnail: page.thumbnail?.source || null,
    wikipediaUrl:
      page.fullurl ||
      `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title || title).replace(/%20/g, "_")}`,
  };
}

export async function getDiseaseSummary(term) {
  const key = (term || "").toLowerCase().trim();
  if (!key) return { ...NOT_FOUND };

  const cached = await DiseaseInfoCache.findOne({ term: key });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return cached.data;
  }

  let result = { ...NOT_FOUND };

  try {
    const resolvedTitle = await resolveTitle(term);
    if (resolvedTitle) {
      result = await fetchPageSummary(resolvedTitle);
    } else {
      // Last resort: try the raw term as a page title (handles exact matches)
      result = await fetchPageSummary(term);
    }
  } catch {
    result = { ...NOT_FOUND };
  }

  await DiseaseInfoCache.findOneAndUpdate(
    { term: key },
    { data: result, fetchedAt: new Date() },
    { upsert: true, new: true }
  );

  return result;
}
