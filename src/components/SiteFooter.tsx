"use client";

import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatTime } from "@/core/utils/formatTime";
import { useSiteFooter } from "@/hooks/useSiteFooter";

/**
 * The bottom of every page: where I am with its local time, my profile links
 * and the copyright. Small Geist Mono text, the "system details" of the site.
 */
export function SiteFooter() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const { place, now, contacts } = useSiteFooter();

  return (
    // pb-28 on the phone leaves room for the navigation pill at the bottom
    <footer className="mx-auto flex w-full max-w-page flex-col gap-4 px-gutter pt-8 pb-28 font-mono text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:pb-10">
      <p className="flex items-center gap-2">
        {/* Red dot = live */}
        <span aria-hidden className="size-1.5 rounded-full bg-status-live" />
        <span>{t(`places.${place.id}`)}</span>
        <span aria-hidden>·</span>
        {now ? (
          <time dateTime={now.toISOString()}>
            {formatTime(now, locale, place.timeZone)}
          </time>
        ) : (
          // Until the browser knows the time: keeps the space, no jump
          <span aria-hidden className="invisible">
            00:00
          </span>
        )}
      </p>

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

      {now && <p>{t("copyright", { year: now.getFullYear() })}</p>}
    </footer>
  );
}
