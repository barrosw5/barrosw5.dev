"use client";

import type { ReactNode } from "react";

import type { Profile } from "@/core/types/profile";
import { ProfileContext } from "@/hooks/useProfile";

interface ProfileProviderProps {
  profile: Profile;
  children: ReactNode;
}

/** Makes the profile available to `useProfile` in everything inside it. */
export function ProfileProvider({ profile, children }: ProfileProviderProps) {
  return <ProfileContext value={profile}>{children}</ProfileContext>;
}
