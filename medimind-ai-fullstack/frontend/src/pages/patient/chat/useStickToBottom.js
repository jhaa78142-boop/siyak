import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sticky bottom scroll that stays smooth under streaming updates.
 * - While near bottom: pin with instant scroll (no smooth fight)
 * - When user scrolls up: show "jump to latest" affordance
 */
export function useStickToBottom(deps = []) {
  const scrollerRef = useRef(null);
  const endRef = useRef(null);
  const stickRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const rafRef = useRef(0);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distance < 96;
    stickRef.current = near;
    setShowJump(!near);
  }, []);

  const jumpToLatest = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    stickRef.current = true;
    setShowJump(false);
    el.scrollTop = el.scrollHeight;
  }, []);

  const schedulePin = useCallback(() => {
    if (!stickRef.current) return;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = scrollerRef.current;
      if (!el || !stickRef.current) return;
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const onScroll = () => measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [measure]);

  useEffect(() => {
    schedulePin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return { scrollerRef, endRef, showJump, jumpToLatest, schedulePin };
}
