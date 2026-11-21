import { useRef } from "react";

/** The longest pause between two taps of the same series. */
const MAX_PAUSE_MS = 700;

/**
 * Runs an action after a series of quick taps.
 *
 * @param times How many taps in a row.
 * @param onDone What to do on the last one.
 * @returns The function to call on each tap.
 */
export function useRepeatedTap(times: number, onDone: () => void) {
  const series = useRef({ count: 0, last: 0 });

  return () => {
    const now = performance.now();
    const { count, last } = series.current;
    const next = now - last <= MAX_PAUSE_MS ? count + 1 : 1;

    if (next >= times) {
      series.current = { count: 0, last: 0 };
      onDone();
    } else {
      series.current = { count: next, last: now };
    }
  };
}
