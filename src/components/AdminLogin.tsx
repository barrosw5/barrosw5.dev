"use client";

import { ArrowLeft, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { useAdminLogin, useSignInError } from "@/hooks/useAdminLogin";
import { Link } from "@/i18n/navigation";

function ErrorText({ children }: { children: string }) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {children}
    </p>
  );
}

// Apart, because reading the URL can't be part of the prerendered page: the
// rest of the screen still loads instantly
function ReturnedError() {
  const t = useTranslations("admin.login.errors");
  const error = useSignInError();
  return error ? <ErrorText>{t(error)}</ErrorText> : null;
}

/**
 * The sign-in screen: same look as the site's whole-page messages, with one
 * button that continues on GitHub (login, password and 2FA happen there).
 */
export function AdminLogin() {
  const t = useTranslations("admin.login");
  const { isReady, isPending, hasFailed, signIn } = useAdminLogin();

  return (
    <section className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center gap-8 px-gutter py-12">
      <p className="font-mono text-xs text-muted-foreground">{t("label")}</p>
      <h1 className="max-w-4xl text-display text-balance">
        {t("title")}{" "}
        <span className="text-muted-foreground">{t("description")}</span>
      </h1>

      {hasFailed ? (
        <ErrorText>{t("errors.failed")}</ErrorText>
      ) : (
        <Suspense fallback={null}>
          <ReturnedError />
        </Suspense>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="lg"
          className="rounded-full px-4"
          disabled={!isReady || isPending}
          onClick={signIn}
        >
          <LogIn aria-hidden />
          {isPending ? t("pending") : t("button")}
        </Button>
        <Button asChild variant="ghost" size="lg" className="rounded-full px-4">
          <Link href="/">
            <ArrowLeft aria-hidden />
            {t("back")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
