import type { BrowserContext, Page } from "@playwright/test";

import { fakeSupabaseURL } from "../playwright.config";
import { expect, type Locale, test, text } from "./fixtures";

const en = text("en");
const locales: Locale[] = ["en", "pt"];

// Supabase names its cookie after the first part of the project's host
const sessionCookie = "sb-127-auth-token";

const signInButton = (page: Page, locale: Locale) =>
  page.getByRole("button", { name: text(locale).admin.login.button });

const panelHeading = (page: Page, locale: Locale) =>
  page.getByRole("heading", {
    level: 1,
    name: `${text(locale).admin.overview.title} ${text(locale).admin.overview.description}`,
  });

// By its text: Next has an empty role="alert" of its own on every page, which
// announces page changes to screen readers
const errorMessage = (page: Page, message: string) =>
  page.getByRole("alert").filter({ hasText: message });

/** Starts the test signed in, with a session from the fake Supabase. */
async function startSignedIn(
  context: BrowserContext,
  baseURL: string,
  query: string,
) {
  const session = await (
    await context.request.get(`${fakeSupabaseURL}/__test/session?${query}`)
  ).text();
  await context.addCookies([
    {
      name: sessionCookie,
      value: `base64-${Buffer.from(session).toString("base64url")}`,
      url: baseURL,
    },
  ]);
}

/** Who "GitHub" signs in as when the sign-in button is clicked. */
const signInAs = (context: BrowserContext, account: "admin" | "visitor") =>
  context.addCookies([
    { name: "fake-account", value: account, url: fakeSupabaseURL, sameSite: "Lax" },
  ]);

const hasSession = async (context: BrowserContext, baseURL: string) =>
  (await context.cookies(baseURL)).some(
    ({ name, value }) => name.startsWith(sessionCookie) && !name.includes("verifier") && value !== "",
  );

test.describe("without a session", () => {
  for (const locale of locales) {
    test(`/${locale}/admin goes to the login, in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/admin`);
      await expect(page).toHaveURL(`/${locale}/admin/login`);
      await expect(signInButton(page, locale)).toBeEnabled();
      await expect(panelHeading(page, locale)).toBeHidden();
    });
  }

  test("an address without a language gets one, then the login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/en/admin/login");
  });

  test("the login is hidden from search engines", async ({ page }) => {
    await page.goto("/en/admin/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("public pages don't carry the admin's address or texts", async ({ request }) => {
    for (const path of ["/en", "/pt", "/en/about"]) {
      const html = await (await request.get(path)).text();
      expect(html).not.toContain("/admin");
      expect(html).not.toContain(en.admin.login.description);
      expect(html).not.toContain(text("pt").admin.login.description);
    }
  });
});

// These need the fake Supabase, which only exists when the site runs locally
test.describe("signing in", () => {
  test.skip(!!process.env.E2E_BASE_URL, "needs the fake Supabase");

  for (const locale of locales) {
    test(`the admin gets in and stays in ${locale}`, async ({ page, context }) => {
      await signInAs(context, "admin");
      await page.goto(`/${locale}/admin/login`);
      await signInButton(page, locale).click();

      await expect(page).toHaveURL(`/${locale}/admin`);
      await expect(panelHeading(page, locale)).toBeVisible();
    });
  }

  test("another GitHub account is refused and keeps no session", async ({
    page,
    context,
    baseURL,
  }) => {
    await signInAs(context, "visitor");
    await page.goto("/en/admin/login");
    await signInButton(page, "en").click();

    await expect(page).toHaveURL("/en/admin/login?error=denied");
    await expect(errorMessage(page, en.admin.login.errors.denied)).toBeVisible();
    expect(await hasSession(context, baseURL!)).toBe(false);
  });

  test("a bad code fails cleanly", async ({ page }) => {
    await page.goto("/api/auth/callback/en?code=nope");
    await expect(page).toHaveURL("/en/admin/login?error=failed");
    await expect(errorMessage(page, en.admin.login.errors.failed)).toBeVisible();
  });

  test("the callback can't be used to leave the site", async ({ page, baseURL }) => {
    await page.goto("/api/auth/callback/en?code=nope&next=https://example.com");
    expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
  });
});

test.describe("with a session", () => {
  test.skip(!!process.env.E2E_BASE_URL, "needs the fake Supabase");

  test("the admin skips the login", async ({ page, context, baseURL }) => {
    await startSignedIn(context, baseURL!, "account=admin");
    await page.goto("/pt/admin/login");
    await expect(page).toHaveURL("/pt/admin");
    await expect(panelHeading(page, "pt")).toBeVisible();
  });

  test("an expired session is renewed", async ({ page, context, baseURL }) => {
    await startSignedIn(context, baseURL!, "account=admin&expired");
    const before = (await context.cookies(baseURL!)).find(
      ({ name }) => name === sessionCookie,
    )?.value;

    await page.goto("/en/admin");
    await expect(panelHeading(page, "en")).toBeVisible();

    const after = (await context.cookies(baseURL!)).find(
      ({ name }) => name === sessionCookie,
    )?.value;
    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
  });

  test("a token signed with another key is rejected", async ({
    page,
    context,
    baseURL,
  }) => {
    await startSignedIn(context, baseURL!, "account=admin&forged");
    await page.goto("/en/admin");
    await expect(page).toHaveURL("/en/admin/login");
    await expect(panelHeading(page, "en")).toBeHidden();
  });

  test("role: admin in user_metadata opens nothing", async ({
    page,
    context,
    baseURL,
  }) => {
    await startSignedIn(context, baseURL!, "account=visitor");
    await page.goto("/en/admin");
    await expect(page).toHaveURL("/en/admin/login?error=denied");
    await expect(panelHeading(page, "en")).toBeHidden();
  });

  test("private responses are never stored", async ({ page, context, baseURL }) => {
    await startSignedIn(context, baseURL!, "account=admin");
    const response = await page.goto("/en/admin");
    expect(response?.headers()["cache-control"]).toMatch(/no-store/);
  });

  test("the admin has its own frame, without the public nav", async ({
    page,
    context,
    baseURL,
  }) => {
    await startSignedIn(context, baseURL!, "account=admin");
    await page.goto("/en/admin");
    await expect(page.getByRole("navigation", { name: en.admin.nav.label })).toBeVisible();
    await expect(page.getByRole("navigation", { name: en.nav.label })).toBeHidden();
  });

  test("signing out ends the access", async ({ page, context, baseURL }) => {
    await startSignedIn(context, baseURL!, "account=admin");
    await page.goto("/en/admin");
    await expect(panelHeading(page, "en")).toBeVisible();

    await page.getByRole("button", { name: en.admin.nav.signOut }).click();
    await expect(page).toHaveURL("/en/admin/login");
    expect(await hasSession(context, baseURL!)).toBe(false);

    await page.goto("/en/admin");
    await expect(page).toHaveURL("/en/admin/login");
  });
});
