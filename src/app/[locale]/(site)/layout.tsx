import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteProfile } from "@/components/SiteProfile";

// The public site's frame. "(site)" is a route group: it organises the pages
// without appearing in the URL, so /en/about still is /en/about, and the admin
// can have a frame of its own.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteProfile>
      <SiteHeader />
      <main id="content" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </SiteProfile>
  );
}
