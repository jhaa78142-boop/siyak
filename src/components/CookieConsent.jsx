import { useEffect, useState } from "react";
import { denyAnalytics, enableAnalytics } from "../lib/tracking";

const storageKey = "siyak_analytics_consent";

export default function CookieConsent({ open = false, onClose }) {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage?.getItem(storageKey);
    if (saved) {
      setConsent(saved);
      if (saved === "granted") {
        enableAnalytics();
      }
    }
  }, []);

  const shouldShow = open || consent === null;
  if (!shouldShow) return null;

  const accept = () => {
    enableAnalytics();
    setConsent("granted");
    onClose?.();
  };

  const decline = () => {
    denyAnalytics();
    setConsent("denied");
    onClose?.();
  };

  const close = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto max-w-5xl px-4">
      <div className="rounded-2xl border border-teal/20 bg-ink/95 p-5 text-sm text-paper shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Cookie & analytics preferences</p>
            <p className="mt-1 max-w-2xl text-steel text-[13px] leading-relaxed">
              We use basic cookies and analytics to improve the site. Accept to enable performance tracking, or decline to continue without analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={decline}
              className="rounded-full border border-steel/50 bg-white/10 px-4 py-2 text-[13px] uppercase tracking-[0.15em] text-paper transition hover:border-paper/80 hover:bg-white/15"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={accept}
              className="rounded-full bg-teal px-4 py-2 text-[13px] uppercase tracking-[0.15em] text-ink transition hover:bg-teal-light"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
