import { useLocale } from "next-intl";
import { useState } from "react";

import { endAdminSession } from "@/core/services/authService";
import { getPathname, usePathname } from "@/i18n/navigation";

export type AdminNavId = "overview";

export interface AdminNavItem {
  id: AdminNavId;
  href: string;
  isCurrent: boolean;
}

export interface AdminShellState {
  items: AdminNavItem[];
  isSigningOut: boolean;
  signOutFailed: boolean;
  signOut: () => Promise<void>;
}

// Each roadmap phase adds its section here
const items: { id: AdminNavId; href: string }[] = [
  { id: "overview", href: "/admin" },
];

/** The admin navigation and the sign-out action. */
export function useAdminShell(): AdminShellState {
  const locale = useLocale();
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "pending" | "failed">("idle");

  return {
    items: items.map((item) => ({
      ...item,
      isCurrent: pathname === item.href,
    })),
    isSigningOut: status === "pending",
    signOutFailed: status === "failed",
    signOut: async () => {
      setStatus("pending");
      try {
        await endAdminSession();
        // A full page load, so nothing private stays in the router's memory
        window.location.assign(getPathname({ href: "/admin/login", locale }));
      } catch {
        setStatus("failed");
      }
    },
  };
}
