import { useTranslations } from "next-intl";

/** The admin's first screen. Later phases add their sections around it. */
export function AdminOverview() {
  const t = useTranslations("admin.overview");

  return (
    <section className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center gap-8 px-gutter py-12">
      <p className="font-mono text-xs text-muted-foreground">{t("label")}</p>
      <h1 className="max-w-4xl text-headline text-balance">
        {t("title")}{" "}
        <span className="text-muted-foreground">{t("description")}</span>
      </h1>
    </section>
  );
}
