import { Download } from "lucide-react";

/**
 * Trigger button for the catalogue lead-capture popup. The actual PDF
 * download happens inside CatalogueModal once the short form is submitted.
 */
export default function DownloadCatalogue({ className = "", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-ink text-paper font-display uppercase text-sm tracking-[0.15em] px-6 py-3.5 clip-corner transition-colors hover:bg-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/70 min-h-[44px] ${className}`}
      aria-label="Download Siyak Steel company catalogue PDF"
    >
      <Download size={16} aria-hidden="true" />
      Download Catalogue
    </button>
  );
}
