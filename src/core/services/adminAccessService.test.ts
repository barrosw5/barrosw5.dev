import { describe, expect, it } from "vitest";

import { adminRedirect, isAdminPath, resolveAccess } from "./adminAccessService";

describe("resolveAccess", () => {
  it("is anonymous without a session", () => {
    expect(resolveAccess(null)).toBe("anonymous");
  });

  it("is admin only with the role in app_metadata", () => {
    expect(resolveAccess({ app_metadata: { role: "admin" } })).toBe("admin");
  });

  it.each([
    ["no metadata", {}],
    ["another role", { app_metadata: { role: "editor" } }],
    ["a role that isn't a string", { app_metadata: { role: ["admin"] } }],
  ])("denies %s", (_name, claims) => {
    expect(resolveAccess(claims)).toBe("denied");
  });

  it("ignores user_metadata, which users can edit themselves", () => {
    const forged = { app_metadata: {}, user_metadata: { role: "admin" } };
    expect(resolveAccess(forged)).toBe("denied");
  });
});

describe("isAdminPath", () => {
  it.each(["/en/admin", "/pt/admin", "/en/admin/login", "/pt/admin/a/b"])(
    "%s is private",
    (path) => expect(isAdminPath(path)).toBe(true),
  );

  it.each(["/en", "/admin", "/en/administrator", "/en/about/admin", "/fr/admin"])(
    "%s is not",
    (path) => expect(isAdminPath(path)).toBe(false),
  );
});

describe("adminRedirect", () => {
  it("lets the admin in", () => {
    expect(adminRedirect("/pt/admin", "admin")).toBeNull();
  });

  it("sends anonymous visitors to the login, in their language", () => {
    expect(adminRedirect("/pt/admin", "anonymous")).toBe("/pt/admin/login");
    expect(adminRedirect("/en/admin/x", "anonymous")).toBe("/en/admin/login");
  });

  it("tells other accounts they have no access", () => {
    expect(adminRedirect("/en/admin", "denied")).toBe(
      "/en/admin/login?error=denied",
    );
  });

  it("shows the login to anyone who isn't the admin, without a loop", () => {
    expect(adminRedirect("/en/admin/login", "anonymous")).toBeNull();
    expect(adminRedirect("/en/admin/login", "denied")).toBeNull();
  });

  it("takes the admin past the login", () => {
    expect(adminRedirect("/pt/admin/login", "admin")).toBe("/pt/admin");
  });

  it("ignores public pages", () => {
    expect(adminRedirect("/en/about", "anonymous")).toBeNull();
  });
});
