import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../src/cli/run.js";
import { DEFAULT_CSS } from "../../src/styles/default-css.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "md2html-config-test-"));
  tempDirectories.push(directory);
  return directory;
}

function memoryIo(): {
  io: { stdin: AsyncIterable<unknown>; stdout: { write(value: string): boolean }; stderr: { write(value: string): boolean } };
  stdout: () => string;
  stderr: () => string;
} {
  let stdout = "";
  let stderr = "";
  async function* stdin(): AsyncGenerator<never> {
    return;
  }
  return {
    io: {
      stdin: stdin(),
      stdout: { write: (value) => { stdout += value; return true; } },
      stderr: { write: (value) => { stderr += value; return true; } }
    },
    stdout: () => stdout,
    stderr: () => stderr
  };
}

describe("CLI configuration", () => {
  it("finds a package.json config in a parent and resolves CSS from that package", async () => {
    const root = await temporaryDirectory();
    const nested = join(root, "docs", "guide");
    await mkdir(nested, { recursive: true });
    await Promise.all([
      writeFile(join(root, "package.json"), JSON.stringify({
        md2html: {
          css: "styles/theme.css",
          title: "Configured title",
          lang: "ja",
          defaultCss: false,
          allowHtml: true
        }
      }), "utf8"),
      writeFile(join(root, "md2html.config.json"), JSON.stringify({ title: "Lower priority" }), "utf8"),
      mkdir(join(root, "styles"), { recursive: true }),
      writeFile(join(nested, "input.md"), "# Candidate\n\n<span data-config>raw</span>", "utf8")
    ]);
    await writeFile(join(root, "styles", "theme.css"), ".configured { color: teal; }", "utf8");

    const result = memoryIo();
    expect(await runCli(["input.md", "--stdout"], result.io, nested)).toBe(0);
    expect(result.stderr()).toBe("");
    expect(result.stdout()).toContain("<title>Configured title</title>");
    expect(result.stdout()).toContain('<html lang="ja">');
    expect(result.stdout()).toContain(".configured { color: teal; }");
    expect(result.stdout()).toContain("<span data-config>raw</span>");
    expect(result.stdout()).not.toContain(DEFAULT_CSS);
  });

  it("lets CLI rendering options replace config defaults and supports --no-config", async () => {
    const directory = await temporaryDirectory();
    await Promise.all([
      writeFile(join(directory, "md2html.config.json"), JSON.stringify({
        css: "configured.css",
        title: "Configured title",
        lang: "ja",
        defaultCss: false,
        allowHtml: true
      }), "utf8"),
      writeFile(join(directory, "configured.css"), ".configured { color: red; }", "utf8"),
      writeFile(join(directory, "override.css"), ".override { color: blue; }", "utf8"),
      writeFile(join(directory, "input.md"), "# Candidate\n\n<b>raw</b>", "utf8")
    ]);

    const overridden = memoryIo();
    expect(await runCli([
      "input.md", "--stdout", "--title", "CLI title", "--css", "override.css",
      "--default-css", "--no-allow-html"
    ], overridden.io, directory)).toBe(0);
    expect(overridden.stdout()).toContain("<title>CLI title</title>");
    expect(overridden.stdout()).toContain('<html lang="ja">');
    expect(overridden.stdout()).toContain(".override { color: blue; }");
    expect(overridden.stdout()).not.toContain(".configured { color: red; }");
    expect(overridden.stdout()).toContain(DEFAULT_CSS);
    expect(overridden.stdout()).toContain("&lt;b&gt;raw&lt;/b&gt;");

    const disabled = memoryIo();
    expect(await runCli(["input.md", "--stdout", "--no-config"], disabled.io, directory)).toBe(0);
    expect(disabled.stdout()).toContain("<title>Candidate</title>");
    expect(disabled.stdout()).toContain('<html lang="und">');
    expect(disabled.stdout()).not.toContain(".configured { color: red; }");
  });

  it("loads an explicit JSON file and reports invalid or missing configuration", async () => {
    const directory = await temporaryDirectory();
    await Promise.all([
      writeFile(join(directory, "input.md"), "# Candidate", "utf8"),
      writeFile(join(directory, "custom.json"), JSON.stringify({ title: "Explicit" }), "utf8"),
      writeFile(join(directory, "invalid.json"), JSON.stringify({ unknown: true }), "utf8")
    ]);

    const explicit = memoryIo();
    expect(await runCli([
      "input.md", "--stdout", "--config", "custom.json"
    ], explicit.io, directory)).toBe(0);
    expect(explicit.stdout()).toContain("<title>Explicit</title>");

    const invalid = memoryIo();
    expect(await runCli([
      "input.md", "--stdout", "--config", "invalid.json"
    ], invalid.io, directory)).toBe(2);
    expect(invalid.stdout()).toBe("");
    expect(invalid.stderr()).toContain("Unknown md2html configuration option");

    const missing = memoryIo();
    expect(await runCli([
      "input.md", "--stdout", "--config", "missing.json"
    ], missing.io, directory)).toBe(1);
    expect(missing.stdout()).toBe("");
    expect(missing.stderr()).toContain("Cannot read configuration file");
  });

  it("never overwrites the active configuration file", async () => {
    const directory = await temporaryDirectory();
    const config = join(directory, "md2html.config.json");
    const originalConfig = JSON.stringify({ title: "Protected" });
    await Promise.all([
      writeFile(join(directory, "input.md"), "# Candidate", "utf8"),
      writeFile(config, originalConfig, "utf8")
    ]);

    const result = memoryIo();
    expect(await runCli([
      "input.md", "--output", "md2html.config.json", "--force"
    ], result.io, directory)).toBe(2);
    expect(result.stderr()).toContain("must not be the active configuration file");
    expect(await readFile(config, "utf8")).toBe(originalConfig);
  });
});
