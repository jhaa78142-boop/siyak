function loadScript(src, onLoad) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.onload = onLoad;
  document.head.appendChild(script);
}

function canTrack() {
  return typeof window !== "undefined" && window.analyticsConsent === "granted";
}

export function enableAnalytics() {
  if (typeof window === "undefined") return;
  window.analyticsConsent = "granted";
  window.localStorage?.setItem("siyak_analytics_consent", "granted");
  window.dataLayer = window.dataLayer || [];

  const gtmId = import.meta.env.VITE_GTM_ID || import.meta.env.VITE_TAG_MANAGER_ID;
  const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || import.meta.env.VITE_GA_ID;

  if (gtmId && !window.gtmInitialized) {
    window.gtmInitialized = true;
    window.dataLayer.push({ event: "gtm.js" });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${gtmId}`);
  } else if (gaId && !window.gtagInitialized) {
    window.gtagInitialized = true;
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      window.gtag("js", new Date());
      window.gtag("config", gaId, { send_page_view: false });
    });
  }
}

export function denyAnalytics() {
  if (typeof window === "undefined") return;
  window.analyticsConsent = "denied";
  window.localStorage?.setItem("siyak_analytics_consent", "denied");
}

export function trackPageView(path) {
  if (!canTrack()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "page_view", page_path: path });
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", { page_path: path });
  }
}

export function trackEvent(name, data = {}) {
  if (!canTrack()) return;
  if (typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent(name, { detail: data }));
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...data });
  if (typeof window.gtag === "function") {
    window.gtag("event", name, data);
  }
}
