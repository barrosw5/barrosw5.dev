import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { startAdminSignIn } from "@/core/services/authService";
import type { SignInError } from "@/core/types/auth";

export interface AdminLoginState {
  /** False until React takes over the page: the button can't work before. */
  isReady: boolean;
  isPending: boolean;
  hasFailed: boolean;
  signIn: () => Promise<void>;
}

const subscribe = () => () => {};

/** The GitHub sign-in button's state and action. */
export function useAdminLogin(): AdminLoginState {
  const locale = useLocale();
  const isReady = useSyncExternalStore(subscribe, () => true, () => false);
  const [status, setStatus] = useState<"idle" | "pending" | "failed">("idle");

  // Coming back from GitHub with the browser's Back button restores this page
  // exactly as it was, with the button still "pending"
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setStatus("idle");
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return {
    isReady,
    isPending: status === "pending",
    hasFailed: status === "failed",
    signIn: async () => {
      setStatus("pending");
      try {
        await startAdminSignIn(locale, window.location.origin);
      } catch {
        setStatus("failed");
      }
    },
  };
}

/**
 * The error the sign-in came back with (`?error=` in the URL). Reads the URL,
 * so the component using it must be inside `<Suspense>`.
 */
export function useSignInError(): SignInError | null {
  const error = useSearchParams().get("error");
  return error === "denied" || error === "failed" ? error : null;
}
