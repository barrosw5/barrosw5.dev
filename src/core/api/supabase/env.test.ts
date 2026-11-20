import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseEnv } from "./env";

describe("getSupabaseEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the URL and the publishable key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(getSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("names every missing variable", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => getSupabaseEnv()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });

  it("names only the missing one", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => getSupabaseEnv()).toThrow(
      /Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\./,
    );
  });
});
