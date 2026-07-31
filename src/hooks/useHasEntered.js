import { useEffect, useState } from "react";

/**
 * Returns false until `delayMs` has elapsed since mount, then true forever
 * after. Used by the fixed floating buttons (WhatsApp / Call / Chat) so
 * their one-time entrance animation can have a nice staggered delay, while
 * any later opacity toggles (e.g. hiding behind the cookie banner and
 * reappearing) snap back quickly instead of replaying that same delay.
 */
export default function useHasEntered(delayMs = 0) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return entered;
}
