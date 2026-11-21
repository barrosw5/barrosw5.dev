import { useTranslations } from "next-intl";

import { PageMessage } from "@/components/PageMessage";

// Shown for any address that doesn't exist (see [...rest]/page.tsx), inside
// the normal layout, so it keeps the navigation, theme and language.
export default function NotFound() {
  const t = useTranslations("metadata");

  return (
    <>
      {/* generateMetadata only works in a not-found.tsx at the root of app/,
          so the title goes here; React moves it into <head> */}
      <title>{`${t("notFound")} · ${t("title")}`}</title>
      <PageMessage kind="notFound" />
    </>
  );
}
