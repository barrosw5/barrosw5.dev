import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Language-aware replacements for Next's navigation APIs.
 *
 * Always use these instead of `next/link` and `next/navigation`, so links keep
 * the current language prefix: `<Link href="/wishlist">` goes to
 * `/pt/wishlist` when the visitor is on the Portuguese site.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
