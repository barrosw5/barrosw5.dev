import { type ReactNode, use } from "react";

import { ProfileProvider } from "@/components/ProfileProvider";
import type { Profile } from "@/core/types/profile";
import { loadProfile } from "@/hooks/loadProfile";

interface SiteProfileProps {
  children: ReactNode;
  /** The profile to use; only stories replace it. */
  profile?: Promise<Profile>;
}

/**
 * Loads the profile on the server and hands it to the page in the browser.
 * The data is cached, so it's already inside the prerendered page.
 */
export function SiteProfile({ children, profile }: SiteProfileProps) {
  return (
    <ProfileProvider profile={use(profile ?? loadProfile())}>
      {children}
    </ProfileProvider>
  );
}
