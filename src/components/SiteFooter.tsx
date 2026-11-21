"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { ClockWheel } from "@/components/ClockWheel";
import { useSiteFooter } from "@/hooks/useSiteFooter";

/**
 * The bottom of every page: where I am with its local time, my profile links
 * and the copyright. Small Geist Mono text, the "system details" of the site.
 */
export function SiteFooter() {
  const t = useTranslations("footer");
  const { places, now, contacts, onCopyrightTap } = useSiteFooter();

  return (
    // pb-28 on the phone leaves room for the navigation pill at the bottom
    <footer className="mx-auto flex w-full max-w-page flex-col gap-4 px-gutter pt-8 pb-28 font-mono text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:pb-10">
      <ClockWheel places={places} now={now} />

      <ul aria-label={t("contacts.label")} className="flex gap-6">
        {contacts.map(({ id, href }) => (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm transition-colors duration-200 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
            >
              {t(`contacts.${id}`)}
              <ArrowUpRight aria-hidden className="size-3" />
              <span className="sr-only">{t("contacts.newTab")}</span>
            </a>
          </li>
        ))}
      </ul>

      {now && (
        <p onClick={onCopyrightTap} className="touch-manipulation select-none">
          {t("copyright", { year: now.getFullYear() })}
        </p>
      )}
    </footer>
  );
}
