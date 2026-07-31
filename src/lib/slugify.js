// Shared slug helper — turns a material-type name like
// "Stainless Steel Pipes & Tubes" into "stainless-steel-pipes-tubes"
// so the same string always resolves to the same URL segment.
export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// SEO-friendly slug generator with additional keywords
export const seoSlug = (name) => {
  const baseSlug = slugify(name);
  const seoSuffix = "stockist-supplier-exporter-in-mumbai-india";
  return `${baseSlug}-${seoSuffix}`;
};

// SEO-enriched slug for product categories (uses the pre-defined slug)
export const catSeoSlug = (slug) => {
  const seoSuffix = "stockist-supplier-exporter-in-mumbai-india";
  return `${slug}-${seoSuffix}`;
};
