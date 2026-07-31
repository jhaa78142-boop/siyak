import { ImageIcon } from "lucide-react";

/**
 * Placeholder block standing in for client-supplied product photography.
 * Swap the children for an <img> tag once real images are available —
 * see README.md "Adding product images" for instructions.
 */
export default function ImagePlaceholder({ label, className = "", aspect = "aspect-[4/3]" }) {
  return (
    <div className={`relative ${aspect} w-full overflow-hidden rounded-2xl bg-teal-pale/30 border border-teal-pale/40 ${className}`}>
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-teal/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal/10 border border-teal/20">
          <ImageIcon size={20} strokeWidth={1.4} />
        </div>
        {label && <span className="text-xs uppercase tracking-[0.22em] text-teal font-medium">{label}</span>}
        <p className="max-w-xs text-[12px] leading-5 text-teal/70">
          Photography available on request — contact us for spec sheets.
        </p>
      </div>
    </div>
  );
}
