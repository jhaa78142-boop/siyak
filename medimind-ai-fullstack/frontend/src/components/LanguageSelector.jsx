import { ChevronDown, Languages } from "lucide-react";
import { supportedLanguages, useI18n } from "../lib/I18nContext";

export default function LanguageSelector({ className = "" }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className={`inline-flex h-10 w-[148px] shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-slate-600 shadow-sm transition-colors hover:border-slate-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15 ${className}`}>
      <Languages size={15} className="shrink-0 text-slate-500" aria-hidden="true" />
      <span className="sr-only">{t("Language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t("Language")}
        className="min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-medium text-slate-700 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
      >
        {supportedLanguages.map(({ code, label }) => (
          <option key={code} value={code} className="text-slate-900">
            {label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
    </label>
  );
}
