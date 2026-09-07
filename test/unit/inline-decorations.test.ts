import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/core/markdown-renderer.js";

const safeOptions = { rawHtml: "escape" as const, gfm: true, breaks: false };

describe("Inline decorations", () => {
  it("renders highlight, insertion, superscript, and subscript", () => {
    const html = renderMarkdown("==mark== ++ins++ ^sup^ ~sub~\n", safeOptions).bodyHtml;
    expect(html).toContain("<mark>mark</mark>");
    expect(html).toContain("<ins>ins</ins>");
    expect(html).toContain("<sup>sup</sup>");
    expect(html).toContain("<sub>sub</sub>");
  });

  it("renders decorations mid-sentence without swallowing surrounding text", () => {
    const html = renderMarkdown("before ==mark== middle ++ins++ after\n", safeOptions).bodyHtml;
    expect(html).toContain("before <mark>mark</mark> middle <ins>ins</ins> after");
  });

  it("renders multiple occurrences on one line", () => {
    const html = renderMarkdown("==one== and ==two==\n", safeOptions).bodyHtml;
    expect(html).toContain("<mark>one</mark>");
    expect(html).toContain("<mark>two</mark>");
  });

  it("parses inline markdown inside decorations", () => {
    const html = renderMarkdown("==**太字**== ^`code`^\n", safeOptions).bodyHtml;
    expect(html).toContain("<mark><strong>太字</strong></mark>");
    expect(html).toContain("<sup><code>code</code></sup>");
  });

  it("keeps GFM strikethrough working alongside subscript", () => {
    const html = renderMarkdown("~~del~~ and ~sub~\n", safeOptions).bodyHtml;
    expect(html).toContain("<del>del</del>");
    expect(html).toContain("<sub>sub</sub>");
  });

  it("keeps emphasis working alongside decorations", () => {
    const html = renderMarkdown("*em* _em2_ ==mark==\n", safeOptions).bodyHtml;
    expect(html).toContain("<em>em</em>");
    expect(html).toContain("<em>em2</em>");
    expect(html).toContain("<mark>mark</mark>");
  });

  it("leaves unclosed markers as literal text", () => {
    const html = renderMarkdown("==oops ++oops ^oops ~oops\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<mark>");
    expect(html).not.toContain("<ins>");
    expect(html).not.toContain("<sup>");
    expect(html).not.toContain("<sub>");
  });

  it("leaves empty markers as literal text", () => {
    const html = renderMarkdown("==== ~~\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<mark>");
    expect(html).not.toContain("<sub>");
  });

  it("does not convert markers inside code spans", () => {
    const html = renderMarkdown("`==mark==` `~sub~`\n", safeOptions).bodyHtml;
    expect(html).toContain("<code>==mark==</code>");
    expect(html).toContain("<code>~sub~</code>");
    expect(html).not.toContain("<mark>");
    expect(html).not.toContain("<sub>");
  });

  it("does not treat footnote references as superscript", () => {
    const html = renderMarkdown("本文[^a]\n\n[^a]: 注釈\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<sup>");
    expect(html).toContain("md2html-footnote-ref");
  });

  it("escapes raw HTML inside decorations under the escape policy", () => {
    const html = renderMarkdown("==<script>alert(1)</script>==\n", safeOptions).bodyHtml;
    expect(html).toContain("<mark>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("respects backslash escapes before markers", () => {
    const html = renderMarkdown("\\==mark== \\~sub~\n", safeOptions).bodyHtml;
    expect(html).not.toContain("<mark>");
    expect(html).not.toContain("<sub>");
    expect(html).toContain("==mark==");
  });
});
