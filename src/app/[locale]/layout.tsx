import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { languageTags, routing } from "@/i18n/routing";
import { geistMono, geistSans } from "@/lib/fonts";
import { themeScript } from "@/theme/theme";

import "../globals.css";

// Required with cacheComponents: prerender every page in every language
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={languageTags[locale]}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // themeScript adds the `dark` class before React loads, so the <html>
      // in the browser differs from the server's on purpose
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
