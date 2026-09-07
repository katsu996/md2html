import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { convertMarkdownFile } from "../../src/core/io/convert-file.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "md2html-convert-file-test-"));
  tempDirectories.push(directory);
  return directory;
}

describe("convertMarkdownFile", () => {
  it("writes the default output beside the input with a .html extension", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "日本語 report.md");
    await writeFile(input, "# Report", "utf8");

    const result = await convertMarkdownFile(input);

    expect(result.outputPath).toBe(join(directory, "日本語 report.html"));
    expect(result.index).toBeUndefined();
    const html = await readFile(result.outputPath, "utf8");
    expect(html).toContain("<h1>Report</h1>");
    expect(html).not.toContain('<nav class="md2html-index-back">');
  });

  it("respects the output path and force rules", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    const output = join(directory, "existing.html");
    await Promise.all([
      writeFile(input, "# Input", "utf8"),
      writeFile(output, "previous", "utf8")
    ]);

    await expect(convertMarkdownFile(input, { output })).rejects.toMatchObject({ code: "FILE_WRITE_FAILED" });
    expect(await readFile(output, "utf8")).toBe("previous");

    const result = await convertMarkdownFile(input, { output, force: true });
    expect(result.outputPath).toBe(output);
    expect(await readFile(output, "utf8")).toContain("<h1>Input</h1>");
  });

  it("rejects an output that refers to the same file as the input, even with force", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    await writeFile(input, "# Input", "utf8");
    const alias = join(directory, "alias.md");
    await symlink(input, alias);

    await expect(convertMarkdownFile(input, { output: input, force: true }))
      .rejects.toMatchObject({ code: "INVALID_OPTION" });
    await expect(convertMarkdownFile(input, { output: alias, force: true }))
      .rejects.toMatchObject({ code: "INVALID_OPTION" });
    expect(await readFile(input, "utf8")).toBe("# Input");
  });

  it("rejects an output that the index generation would overwrite", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "input.md");
    await writeFile(input, "# Input", "utf8");

    await expect(convertMarkdownFile(input, {
      output: join(directory, "index.html"), index: true
    })).rejects.toMatchObject({ code: "INVALID_OPTION" });

    const indexInput = join(directory, "index.md");
    await writeFile(indexInput, "# Index", "utf8");
    await expect(convertMarkdownFile(indexInput, { index: true })).rejects.toMatchObject({
      code: "INVALID_OPTION"
    });

    await expect(readFile(join(directory, "index.html"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("propagates lang, defaultCss, and customCss to the index page", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "report.md");
    await writeFile(input, "# Report", "utf8");
    await writeFile(join(directory, "other.html"), "<html></html>", "utf8");

    const result = await convertMarkdownFile(input, { index: true, siteTitle: "資料一覧" });

    const html = await readFile(result.outputPath, "utf8");
    expect(html).toContain('<nav class="md2html-index-back"><a href="index.html">目次へ戻る</a></nav>');

    expect(result.index?.indexPath).toBe(join(directory, "index.html"));
    expect(result.index?.entries.map((entry) => entry.fileName)).toEqual(["other.html", "report.html"]);
    const indexHtml = await readFile(join(directory, "index.html"), "utf8");
    expect(indexHtml).toContain("<h1>資料一覧</h1>");
    expect(indexHtml).not.toContain('<nav class="md2html-index-back">');
  });

  it("propagates lang, defaultCss, and customCss to the index page", async () => {
    const directory = await temporaryDirectory();
    const input = join(directory, "report.md");
    await writeFile(input, "# Report", "utf8");

    await convertMarkdownFile(input, {
      index: true, lang: "ja", defaultCss: false, customCss: "body { color: red; }"
    });

    const indexHtml = await readFile(join(directory, "index.html"), "utf8");
    expect(indexHtml).toContain('<html lang="ja">');
    expect(indexHtml).not.toContain("md2html-default-css");
    expect(indexHtml).toContain("body { color: red; }");
  });

  it("fails on missing input without touching the index", async () => {
    const directory = await temporaryDirectory();
    await writeFile(join(directory, "first.md"), "# First", "utf8");
    await convertMarkdownFile(join(directory, "first.md"), { index: true });
    const indexBefore = await readFile(join(directory, "index.html"), "utf8");

    await expect(convertMarkdownFile(join(directory, "missing.md"), { index: true })).rejects.toMatchObject({
      code: "FILE_READ_FAILED"
    });
    expect(await readFile(join(directory, "index.html"), "utf8")).toBe(indexBefore);
  });

  it("validates arguments and option values", async () => {
    const directory = await temporaryDirectory();

    await expect(convertMarkdownFile("")).rejects.toMatchObject({ code: "INVALID_ARGUMENT" });
    await expect(convertMarkdownFile(42 as unknown as string)).rejects.toMatchObject({ code: "INVALID_ARGUMENT" });
    await expect(convertMarkdownFile(join(directory, "a.md"), { force: "yes" as unknown as boolean })).rejects
      .toMatchObject({ code: "INVALID_OPTION" });
    await expect(convertMarkdownFile(join(directory, "a.md"), { output: 3 as unknown as string })).rejects
      .toMatchObject({ code: "INVALID_OPTION" });
    await expect(convertMarkdownFile(join(directory, "a.md"), "options" as unknown as object)).rejects
      .toMatchObject({ code: "INVALID_OPTION" });
  });
});
