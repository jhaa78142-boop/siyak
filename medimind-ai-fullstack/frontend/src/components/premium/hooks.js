import { useEffect, useState, useSyncExternalStore } from "react";

const IS_BROWSER = typeof window !== "undefined";

export function useIsTouch() {
  return useSyncExternalStore(
    () => () => {},
    () =>
      IS_BROWSER &&
      (window.matchMedia?.("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0),
    () => false
  );
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!IS_BROWSER) return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener?.("change", onStoreChange);
      return () => mq.removeEventListener?.("change", onStoreChange);
    },
    () => IS_BROWSER && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

export function useIsLowEnd() {
  const touch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const [lowCpu, setLowCpu] = useState(false);
  useEffect(() => {
    if (!IS_BROWSER) return;
    const mem = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency || 4;
    setLowCpu((mem && mem < 4) || cores < 6);
  }, []);
  return touch || reduced || lowCpu;
}

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!IS_BROWSER) return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener?.("change", onStoreChange);
      return () => mq.removeEventListener?.("change", onStoreChange);
    },
    () => IS_BROWSER && window.matchMedia(query).matches,
    () => false
  );
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    if (!IS_BROWSER) return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota */
    }
  }, [key, value]);
  return [value, setValue];
}
