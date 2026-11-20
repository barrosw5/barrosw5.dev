import { useTranslations } from "next-intl";

/**
 * Temporary home content until the "About me" section (roadmap phase 2).
 * A two-tone headline: the name in full colour, the line after it in grey.
 */
export function Welcome() {
  const t = useTranslations("welcome");

  return (
    <main className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center px-gutter py-section">
      <h1 className="max-w-4xl text-display text-balance">
        {t("title")}{" "}
        <span className="text-muted-foreground">{t("description")}</span>
      </h1>
    </main>
  );
}
