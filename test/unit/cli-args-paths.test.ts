import { mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { helpText, parseCliArguments, VERSION } from "../../src/cli/args.js";
import { CliUsageError } from "../../src/cli/errors.js";
import {
  defaultOutputPath,
  inputBasenameWithoutExtension,
  resolvePathPlan
} from "../../src/cli/paths.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "md2html-path-test-"));
  tempDirectories.push(directory);
  return directory;
}

describe("CLI argument parsing", () => {
  it("parses every option, aliases, and repeated CSS in order", () => {
    expect(parseCliArguments([
      "input.md", "-o", "out.html", "--css", "first.css", "--css", "second.css", "--title", "T",
      "--lang", "ja", "--no-default-css", "--allow-html", "--stdout", "-f"
    ])).toEqual({
      kind: "run",
      value: {
        input: "input.md", output: "out.html", css: ["first.css", "second.css"], title: "T", lang: "ja",
        defaultCss: false, allowHtml: true, stdout: true, force: true
      }
    });
  });

  it("handles help and version before requiring input", () => {
    expect(parseCliArguments(["--help"])).toEqual({ kind: "help" });
    expect(parseCliArguments(["-v"])).toEqual({ kind: "version" });
    expect(helpText()).toContain("--allow-html");
    expect(helpText()).toContain("--force");
    expect(VERSION).toBe("1.0.0");
  });

  it.each([
    [[], "input Markdown"],
    [["one.md", "two.md"], "Only one input"],
    [["--unknown", "one.md"], "Unknown option"],
    [["--output"], "argument missing"]
  ])("rejects invalid CLI syntax %#", (args, message) => {
    expect(() => parseCliArguments(args)).toThrow(message);
  });
});

describe("CLI path policy", () => {
  it("derives output names correctly", () => {
    expect(defaultOutputPath("file.md")).toBe("file.html");
    expect(defaultOutputPath("file.markdown")).toBe("file.html");
    expect(defaultOutputPath("file.test.md")).toBe("file.test.html");
    expect(defaultOutputPath("file")).toBe("file.html");
    expect(inputBasenameWithoutExtension("/tmp/日本語 file.test.md")).toBe("日本語 file.test");
  });

  it("enforces stdin and output/stdout combinations", async () => {
    const base = {
      input: "-", output: undefined, css: [], title: undefined, lang: undefined, defaultCss: true,
      allowHtml: false, stdout: false, force: false
    };
    await expect(resolvePathPlan(base)).rejects.toThrow("Standard input requires");
    await expect(resolvePathPlan({ ...base, output: "out.html", stdout: true })).rejects.toThrow(
      "cannot be used together"
    );
  });

  it("resolves relative paths and blocks lexical aliases of Markdown and CSS inputs", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input file.md");
    const css = join(directory, "日本語.css");
    await writeFile(input, "# Input", "utf8");
    await writeFile(css, "p {}", "utf8");

    const plan = await resolvePathPlan({
      input, output: join(directory, ".", "output.html"), css: [css], title: undefined, lang: undefined,
      defaultCss: true, allowHtml: false, stdout: false, force: false
    });
    expect(plan.inputPath).toBe(resolve(input));
    expect(plan.outputPath).toBe(resolve(directory, "output.html"));
    expect(plan.cssPaths).toEqual([resolve(css)]);

    await expect(resolvePathPlan({
      input, output: join(directory, "nested", "..", "input file.md"), css: [], title: undefined,
      lang: undefined, defaultCss: true, allowHtml: false, stdout: false, force: true
    })).rejects.toBeInstanceOf(CliUsageError);
    await expect(resolvePathPlan({
      input, output: css, css: [css], title: undefined, lang: undefined, defaultCss: true,
      allowHtml: false, stdout: false, force: true
    })).rejects.toThrow("must not be the input Markdown or a CSS input file");
  });

  it("blocks symlink aliases of an existing protected file", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    const outputAlias = join(directory, "output-link.html");
    await writeFile(input, "# Input", "utf8");
    await symlink(input, outputAlias);

    await expect(resolvePathPlan({
      input, output: outputAlias, css: [], title: undefined, lang: undefined, defaultCss: true,
      allowHtml: false, stdout: false, force: true
    })).rejects.toThrow("must not be the input Markdown");
    expect(await realpath(outputAlias)).toBe(await realpath(input));
  });
});
