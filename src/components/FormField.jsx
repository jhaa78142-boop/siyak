/**
 * Form field wrapper — label + input/select/textarea + optional error.
 * `required` prop adds a visible asterisk and exposes the intent to screen readers.
 */
export default function FormField({ label, error, children, className = "", required = false }) {
  return (
    <label className={`block text-xs font-semibold uppercase tracking-wide text-steel-dark ${className}`}>
      <span className="inline-flex items-center gap-1">
        {label}
        {required && (
          <span className="text-amber" aria-label="required">*</span>
        )}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-[11px] text-[var(--color-amber)]">{error}</p>}
    </label>
  );
}
