import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_DIR = "public";
const GENERATED = /^(sw\.js|workbox-.*\.js|swe-worker-.*\.js|fallback-.*\.js)$/;

for (const file of readdirSync(PUBLIC_DIR)) {
  if (GENERATED.test(file)) {
    rmSync(join(PUBLIC_DIR, file), { force: true });
  }
}
