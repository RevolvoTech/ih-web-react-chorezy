// Local preview only. Keep provider/service-role keys out of this process.
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origins = new Set(["http://localhost:4058", "http://127.0.0.1:4058"]);
const proxy = http.createServer(async (request, response) => {
  response.setHeader("Cache-Control", "private, no-store");
  const origin = request.headers.origin;
  if (origin && !origins.has(origin)) {
    response.writeHead(403);
    response.end();
    return;
  }
  if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  const local = new URL(request.url ?? "/", "http://localhost:4059");
  if (
    !local.pathname.startsWith("/api/v1/admin/") ||
    !["GET", "POST"].includes(request.method ?? "")
  ) {
    response.writeHead(404);
    response.end();
    return;
  }
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        success: false,
        message: "Staff authorization is required.",
      }),
    );
    return;
  }
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 1024 * 1024) {
        response.writeHead(413);
        response.end();
        return;
      }
      chunks.push(chunk);
    }
    // Only the fixed Chorezy admin origin is forwarded. Staff authorization is
    // checked by that backend; this proxy has no stored session or admin key.
    const upstream = await fetch(
      "https://api.chorezy.com" + local.pathname + local.search,
      {
        method: request.method,
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: request.method === "POST" ? Buffer.concat(chunks) : undefined,
        redirect: "error",
        signal: AbortSignal.timeout(20000),
      },
    );
    response.writeHead(upstream.status, {
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
    });
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        success: false,
        message:
          "The Chorezy API could not be reached. Refresh to check the current state.",
      }),
    );
  }
});
proxy.listen(4059, "127.0.0.1", () => {
  console.log("Local staff API proxy ready on port 4059.");
});
proxy.on("error", (error) => {
  console.error("Local preview proxy failed:", error.code);
  stop(1);
});
const next = spawn(
  process.execPath,
  [
    path.join(root, "node_modules/next/dist/bin/next"),
    "dev",
    "--webpack",
    "--port",
    "4058",
    "--hostname",
    "127.0.0.1",
  ],
  {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  },
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  next.kill();
  proxy.close();
  setTimeout(() => process.exit(code), 500).unref();
}
next.on("exit", (code) => stop(code || 0));
next.on("error", (error) => {
  console.error("Local preview could not start:", error.code);
  stop(1);
});
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
