import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

// Search engines never list anything in here
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Without a `messages` prop it sends every translation, including the
// admin's, which the public pages don't receive
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
