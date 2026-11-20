import { useSyncExternalStore } from "react";

/** Not in TypeScript's DOM types yet (only Chromium browsers have it). */
interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform: string };
}

/**
 * Asks the browser which system it runs on. `userAgentData.platform` is the
 * modern way ("macOS", "Windows"...); `navigator.platform` ("MacIntel",
 * "Win32"...) is older but works everywhere, including Safari and Firefox.
 */
function readIsMac() {
  const nav = navigator as NavigatorWithUAData;
  const platform = nav.userAgentData?.platform || nav.platform;
  return /mac|iphone|ipad/i.test(platform);
}

// The system never changes while the page is open: nothing to listen to
const subscribe = () => () => {};

/**
 * True on Apple systems (shortcuts use ⌘), false elsewhere (they use Ctrl).
 * `null` on the server, which can't know the visitor's system.
 */
export function useIsMac(): boolean | null {
  return useSyncExternalStore(subscribe, readIsMac, () => null);
}
