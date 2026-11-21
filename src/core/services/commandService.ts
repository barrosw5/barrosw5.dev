import type { SealedCommand, UnlistedCommand } from "@/core/types/command";

const unlistedCommands: SealedCommand[] = [
  {
    digest: "24e5e1c2bbef565360c392851175f46821fc21d6725503a600353625b4c9209c",
    target: "5c1400021a1b",
  },
];

const toBytes = (text: string) => new TextEncoder().encode(text);

async function sha256(text: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", toBytes(text));
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function openTarget(sealed: string, key: string): string {
  const keyBytes = toBytes(key);
  const bytes = (sealed.match(/../g) ?? []).map(
    (pair, index) => parseInt(pair, 16) ^ keyBytes[index % keyBytes.length],
  );
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

/**
 * Finds the command that only exists for an exact search. Commands are stored
 * as a digest and a sealed target, which only the matching text can open.
 *
 * @param text What was typed in the palette (case doesn't matter).
 * @param commands The commands to look in; tests pass their own.
 * @returns The command, or `null` if nothing matches or the browser has no
 * Web Crypto (pages not served over HTTPS).
 */
export async function findUnlistedCommand(
  text: string,
  commands: SealedCommand[] = unlistedCommands,
): Promise<UnlistedCommand | null> {
  if (!text || !globalThis.crypto?.subtle) return null;

  const normalized = text.toLowerCase();
  const digest = await sha256(normalized);
  const match = commands.find((command) => command.digest === digest);
  return match
    ? { text, href: openTarget(match.target, normalized) }
    : null;
}
