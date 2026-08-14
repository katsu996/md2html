import { describe, expect, it } from "vitest";

import {
  convertMdToHtml,
  DEFAULT_CSS,
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
