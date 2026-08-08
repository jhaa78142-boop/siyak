import ImagePlaceholder from "./ImagePlaceholder";

/**
 * Renders a category's real product photo when `image` is supplied, otherwise
 * falls back to the placeholder block. Keeping this as one component means
 * every product grid/card across the site automatically uses real photography
 * as soon as an `image` is added to that category in src/data/products.js.
 *
 * Cropping strategy: industrial product photos often have blank/black ceiling
 * space at the top, so we prefer the lower two-thirds of the frame —
 * `object-position: 50% 68%` biases the visible area toward the actual
 * product (pipes, flanges, etc.) rather than the warehouse/studio background.
 */
export default function ProductImage({ category, className = "", aspect = "aspect-[4/3]" }) {
  if (!category.image) {
    // TODO(real-content): replace with product line photography for this category
    return <ImagePlaceholder label={category.name} className={className} aspect={aspect} />;
  }

  return (
    <div className={`relative ${aspect} w-full overflow-hidden bg-gray-200 ${className}`}>
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: "50% 70%",
          filter: "contrast(1.08) saturate(1.16) brightness(1.05)",
          transform: "scale(1.04)",
          transformOrigin: "50% 70%",
        }}
      />
    </div>
  );
}
