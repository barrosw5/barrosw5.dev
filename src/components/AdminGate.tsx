import { useTranslations } from "next-intl";
import { type ReactNode, Suspense, use } from "react";

import { requireAdmin } from "@/hooks/requireAdmin";

interface AdminGateProps {
  children: ReactNode;
  /** The access check; only stories replace it. */
  access?: Promise<void>;
}

function Check({ children, access }: AdminGateProps) {
  // Waits for the check. If it fails it redirects, and children never render
  use(access ?? requireAdmin());
  return children;
}

/**
 * Renders private content only after the server confirms the visitor is the
 * admin. The check reads cookies, so it sits inside `<Suspense>`: nothing
 * private can end up in the prerendered page.
 */
export function AdminGate({ children, access }: AdminGateProps) {
  const t = useTranslations("admin");

  return (
    <Suspense
      fallback={
        <p
          role="status"
          className="flex flex-1 items-center justify-center p-gutter font-mono text-xs text-muted-foreground"
        >
          {t("loading")}
        </p>
      }
    >
      <Check access={access}>{children}</Check>
    </Suspense>
  );
}
