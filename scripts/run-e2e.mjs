import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const baseURL = "http://127.0.0.1:3000";
const isWindows = process.platform === "win32";
const args = process.argv.slice(2);

async function isAvailable() {
  try {
    const response = await fetch(baseURL, { signal: AbortSignal.timeout(1500) });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 45_000) {
    if (await isAvailable()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${baseURL}`);
}

function killTree(child) {
  if (!child?.pid || child.exitCode !== null) return;

  if (isWindows) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }

  child.kill("SIGTERM");
}

const hadServer = await isAvailable();
const server = hadServer
  ? undefined
  : spawn(process.execPath, ["./node_modules/next/dist/bin/next", "dev"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

let exitCode = 1;

try {
  if (!hadServer) await waitForServer();

  const result = spawnSync(process.execPath, ["./node_modules/@playwright/test/cli.js", "test", ...args], {
    cwd: process.cwd(),
    env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
    stdio: "inherit",
    windowsHide: true,
  });

  exitCode = result.status ?? 1;
} finally {
  if (!hadServer) killTree(server);
  process.exit(exitCode);
}
