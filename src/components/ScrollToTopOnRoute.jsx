import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnRoute() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Give the target page a tick to render before measuring its position.
      const id = hash.replace("#", "");
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "instant" in window ? "instant" : "auto", block: "start" });
          return;
        }
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname, hash]);
  return null;
}
