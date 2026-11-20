import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

// Checks the clock every second, but the snapshot only changes once a
// minute, so components re-render once a minute
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** Minutes since 1970: a number, so React can tell when it really changed. */
const getMinute = () => Math.floor(Date.now() / MINUTE);

/**
 * The current time, to the minute, kept up to date.
 *
 * `null` on the server: the page is prerendered once, so a time read there
 * would be wrong for every visitor (Next's Cache Components also forbid
 * `new Date()` while prerendering). The browser fills it in right away.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getMinute, () => null);
  return minute === null ? null : new Date(minute * MINUTE);
}
