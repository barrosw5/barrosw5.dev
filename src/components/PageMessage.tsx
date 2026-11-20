import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export type PageMessageKind = "notFound" | "underConstruction";

/**
 * A whole-page message: a small mono label, a two-tone headline and a way
 * back home. Used by the 404 page and by pages that aren't built yet.
 *
 * It fills the free height of the page and sits in its middle (flex-1 +
 * justify-center), so it never pushes the footer below the screen when there
 * is room. The padding is only a minimum: md:pt-24 keeps it clear of the
 * navigation pill at the top on desktop.
 */
export function PageMessage({ kind }: { kind: PageMessageKind }) {
  const t = useTranslations("pageMessage");

  return (
    <section className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center gap-8 px-gutter py-12 md:pt-24">
      <p className="font-mono text-xs text-muted-foreground">
        {t(`${kind}.label`)}
      </p>
      <h1 className="max-w-4xl text-display text-balance">
        {t(`${kind}.title`)}{" "}
        <span className="text-muted-foreground">
          {t(`${kind}.description`)}
        </span>
      </h1>
      <Button asChild variant="outline" size="lg" className="w-fit rounded-full px-4">
        <Link href="/">
          <ArrowLeft aria-hidden />
          {t("back")}
        </Link>
      </Button>
    </section>
  );
}
