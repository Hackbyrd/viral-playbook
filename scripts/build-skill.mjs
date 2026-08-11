import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const destination = join(root, "dist", "downloads", "Viral-Video-Ideas-Skill.zip");

await mkdir(join(root, "dist", "downloads"), { recursive: true });
await rm(destination, { force: true });
await execFileAsync("zip", ["-rq", destination, "viral-video-ideas"], {
  cwd: join(root, "skills"),
});

console.log(`Generated ${destination}`);
