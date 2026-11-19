import { useTranslations } from "next-intl";

/**
 * Temporary home content until the "About me" section (roadmap phase 2).
 */
export function Welcome() {
  const t = useTranslations("welcome");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        {t("description")}
      </p>
    </main>
  );
}
