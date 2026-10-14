import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/admin/api.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const { createAdminApi, normalizeApiBase, AdminApiError, withTimeout } =
  await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
const presentation = await readFile(
  new URL("../src/admin/presentation.ts", import.meta.url),
  "utf8",
);
const { statusTone } = await import(
  `data:text/javascript;base64,${Buffer.from(ts.transpileModule(presentation, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText).toString("base64")}`
);
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("accepts origin or canonical version base without duplicating the version", () => {
  for (const url of [
    "https://api.chorezy.com",
    "https://api.chorezy.com/api/v1/",
  ])
    assert.equal(normalizeApiBase(url), "https://api.chorezy.com/api/v1/admin");
  assert.equal(
    normalizeApiBase("http://127.0.0.1:4059"),
    "http://127.0.0.1:4059/api/v1/admin",
  );
});
test("rejects insecure remote, credential-bearing, query and non-HTTP API URLs", () => {
  for (const url of [
    "http://api.chorezy.com",
    "https://user:secret@example.com",
    "https://api.chorezy.com?token=secret",
    "javascript:alert(1)",
  ])
    assert.throws(() => normalizeApiBase(url));
});
test("no staff session means no API request at all", async () => {
  let called = false;
  await assert.rejects(
    createAdminApi(
      "https://api.chorezy.com",
      async () => null,
      async () => {
        called = true;
        return response({});
      },
    ).overview(),
    (error) => error instanceof AdminApiError && error.status === 401,
  );
  assert.equal(called, false);
});
test("sends the current staff token, disables caching, and sends no fake app version", async () => {
  let token = "first";
  const seen = [];
  const api = createAdminApi(
    "https://api.chorezy.com",
    async () => token,
    async (url, options) => {
      seen.push({ url, options });
      return response({ data: { snapshot: true } });
    },
  );
  await api.overview();
  token = "second";
  await api.overview();
  assert.equal(seen[1].options.headers.Authorization, "Bearer second");
  assert.equal(seen[0].options.cache, "no-store");
  assert.deepEqual(Object.keys(seen[0].options.headers).sort(), [
    "Authorization",
    "Content-Type",
  ]);
});
test("surfaces provider/API errors instead of replacing totals with zero", async () => {
  const api = createAdminApi(
    "https://api.chorezy.com",
    async () => "fixture",
    async () =>
      response(
        { code: "APP_VERSION_REQUIRED", message: "App version required" },
        400,
      ),
  );
  await assert.rejects(
    api.referrals(),
    (error) =>
      error.code === "APP_VERSION_REQUIRED" &&
      error.message === "App version required",
  );
});
test("preserves authorization failures for the session boundary", async () => {
  for (const status of [401, 403])
    await assert.rejects(
      createAdminApi(
        "https://api.chorezy.com",
        async () => "fixture",
        async () => response({ message: "Denied" }, status),
      ).emergencies(),
      (error) => error.status === status,
    );
});
test("session loss and denied API responses clear the staff workspace boundary", async () => {
  const previousWindow = globalThis.window;
  const revoked = [];
  globalThis.window = { dispatchEvent: (event) => revoked.push(event.type) };
  try {
    await assert.rejects(
      createAdminApi("https://api.chorezy.com", async () => null).overview(),
      (error) => error.status === 401,
    );
    for (const status of [401, 403])
      await assert.rejects(
        createAdminApi(
          "https://api.chorezy.com",
          async () => "fixture",
          async () => response({ message: "Denied" }, status),
        ).overview(),
        (error) => error.status === status,
      );
    assert.deepEqual(revoked, Array(3).fill("chorezy-admin-access-revoked"));
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
test("rejects malformed or incomplete successful provider responses", async () => {
  await assert.rejects(
    createAdminApi(
      "https://api.chorezy.com",
      async () => "fixture",
      async () => new Response("<html>Proxy failure</html>"),
    ).overview(),
    (error) => error.code === "INVALID_RESPONSE",
  );
  await assert.rejects(
    createAdminApi(
      "https://api.chorezy.com",
      async () => "fixture",
      async () => response({ success: true }),
    ).overview(),
    (error) => error.code === "MISSING_DATA",
  );
});
test("support has a top-level envelope, unlike data-envelope admin views", async () => {
  const inbox = {
    success: true,
    tickets: [{ id: "fixture" }],
    metrics: { open: 1, urgent: 0 },
  };
  assert.deepEqual(
    await createAdminApi(
      "https://api.chorezy.com",
      async () => "fixture",
      async () => response(inbox),
    ).support(),
    inbox,
  );
});
test("safety revoke uses public actionId, encoded safely, with mandatory reason payload", async () => {
  let seen;
  const api = createAdminApi(
    "https://api.chorezy.com",
    async () => "fixture",
    async (url, options) => {
      seen = { url, options };
      return response({ data: {}, message: "Revoked" });
    },
  );
  await api.revokeSafety("SA/fixture", "Resolved after investigation");
  assert.ok(seen.url.endsWith("/safety/actions/SA%2Ffixture/revoke"));
  assert.equal(seen.options.method, "POST");
  assert.deepEqual(JSON.parse(seen.options.body), {
    reason: "Resolved after investigation",
  });
});
test("failed financial mutations are never automatically retried", async () => {
  let calls = 0;
  const api = createAdminApi(
    "https://api.chorezy.com",
    async () => "fixture",
    async () => {
      calls++;
      throw new Error("Acknowledgement lost");
    },
  );
  await assert.rejects(api.releaseReferrals(1), /Acknowledgement lost/);
  assert.equal(calls, 1);
});

test("investigation receipts cannot claim a freeze or release for malformed or different records", async () => {
  const userId = "000000000000000000000001", investigationId = "000000000000000000000301";
  let receipt, calls = 0;
  const api = createAdminApi("https://api.chorezy.com", async () => "fixture",
    async () => { calls++; return response({ data: receipt }); });
  const payload = { reason: "Reported concern", publicMessage: "Contact support", requestKey: "stable-fixture-key" };
  for (receipt of [null, {}, { id: investigationId, userId: "000000000000000000000002", status: "active", preservation: { status: "active" } }])
    await assert.rejects(api.createInvestigation(userId, payload), error => error.code === "INVESTIGATION_RESULT_UNCONFIRMED");
  receipt = { id: investigationId, userId, status: "released", preservation: { status: "active" }, replayed: true };
  await assert.rejects(api.createInvestigation(userId, payload), error => error.code === "INVESTIGATION_ALREADY_RELEASED");
  receipt = { id: investigationId, userId, status: "active", preservation: { status: "pending" } };
  assert.equal((await api.createInvestigation(userId, payload)).preservation.status, "pending");
  receipt = { id: "different-record", status: "released", preservationStatus: "released" };
  await assert.rejects(api.releaseInvestigation(userId, investigationId, "Resolved"), error => error.code === "INVESTIGATION_RESULT_UNCONFIRMED");
  await assert.rejects(api.releasePreservation(userId, investigationId, "Review finished"), error => error.code === "INVESTIGATION_RESULT_UNCONFIRMED");
  receipt = { investigationId, observations: [], gateRelaxed: true };
  await assert.rejects(api.preservationDiagnostic(userId, investigationId, "Inspect only"), error => error.code === "INVESTIGATION_RESULT_UNCONFIRMED");
  assert.equal(calls, 8, "No ambiguous mutation was automatically retried");
});
test("negative or unknown states cannot masquerade as successful states", () => {
  for (const value of [
    "unverified",
    "inactive",
    "unpaid",
    "not_active",
    "not_verified",
    "unknown",
  ])
    assert.equal(statusTone(value), "neutral", value);
  for (const value of ["active", "verified", "paid", "completed"])
    assert.equal(statusTone(value), "success", value);
  assert.equal(statusTone("active", "emergency"), "danger");
  assert.equal(statusTone("responding", "emergency"), "danger");
  assert.equal(statusTone("failed"), "danger");
});
test("auth timeout is bounded, and late provider success cannot resolve it afterward", async () => {
  let finish;
  const provider = new Promise((resolve) => {
    finish = resolve;
  });
  const bounded = withTimeout(provider, "Permission check timed out", 10);
  await assert.rejects(bounded, /Permission check timed out/);
  finish(true);
  await assert.rejects(bounded, /Permission check timed out/);
  assert.equal(
    await withTimeout(Promise.resolve(true), "Unexpected timeout", 50),
    true,
  );
});
