import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  endServerSession,
  exchangeCodeForClaims,
} from "@/core/api/authServerApi";

import { completeSignIn } from "./adminSessionService";

vi.mock("@/core/api/authServerApi", () => ({
  endServerSession: vi.fn(),
  exchangeCodeForClaims: vi.fn(),
  getSessionClaims: vi.fn(),
}));

describe("completeSignIn", () => {
  beforeEach(() => vi.resetAllMocks());

  it("fails without a code, without calling Supabase", async () => {
    await expect(completeSignIn(null)).resolves.toBe("failed");
    expect(exchangeCodeForClaims).not.toHaveBeenCalled();
  });

  it("keeps the admin signed in", async () => {
    vi.mocked(exchangeCodeForClaims).mockResolvedValue({
      app_metadata: { role: "admin" },
    });
    await expect(completeSignIn("code")).resolves.toBeNull();
    expect(endServerSession).not.toHaveBeenCalled();
  });

  it("signs any other account out on the spot", async () => {
    vi.mocked(exchangeCodeForClaims).mockResolvedValue({ app_metadata: {} });
    await expect(completeSignIn("code")).resolves.toBe("denied");
    expect(endServerSession).toHaveBeenCalledOnce();
  });

  it("reports a bad code as a failure", async () => {
    vi.mocked(exchangeCodeForClaims).mockRejectedValue(new Error("bad code"));
    await expect(completeSignIn("code")).resolves.toBe("failed");
  });
});
