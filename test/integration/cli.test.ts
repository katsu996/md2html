import { access, mkdtemp, open, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runCli, writeFileAtomically } from "../../src/cli/run.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "md2html-cli-test-"));
  tempDirectories.push(directory);
  return directory;
}

function memoryIo(input = ""): {
  io: { stdin: AsyncIterable<unknown>; stdout: { write(value: string): boolean }; stderr: { write(value: string): boolean } };
  stdout: () => string;
  stderr: () => string;
} {
  let stdout = "";
  let stderr = "";
  async function* stdin(): AsyncGenerator<Buffer> {
    if (input.length > 0) {
      yield Buffer.from(input);
    }
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

describe("CLI execution", () => {
  it("writes explicit and automatic file output without diagnostics", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "日本語 input.md");
    const explicit = join(directory, "result.html");
    await writeFile(input, "# Hello", "utf8");

    const first = memoryIo();
    expect(await runCli([input, "--output", explicit], first.io)).toBe(0);
    expect(await readFile(explicit, "utf8")).toContain("<title>Hello</title>");
    expect(first.stdout()).toBe("");
    expect(first.stderr()).toBe("");

    const second = memoryIo();
    expect(await runCli([input], second.io)).toBe(0);
    expect(await readFile(join(directory, "日本語 input.html"), "utf8")).toContain("<h1>Hello</h1>");
    expect(second.stdout()).toBe("");
    expect(second.stderr()).toBe("");
  });

  it("reads multiple CSS files in order and applies title/lang", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    const firstCss = join(directory, "one.css");
    const secondCss = join(directory, "two.css");
    const output = join(directory, "result.html");
    await Promise.all([
      writeFile(input, "# Candidate", "utf8"),
      writeFile(firstCss, "h1 { color: green; }", "utf8"),
      writeFile(secondCss, "h1 { color: blue; }", "utf8")
    ]);

    const result = memoryIo();
    expect(await runCli([
      input, "--output", output, "--css", firstCss, "--css", secondCss, "--title", "Custom", "--lang", "ja"
    ], result.io)).toBe(0);
    const html = await readFile(output, "utf8");
    expect(html).toContain("<title>Custom</title>");
    expect(html).toContain('<html lang="ja">');
    expect(html.indexOf("green")).toBeLessThan(html.indexOf("blue"));
  });

  it("handles stdin to stdout and stdin to a file", async () => {
    const stdoutRun = memoryIo("# From stdin");
    expect(await runCli(["-", "--stdout"], stdoutRun.io)).toBe(0);
    expect(stdoutRun.stdout()).toContain("<title>From stdin</title>");
    expect(stdoutRun.stderr()).toBe("");

    const directory = await temporaryDirectory();
    const output = join(directory, "from-stdin.html");
    const fileRun = memoryIo("plain");
    expect(await runCli(["-", "--output", output], fileRun.io)).toBe(0);
    expect(await readFile(output, "utf8")).toContain("<title>Markdown Document</title>");
  });

  it("writes help/version, accepts non-Buffer stdin chunks, and maps invalid options to usage errors", async () => {
    const help = memoryIo();
    expect(await runCli(["--help"], help.io)).toBe(0);
    expect(help.stdout()).toContain("Usage: md2html");
    expect(help.stderr()).toBe("");

    const version = memoryIo();
    expect(await runCli(["--version"], version.io)).toBe(0);
    expect(version.stdout()).toBe("1.0.0\n");

    let html = "";
    let diagnostics = "";
    async function* textStdin(): AsyncGenerator<string> {
      yield "# Text chunk";
    }
    expect(await runCli(["-", "--stdout"], {
      stdin: textStdin(),
      stdout: { write: (value) => { html += value; return true; } },
      stderr: { write: (value) => { diagnostics += value; return true; } }
    })).toBe(0);
    expect(html).toContain("<title>Text chunk</title>");
    expect(diagnostics).toBe("");

    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    await writeFile(input, "# Input", "utf8");
    const invalidLang = memoryIo();
    expect(await runCli([input, "--stdout", "--lang", "not valid"], invalidLang.io)).toBe(2);
    expect(invalidLang.stdout()).toBe("");
    expect(invalidLang.stderr()).toContain("lang option");
  });

  it("returns documented error codes and protects existing input, CSS, and output files", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    const css = join(directory, "input.css");
    const output = join(directory, "output.html");
    await Promise.all([
      writeFile(input, "# Original", "utf8"),
      writeFile(css, "p { color: black; }", "utf8"),
      writeFile(output, "OLD OUTPUT", "utf8")
    ]);

    const existing = memoryIo();
    expect(await runCli([input, "--output", output], existing.io)).toBe(1);
    expect(existing.stdout()).toBe("");
    expect(existing.stderr()).toContain("Output file already exists");
    expect(await readFile(output, "utf8")).toBe("OLD OUTPUT");

    const inputAlias = memoryIo();
    expect(await runCli([input, "--output", input, "--force"], inputAlias.io)).toBe(2);
    expect(await readFile(input, "utf8")).toBe("# Original");

    const cssAlias = memoryIo();
    expect(await runCli([input, "--output", css, "--css", css, "--force"], cssAlias.io)).toBe(2);
    expect(await readFile(css, "utf8")).toBe("p { color: black; }");

    const force = memoryIo();
    expect(await runCli([input, "--output", output, "--force"], force.io)).toBe(0);
    expect(await readFile(output, "utf8")).toContain("<h1>Original</h1>");
  });

  it("reports unavailable files, output parent failures, and invalid usage without mixing HTML into stdout", async () => {
    const directory = await temporaryDirectory();
    const missing = memoryIo();
    expect(await runCli([join(directory, "missing.md"), "--stdout"], missing.io)).toBe(1);
    expect(missing.stdout()).toBe("");
    expect(missing.stderr()).toContain("Cannot read input file");

    const input = join(directory, "input.md");
    await writeFile(input, "# Input", "utf8");
    const cssMissing = memoryIo();
    expect(await runCli([input, "--stdout", "--css", join(directory, "missing.css")], cssMissing.io)).toBe(1);
    expect(cssMissing.stdout()).toBe("");
    expect(cssMissing.stderr()).toContain("Cannot read CSS file");

    const absentParent = memoryIo();
    expect(await runCli([input, "--output", join(directory, "missing", "result.html")], absentParent.io)).toBe(1);
    expect(absentParent.stderr()).toContain("Cannot write output file");

    const usage = memoryIo();
    expect(await runCli(["-"], usage.io)).toBe(2);
    expect(usage.stdout()).toBe("");
    expect(usage.stderr()).toContain("hint: Run 'md2html --help'");
  });

  it("keeps an existing force target intact and cleans only its own temporary file on replacement failure", async () => {
    const directory = await temporaryDirectory();
    const output = join(directory, "output.html");
    await writeFile(output, "OLD OUTPUT", "utf8");

    await expect(writeFileAtomically(output, "NEW OUTPUT", true, output, {
      access,
      open,
      link: async () => undefined,
      rename: async () => { throw new Error("simulated rename failure"); },
      unlink
    })).rejects.toThrow("Cannot write output file");

    expect(await readFile(output, "utf8")).toBe("OLD OUTPUT");
    expect((await readdir(directory)).filter((name) => name.includes("md2html-tmp"))).toEqual([]);
  });

  it("cleans its temporary file after a non-force link failure and reports access failures", async () => {
    const directory = await temporaryDirectory();
    const output = join(directory, "output.html");
    await expect(writeFileAtomically(output, "NEW OUTPUT", false, output, {
      access,
      open,
      link: async () => { throw new Error("simulated link failure"); },
      rename: async () => undefined,
      unlink
    })).rejects.toThrow("Cannot write output file");
    expect((await readdir(directory)).filter((name) => name.includes("md2html-tmp"))).toEqual([]);

    await expect(writeFileAtomically(output, "NEW OUTPUT", false, output, {
      access: async () => { throw Object.assign(new Error("denied"), { code: "EACCES" }); },
      open,
      link: async () => undefined,
      rename: async () => undefined,
      unlink
    })).rejects.toThrow("Cannot access output file");
  });

  it("reports a standard-input stream failure without writing HTML", async () => {
    const failingStdin: AsyncIterable<string> = {
      [Symbol.asyncIterator](): AsyncIterator<string> {
        return {
          next: async () => { throw new Error("stream unavailable"); }
        };
      }
    };
    let stdout = "";
    let stderr = "";
    expect(await runCli(["-", "--stdout"], {
      stdin: failingStdin,
      stdout: { write: (value) => { stdout += value; return true; } },
      stderr: { write: (value) => { stderr += value; return true; } }
    })).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("Cannot read standard input");
  });
});
