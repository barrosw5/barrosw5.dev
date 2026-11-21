import { notFound } from "next/navigation";

// Catches every address that no other page matches (e.g. /en/abc) and shows
// ../not-found.tsx. Without it, Next would show its own plain 404, outside
// our layout, because the layout lives under [locale].
export default function CatchAll() {
  notFound();
}
