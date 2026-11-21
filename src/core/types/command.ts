/** A palette command stored without its text or destination in the clear. */
export interface SealedCommand {
  /** SHA-256 of the text that finds it, in hex. */
  digest: string;
  /** The destination, sealed with that text, in hex. */
  target: string;
}

/** A command found by its exact text. */
export interface UnlistedCommand {
  /** The text as it was typed. */
  text: string;
  /** Path to go to, without the language prefix. */
  href: string;
}
