import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/core/markdown-renderer.js";

const safeOptions = { rawHtml: "escape" as const, gfm: true, breaks: false };

describe("Definition lists", () => {
  it("renders a term plus colon definition as a dl element", () => {
    const html = renderMarkdown("用語\n: 説明文\n", safeOptions).bodyHtml;
    expect(html).toContain("<dl>");
    expect(html).toContain("<dt>用語</dt>");
    expect(html).toContain("<dd>説明文</dd>");
    expect(html).toContain("</dl>");
  });

  it("renders multiple definitions for one term", () => {
    const html = renderMarkdown("Term\n: First\n: Second\n", safeOptions).bodyHtml;
    expect(html).toContain("<dt>Term</dt>");
    expect(html).toContain("<dd>First</dd>");
    expect(html).toContain("<dd>Second</dd>");
  });

  it("renders inline markdown inside terms and definitions", () => {
    const html = renderMarkdown("**太字用語**\n: *斜体*と`コード`\n", safeOptions).bodyHtml;
    expect(html).toContain("<dt><strong>太字用語</strong></dt>");
    expect(html).toContain("<em>斜体</em>");
    expect(html).toContain("<code>コード</code>");
  });

  it("does not convert a single-line sentence containing a colon", () => {
    const html = renderMarkdown("注意: この文は段落のままです\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<dl>");
    expect(html).toContain("注意: この文は段落のままです");
  });

  it("does not interrupt a paragraph without a preceding blank line", () => {
    const html = renderMarkdown("導入文\n用語\n: 説明\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<dl>");
    expect(html).toContain("導入文");
  });

  it("does not steal headings, quotes, or fences as terms", () => {
    expect(renderMarkdown("# 見出し\n: 説明\n", safeOptions).bodyHtml).toContain("<h1");
    const quoteHtml = renderMarkdown("> 引用\n: 説明\n", safeOptions).bodyHtml;
    expect(quoteHtml).toContain("<blockquote>");
    expect(quoteHtml).not.toContain("<dl>");
    const fenceHtml = renderMarkdown("```js\ncode\n```\n", safeOptions).bodyHtml;
    expect(fenceHtml).toContain("<code");
    expect(fenceHtml).not.toContain("<dl>");
  });

  it("nests a definition list inside a list item on lazy continuation", () => {
    const html = renderMarkdown("- 項目\n: 説明\n", safeOptions).bodyHtml;
    expect(html).toContain("<li>");
    expect(html).toContain("<dl>");
    expect(html).toContain("<dt>項目</dt>");
  });

  it("does not steal footnote definitions as terms", () => {
    const html = renderMarkdown("本文[^a]\n\n[^a]: 注釈\n: 説明\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<dl>");
  });

  it("requires a space after the colon marker", () => {
    const html = renderMarkdown("Term\n:foo\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<dl>");
  });

  it("does not treat 4-space indented colon lines as definitions", () => {
    const html = renderMarkdown("Term\n    : code\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<dl>");
  });

  it("renders an empty definition as an empty dd", () => {
    const html = renderMarkdown("Term\n:\n", safeOptions).bodyHtml;
    expect(html).toContain("<dt>Term</dt>");
    expect(html).toContain("<dd></dd>");
  });

  it("escapes raw HTML in terms under the escape policy", () => {
    const html = renderMarkdown('<script>alert(1)</script>\n: def\n', safeOptions).bodyHtml;
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
