import type { ProfileRow } from "@/core/types/profile";

import { createSupabasePublicClient } from "./supabase/publicClient";

const COLUMNS =
  "about_en,about_pt,doing_now_en,doing_now_pt,current_place,experience,stack,education,certificates,contacts";

// The footer is on every page: a stuck request must not hold them all up
const TIMEOUT_MS = 5_000;

/**
 * Reads the single `profile` row.
 *
 * Calls `GET /rest/v1/profile` (see docs/API.md).
 *
 * @returns The row exactly as the database stores it.
 * @throws {PostgrestError} If the request fails, times out or finds no row.
 * @throws {Error} If the environment variables are missing.
 */
export async function fetchProfileRow(): Promise<ProfileRow> {
  const { data, error } = await createSupabasePublicClient()
    .from("profile")
    .select(COLUMNS)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    .single<ProfileRow>();

  if (error) throw error;
  return data;
}
