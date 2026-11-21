import { connection } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionClaims } from "./authServerApi";
import { createSupabaseServerClient } from "./supabase/serverClient";

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("./supabase/serverClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("getSessionClaims", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getClaims: async () => ({ data: { claims: { sub: "id" } }, error: null }),
      },
    } as never);
  });

  // Regression: Supabase reads the clock (Date.now) to check the token, which
  // Next refuses while prerendering ("Blocking Route" in the dev overlay)
  it("waits for a real request before touching Supabase", async () => {
    await getSessionClaims();

    expect(connection).toHaveBeenCalledOnce();
    expect(vi.mocked(connection).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(createSupabaseServerClient).mock.invocationCallOrder[0],
    );
  });
});
