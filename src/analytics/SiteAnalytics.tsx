"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Browsers driven by a program (our Playwright tests) say so with
 * `navigator.webdriver`: their visits are dropped, so running the e2e tests
 * against the live site doesn't count as hundreds of visitors.
 */
function skipAutomatedBrowsers<Event>(event: Event): Event | null {
  return navigator.webdriver ? null : event;
}

/**
 * Vercel Web Analytics (visits, pages, referrers, countries) and Speed
 * Insights (how fast the site really is on visitors' devices). Both are on
 * Vercel's free plan and use no cookies.
 *
 * Only rendered when the site runs on Vercel (see the layout): their scripts
 * are served by Vercel at /_vercel/..., so anywhere else they would 404.
 */
export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={skipAutomatedBrowsers} />
      <SpeedInsights beforeSend={skipAutomatedBrowsers} />
    </>
  );
}
