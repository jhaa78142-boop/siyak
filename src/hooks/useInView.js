import { useEffect, useRef, useState } from "react";

/**
 * Triggers `true` once the element enters the viewport, then stays true.
 * Used to drive scroll-reveal animations across the site.
 */
export function useInView(options = { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}
