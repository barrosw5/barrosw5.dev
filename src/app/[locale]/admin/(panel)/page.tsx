import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminOverview } from "@/components/AdminOverview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.overview");
  return { title: t("metaTitle") };
}

export default function AdminPage() {
  return <AdminOverview />;
}
