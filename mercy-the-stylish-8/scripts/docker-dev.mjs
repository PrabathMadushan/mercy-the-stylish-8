import { copyFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function ensureEnv(relPath) {
  const example = join(root, relPath + ".example");
  const target = join(root, relPath);
  if (!existsSync(target) && existsSync(example)) {
    copyFileSync(example, target);
    console.log(`Created ${relPath} from .env.example`);
  }
}

ensureEnv("server/.env");
ensureEnv("app/.env");

console.log("");
console.log("Starting development stack (Postgres + API + Frontend)...");
console.log("  Frontend: http://localhost:5173");
console.log("  API:      http://localhost:4000");
console.log("");

const args = ["compose", "-f", "docker-compose.dev.yml", "up", "--build", ...process.argv.slice(2)];
const result = spawnSync("docker", args, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });

process.exit(result.status ?? 1);
