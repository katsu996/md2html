import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { buildIndexPageHtml, collectIndexEntries, generateIndex } from "../../src/core/index-page.js";
import { Md2HtmlError } from "../../src/core/errors.js";
import type { IndexPageEntry, NormalizedIndexPageOptions } from "../../src/core/types.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "md2html-index-test-"));
  tempDirectories.push(directory);
  return directory;
}

const defaultIndexOptions: NormalizedIndexPageOptions = {
  siteTitle: undefined, lang: "und", defaultCss: false, customCss: []
};

function entry(fileName: string, overrides: Partial<IndexPageEntry> = {}): IndexPageEntry {
  return {
    fileName,
    href: encodeURIComponent(fileName),
    createdAt: undefined,
    createdAtText: "",
    ...overrides
  };
}

describe("index entry collection", () => {
  it("lists direct .html files in ascending file name order and excludes index.html", async () => {
    const directory = await temporaryDirectory();
    await mkdir(join(directory, "nested"), { recursive: true });
    await Promise.all([
      writeFile(join(directory, "b.html"), "<html></html>", "utf8"),
      writeFile(join(directory, "a.html"), "<html></html>", "utf8"),
      writeFile(join(directory, "index.html"), "<html></html>", "utf8"),
      writeFile(join(directory, "notes.txt"), "not html", "utf8"),
      writeFile(join(directory, "nested", "deep.html"), "<html></html>", "utf8")
    ]);

    const entries = await collectIndexEntries(directory);
    expect(entries.map((candidate) => candidate.fileName)).toEqual(["a.html", "b.html"]);
  });

  it("matches the .html extension case-insensitively and keeps hidden files", async () => {
    const directory = await temporaryDirectory();
    await Promise.all([
      writeFile(join(directory, "UPPER.HTML"), "<html></html>", "utf8"),
      writeFile(join(directory, ".hidden.html"), "<html></html>", "utf8")
    ]);

    const entries = await collectIndexEntries(directory);
    expect(entries.map((candidate) => candidate.fileName)).toEqual([".hidden.html", "UPPER.HTML"]);
  });

  it("excludes symlinks and percent-encodes Japanese, whitespace, and symbol file names", async () => {
    const directory = await temporaryDirectory();
    await writeFile(join(directory, "a.html"), "<html></html>", "utf8");
    await symlink(join(directory, "a.html"), join(directory, "link.html"));
    await writeFile(join(directory, "日本語 page#1.html"), "<html></html>", "utf8");

    const entries = await collectIndexEntries(directory);
    expect(entries.map((candidate) => candidate.fileName)).toEqual(["a.html", "日本語 page#1.html"]);
    expect(entries[1]?.href).toBe(encodeURIComponent("日本語 page#1.html"));
  });

  it("formats creation timestamps", async () => {
    const directory = await temporaryDirectory();
    await writeFile(join(directory, "dated.html"), "<html></html>", "utf8");

    const entries = await collectIndexEntries(directory);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.createdAt).toBeInstanceOf(Date);
    expect(entries[0]?.createdAtText).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it("rejects a missing folder with INDEX_GENERATION_FAILED", async () => {
    const directory = await temporaryDirectory();
    await expect(collectIndexEntries(join(directory, "does-not-exist"))).rejects.toMatchObject({
      code: "INDEX_GENERATION_FAILED"
    });
  });
});

describe("index page HTML", () => {
  it("renders entries as file name links with local timestamps", () => {
    const createdAt = new Date(2026, 7, 14, 10, 30);
    const html = buildIndexPageHtml([
      entry("a.html", { createdAt, createdAtText: "2026-08-14 10:30" }),
      entry("report.html")
    ], defaultIndexOptions);

    expect(html).toContain("<h1>目次</h1>");
    expect(html).toContain('<ul class="md2html-index">');
    expect(html).toContain('<a href="a.html">a.html</a>');
    expect(html).toContain('<time datetime="2026-08-14T10:30">2026-08-14 10:30</time>');
    expect(html).toContain('<li><a href="report.html">report.html</a></li>');
    expect(html).not.toContain('<nav class="md2html-index-back">');
    expect(html).not.toContain("md2html-theme-toggle");
  });

  it("escapes the site title, file names, and encoded hrefs", () => {
    const options: NormalizedIndexPageOptions = {
      siteTitle: "資料 <一覧>", lang: "ja", defaultCss: false, customCss: []
    };
    const html = buildIndexPageHtml([
      entry('a & b".html', { createdAtText: "2026-08-14 10:30", createdAt: new Date(2026, 7, 14, 10, 30) })
    ], options);

    expect(html).toContain("<h1>資料 &lt;一覧&gt;</h1>");
    expect(html).toContain("<title>資料 &lt;一覧&gt;</title>");
    expect(html).toContain('<html lang="ja">');
    expect(html).toContain('<a href="a%20%26%20b%22.html">a &amp; b".html</a>');
    expect(html).toContain('<time datetime="2026-08-14T10:30">');
  });

  it("shows the empty state and supports custom CSS", () => {
    const html = buildIndexPageHtml([], {
      siteTitle: undefined, lang: "und", defaultCss: false, customCss: ["p { color: red; }"]
    });

    expect(html).toContain('<p class="md2html-index-empty">HTMLファイルはありません。</p>');
    expect(html).not.toContain("md2html-default-css");
    expect(html).toContain("p { color: red; }");
  });
});

describe("generateIndex", () => {
  it("creates index.html listing existing HTML files and overwrites previous content", async () => {
    const directory = await temporaryDirectory();
    await Promise.all([
      writeFile(join(directory, "b.html"), "<html></html>", "utf8"),
      writeFile(join(directory, "a.html"), "<html></html>", "utf8"),
      writeFile(join(directory, "index.html"), "outdated", "utf8")
    ]);

    const result = await generateIndex(directory, { siteTitle: "資料一覧" });

    expect(result.indexPath).toBe(join(directory, "index.html"));
    expect(result.entries.map((candidate) => candidate.fileName)).toEqual(["a.html", "b.html"]);

    const html = await readFile(join(directory, "index.html"), "utf8");
    expect(html).toContain("<h1>資料一覧</h1>");
    expect(html).not.toContain("outdated");
    expect(html).toContain('<a href="a.html">a.html</a>');
    expect(html).not.toContain('<a href="index.html">');
  });

  it("reflects deletions on the next run", async () => {
    const directory = await temporaryDirectory();
    await writeFile(join(directory, "a.html"), "<html></html>", "utf8");
    await generateIndex(directory);
    await rm(join(directory, "a.html"));

    const result = await generateIndex(directory);
    expect(result.entries).toEqual([]);

    const html = await readFile(join(directory, "index.html"), "utf8");
    expect(html).toContain('<p class="md2html-index-empty">HTMLファイルはありません。</p>');
    expect(html).not.toContain('<a href="a.html">');
  });

  it("validates arguments and error codes", async () => {
    const directory = await temporaryDirectory();

    await expect(generateIndex("")).rejects.toMatchObject({ code: "INVALID_ARGUMENT" });
    await expect(generateIndex(42 as unknown as string)).rejects.toMatchObject({ code: "INVALID_ARGUMENT" });
    await expect(generateIndex(join(directory, "missing"))).rejects.toBeInstanceOf(Md2HtmlError);
    await expect(generateIndex(directory, { lang: "en us" })).rejects.toMatchObject({ code: "INVALID_OPTION" });
    await expect(generateIndex(directory, { siteTitle: 1 as unknown as string })).rejects.toMatchObject({
      code: "INVALID_OPTION"
    });
  });
});
