import { spawn } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const packageDirectory = await mkdtemp(join(tmpdir(), "md2html-package-check-"));
const npmCli = process.env.npm_execpath;

if (npmCli === undefined) {
  throw new Error("npm_execpath is required to pack this package.");
}

try {
  await run(process.execPath, [npmCli, "pack", "--ignore-scripts", "--pack-destination", packageDirectory]);
  const tarball = (await readdir(packageDirectory)).find((file) => file.endsWith(".tgz"));
  if (tarball === undefined) {
    throw new Error("npm pack did not produce a tarball.");
  }
  const tarballPath = join(packageDirectory, tarball);
  await run(process.execPath, [resolve("node_modules/publint/src/cli.js"), "run", tarballPath, "--strict", "--pack", "false"]);
  await run(process.execPath, [resolve("node_modules/@arethetypeswrong/cli/dist/index.js"), tarballPath, "--profile", "node16"]);
} finally {
  await rm(packageDirectory, { recursive: true, force: true });
}

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", rejectPromise);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`Package validation command failed (${signal ?? code ?? "unknown"}).`));
    });
  });
}
