import { useTranslations } from "next-intl";

import { RevealHeadline } from "@/components/RevealHeadline";

/**
 * Temporary home content until the "About me" section (roadmap phase 2).
 * A two-tone headline: the name in full colour, the line after it in grey.
 */
export function Welcome() {
  const t = useTranslations("welcome");

  return (
    <section className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center px-gutter py-12 md:pt-24">
      <RevealHeadline
        parts={[
          { text: t("title") },
          { text: t("description"), muted: true },
        ]}
        className="max-w-4xl text-display text-balance"
      />
    </section>
  );
}
