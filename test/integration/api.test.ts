import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  convertMarkdownFile,
  convertMdToHtml,
  DEFAULT_CSS,
  generateIndex,
  HtmlDocument,
  Md2HtmlError
} from "../../src/index.js";

describe("public API", () => {
  it("supports the documented non-chain and chain forms", () => {
    const document = convertMdToHtml("# Hello");
    document.customCss("h1 { color: red; }");
    expect(document.toString()).toContain("h1 { color: red; }");

    const html = convertMdToHtml("# Hello")
      .title("Greeting")
      .customCss(".md2html h1 { color: blue; }")
      .toString();
    expect(html).toContain("<title>Greeting</title>");
    expect(html).toContain(".md2html h1 { color: blue; }");
  });

  it("exports the documented runtime values", () => {
    expect(HtmlDocument).toBeTypeOf("function");
    expect(Md2HtmlError).toBeTypeOf("function");
    expect(DEFAULT_CSS).toContain(".md2html");
  });

  it("uses explicit title, H1, and fallback title priority", () => {
    expect(convertMdToHtml("# H1", { title: "Explicit" }).toString()).toContain("<title>Explicit</title>");
    expect(convertMdToHtml("# H1").toString()).toContain("<title>H1</title>");
    expect(convertMdToHtml("Plain").toString()).toContain("<title>Markdown Document</title>");
    expect(convertMdToHtml("# ***").toString()).toContain("<title>Markdown Document</title>");
  });

  it("handles Japanese, emoji, empty Markdown, and all documented options", () => {
    const html = convertMdToHtml("# こんにちは 🌏", {
      lang: "ja",
      defaultCss: false,
      customCss: "p { color: green; }",
      rawHtml: "escape",
      gfm: true,
      breaks: true
    }).toString();
    expect(html).toContain("<title>こんにちは 🌏</title>");
    expect(html).toContain('<html lang="ja">');
    expect(html).toContain("p { color: green; }");
    expect(convertMdToHtml("").toString()).toContain("<article class=\"md2html\">\n\n  </article>");
  });
});

describe("public index APIs", () => {
  it("converts Markdown files and regenerates the index via the public API", async () => {
    const directory = await mkdtemp(join(tmpdir(), "md2html-api-index-test-"));
    try {
      const input = join(directory, "report.md");
      await writeFile(input, "# Report", "utf8");
      await writeFile(join(directory, "handmade.html"), "<html></html>", "utf8");
      await mkdir(join(directory, "public"), { recursive: true });

      const result = await convertMarkdownFile(input, {
        output: join(directory, "public", "report.html"),
        index: true,
        siteTitle: "資料一覧"
      });

      expect(result.index?.entries.map((entry) => entry.fileName)).toEqual(["report.html"]);
      const indexHtml = await readFile(join(directory, "public", "index.html"), "utf8");
      expect(indexHtml).toContain("<h1>資料一覧</h1>");
      expect(indexHtml).toContain('<a href="report.html">report.html</a>');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("updates the index alone without rewriting existing HTML files", async () => {
    const directory = await mkdtemp(join(tmpdir(), "md2html-api-index-test-"));
    try {
      const existing = join(directory, "handmade.html");
      const content = "<html>hand written</html>";
      await writeFile(existing, content, "utf8");

      const result = await generateIndex(directory, { siteTitle: "目次" });

      expect(result.indexPath).toBe(join(directory, "index.html"));
      expect(result.entries.map((entry) => entry.fileName)).toEqual(["handmade.html"]);
      expect(await readFile(existing, "utf8")).toBe(content);
      expect(await readFile(join(directory, "index.html"), "utf8")).toContain("handmade.html");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
