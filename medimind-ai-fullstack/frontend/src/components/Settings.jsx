import { useState } from "react";

/**
 * Uncontrolled by default (pass defaultOn). Pass `on` explicitly to make it
 * controlled — used for rows that mirror external state, like dark mode,
 * so the toggle stays in sync when that state changes elsewhere (e.g. the
 * moon icon in Topbar).
 */
export function Toggle({ defaultOn = false, on: controlledOn, onChange }) {
  const [internalOn, setInternalOn] = useState(defaultOn);
  const isControlled = controlledOn !== undefined;
  const on = isControlled ? controlledOn : internalOn;

  const handleClick = () => {
    if (!isControlled) setInternalOn(!on);
    onChange?.(!on);
  };

  return (
    <button
      onClick={handleClick}
      className={`h-6 w-11 rounded-full relative transition-colors shrink-0 ${on ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export function SettingsRow({ icon: Icon, title, description, right }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        {Icon && <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><Icon size={16} /></div>}
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          {description && <p className="text-xs text-slate-400 mt-0.5 max-w-sm">{description}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
