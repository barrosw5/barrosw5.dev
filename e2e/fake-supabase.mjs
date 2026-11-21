/**
 * A tiny stand-in for Supabase Auth, only for the e2e tests: CI can't sign in
 * to a real GitHub account. It has its own signing key and issues real signed
 * tokens, so the site's production code runs unchanged, signature checks
 * included. Started by playwright.config.ts.
 *
 * Accounts: `admin` (has the role) and `visitor` (a valid GitHub login without
 * it, who also wrote `role: admin` in the user_metadata they can edit).
 */
import { createServer } from "node:http";
import { generateKeyPairSync, randomUUID, sign } from "node:crypto";

const port = Number(process.argv[2]);
const siteOrigin = process.argv[3];
const origin = `http://127.0.0.1:${port}`;

const newKey = () => generateKeyPairSync("ec", { namedCurve: "P-256" });
const signingKey = newKey();
const unknownKey = newKey();
const kid = randomUUID();

const base64url = (value) => Buffer.from(value).toString("base64url");

function createToken(account, expiresAt, key) {
  const header = base64url(JSON.stringify({ alg: "ES256", kid, typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: `${origin}/auth/v1`,
      sub: account === "admin" ? "00000000-0000-4000-8000-000000000001" : "00000000-0000-4000-8000-000000000002",
      aud: "authenticated",
      role: "authenticated",
      iat: expiresAt - 3600,
      exp: expiresAt,
      session_id: randomUUID(),
      app_metadata: account === "admin" ? { provider: "github", role: "admin" } : { provider: "github" },
      user_metadata: account === "admin" ? {} : { role: "admin" },
    }),
  );
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
    key: key.privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return `${header}.${payload}.${signature.toString("base64url")}`;
}

function createSession(account, { expired = false, forged = false } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = expired ? now - 60 : now + 3600;
  return {
    access_token: createToken(account, expiresAt, forged ? unknownKey : signingKey),
    token_type: "bearer",
    expires_in: expired ? 0 : 3600,
    expires_at: expiresAt,
    refresh_token: `refresh-${account}`,
    user: {
      id: account,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: {},
      created_at: new Date(0).toISOString(),
    },
  };
}

const isAccount = (value) => value === "admin" || value === "visitor";

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || "{}");
}

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (request.method === "OPTIONS") return send(response, 204);

  const url = new URL(request.url, origin);

  if (url.pathname === "/health") return send(response, 200, { ok: true });

  if (url.pathname === "/auth/v1/.well-known/jwks.json") {
    const jwk = signingKey.publicKey.export({ format: "jwk" });
    return send(response, 200, {
      keys: [{ ...jwk, kid, alg: "ES256", use: "sig", key_ops: ["verify"] }],
    });
  }

  // GitHub's part: signs in whoever the test's cookie says, and goes back
  if (url.pathname === "/auth/v1/authorize") {
    const chosen = /fake-account=(\w+)/.exec(request.headers.cookie ?? "")?.[1];
    const back = new URL(url.searchParams.get("redirect_to"));
    const target = new URL(back.pathname, siteOrigin);
    target.searchParams.set("code", isAccount(chosen) ? chosen : "admin");
    response.writeHead(302, { Location: target.href });
    return response.end();
  }

  if (url.pathname === "/auth/v1/token" && request.method === "POST") {
    const body = await readJson(request);
    const grant = url.searchParams.get("grant_type");
    const account =
      grant === "pkce" && body.code_verifier
        ? body.auth_code
        : grant === "refresh_token"
          ? body.refresh_token?.replace("refresh-", "")
          : null;
    if (!isAccount(account)) {
      return send(response, 400, {
        error_code: "bad_code_verifier",
        msg: "Invalid code",
      });
    }
    return send(response, 200, createSession(account));
  }

  if (url.pathname === "/auth/v1/logout") return send(response, 204);

  // The public profile. Its links differ from the site's fallback ones, so a
  // test can tell that they really came from the database
  if (url.pathname === "/rest/v1/profile") {
    return send(response, 200, {
      about_en: "",
      about_pt: "",
      doing_now_en: "",
      doing_now_pt: "",
      current_place: "lisbon",
      experience: [],
      stack: [],
      education: [],
      certificates: [],
      contacts: [
        { id: "github", href: "https://github.com/e2e-profile" },
        { id: "linkedin", href: "https://www.linkedin.com/in/e2e-profile/" },
      ],
    });
  }

  // For tests that start already signed in
  if (url.pathname === "/__test/session") {
    const account = url.searchParams.get("account");
    if (!isAccount(account)) return send(response, 400, {});
    return send(
      response,
      200,
      createSession(account, {
        expired: url.searchParams.has("expired"),
        forged: url.searchParams.has("forged"),
      }),
    );
  }

  return send(response, 404, { msg: "Not found" });
});

server.listen(port, "127.0.0.1");
