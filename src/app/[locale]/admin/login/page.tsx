import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminLogin } from "@/components/AdminLogin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.login");
  return { title: t("metaTitle") };
}

export default function AdminLoginPage() {
  return (
    <main id="content" className="flex flex-1 flex-col">
      <AdminLogin />
    </main>
  );
}
