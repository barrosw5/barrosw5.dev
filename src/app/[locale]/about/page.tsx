import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageMessage } from "@/components/PageMessage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("about") };
}

// Placeholder until this page's roadmap phase
export default function AboutPage() {
  return <PageMessage kind="underConstruction" />;
}
