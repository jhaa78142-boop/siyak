import ImagePlaceholder from "./ImagePlaceholder";

/**
 * Renders a category's real product photo when `image` is supplied, otherwise
 * falls back to the placeholder block. Keeping this as one component means
 * every product grid/card across the site automatically uses real photography
 * as soon as an `image` is added to that category in src/data/products.js.
 */
export default function ProductImage({ category, className = "", aspect = "aspect-[4/3]" }) {
  if (!category.image) {
    // TODO(real-content): replace with product line photography for this category
    return <ImagePlaceholder label={category.name} className={className} aspect={aspect} />;
  }

  return (
    <div className={`relative ${aspect} w-full overflow-hidden ${className}`}>
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ filter: "contrast(1.06) saturate(1.12) brightness(1.02)" }}
      />

    </div>
  );
}
