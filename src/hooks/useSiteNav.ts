import { usePathname } from "@/i18n/navigation";

export type NavItemId = "home" | "projects" | "about" | "wishlist";

export interface NavItem {
  id: NavItemId;
  /** Path without the language prefix; `Link` adds it. */
  href: string;
  /** True on this page and on the pages inside it (e.g. a project). */
  isCurrent: boolean;
}

const items: { id: NavItemId; href: string }[] = [
  { id: "home", href: "/" },
  { id: "projects", href: "/projects" },
  { id: "about", href: "/about" },
  { id: "wishlist", href: "/wishlist" },
];

/** The site's main pages, in menu order, with the current one marked. */
export function useSiteNav(): NavItem[] {
  const pathname = usePathname();

  return items.map(({ id, href }) => ({
    id,
    href,
    isCurrent:
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
  }));
}
