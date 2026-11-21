import { cacheLife, cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchProfileRow } from "@/core/api/profileApi";
import type { ProfileRow } from "@/core/types/profile";

import { getProfile, PROFILE_CACHE_TAG } from "./profileServerService";
import { getFallbackProfile } from "./profileService";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/core/api/profileApi", () => ({ fetchProfileRow: vi.fn() }));

const row: ProfileRow = {
  about_en: "Hello",
  about_pt: "Olá",
  doing_now_en: "",
  doing_now_pt: "",
  current_place: "pontaDelgada",
  experience: [],
  stack: [],
  education: [],
  certificates: [],
  contacts: [],
};

describe("getProfile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns the database's profile and caches it for long", async () => {
    vi.mocked(fetchProfileRow).mockResolvedValue(row);

    const profile = await getProfile();

    expect(profile.about).toEqual({ en: "Hello", pt: "Olá" });
    expect(profile.currentPlace).toBe("pontaDelgada");
    expect(cacheTag).toHaveBeenCalledWith(PROFILE_CACHE_TAG);
    expect(cacheLife).toHaveBeenCalledExactlyOnceWith("days");
  });

  it("falls back and caches briefly when the database fails", async () => {
    vi.mocked(fetchProfileRow).mockRejectedValue(new Error("down"));

    await expect(getProfile()).resolves.toEqual(getFallbackProfile());
    expect(cacheLife).toHaveBeenCalledExactlyOnceWith("minutes");
    expect(console.error).toHaveBeenCalledOnce();
  });
});
