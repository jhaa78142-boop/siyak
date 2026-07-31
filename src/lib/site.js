import { companyInfo } from "../data/products";

export const siteUrl = (import.meta.env.VITE_SITE_URL || "https://siyaksteel.com").replace(/\/$/, "");
export const siteLogo = `${siteUrl}/siyak-logo.png`;
export const companyName = companyInfo.name;
export const companyTagline = companyInfo.tagline;

export function absoluteUrl(path) {
  if (!path) return siteUrl;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
