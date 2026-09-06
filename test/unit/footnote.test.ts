import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/core/markdown-renderer.js";

const safeOptions = { rawHtml: "escape" as const, gfm: true, breaks: false };

describe("Footnotes", () => {
  it("renders referenced footnotes as a trailing section with backrefs", () => {
    const html = renderMarkdown("本文[^1]です。\n\n[^1]: 注釈テキスト\n\n次の段落\n", safeOptions).bodyHtml;
    expect(html).toContain(
      '<sup class="md2html-footnote-ref" id="fnref-1"><a href="#fn-1" aria-describedby="fn-1">[1]</a></sup>'
    );
    const sectionStart = html.indexOf('<section class="md2html-footnotes"');
    expect(sectionStart).toBeGreaterThan(-1);
    expect(sectionStart).toBeGreaterThan(html.indexOf("次の段落"));
    expect(html).toContain('<li id="fn-1">');
    expect(html).toContain("注釈テキスト");
    expect(html).toContain('<a class="md2html-footnote-backref" href="#fnref-1" aria-label="脚注1の参照へ戻る">↩</a>');
    expect(html).not.toContain("[^1]:");
  });

  it("numbers footnotes by order of first reference", () => {
    const html = renderMarkdown("B[^two] A[^one]\n\n[^one]: first\n[^two]: second\n", safeOptions).bodyHtml;
    expect(html).toContain('[2]</a></sup>');
    expect(html).toContain('id="fnref-1"');
    expect(html.indexOf('<li id="fn-1">')).toBeLessThan(html.indexOf('<li id="fn-2">'));
  });

  it("supports multiple references to one footnote", () => {
    const html = renderMarkdown("一[^n] 二[^n]\n\n[^n]: note\n", safeOptions).bodyHtml;
    expect(html).toContain('id="fnref-1"');
    expect(html).toContain('id="fnref-1-2"');
    expect(html.match(/md2html-footnote-ref/gu)?.length).toBe(2);
  });

  it("renders unknown references as literal text", () => {
    const html = renderMarkdown("なし[^missing]\n\n[^other]: defined\n", safeOptions).bodyHtml;
    expect(html).toContain("[^missing]");
    expect(html).not.toContain("md2html-footnotes");
  });

  it("drops unreferenced definitions", () => {
    const html = renderMarkdown("本文\n\n[^ghost]: never referenced\n", safeOptions).bodyHtml;
    expect(html).toContain("本文");
    expect(html).not.toContain("never referenced");
    expect(html).not.toContain("md2html-footnotes");
  });

  it("keeps footnote labels out of the HTML output", () => {
    const label = 'x"><script>alert(1)</script>';
    const html = renderMarkdown(`参照[^${label}]。\n\n[^${label}]: note\n`, safeOptions).bodyHtml;
    expect(html).toContain("note");
    expect(html).not.toContain("alert(1)");
    expect(html).not.toContain(label);
    expect(html).toContain('<li id="fn-1">');
  });

  it("renders inline markdown inside footnote content", () => {
    const html = renderMarkdown("本文[^n]\n\n[^n]: **太字**と`コード`\n", safeOptions).bodyHtml;
    expect(html).toContain("<strong>太字</strong>");
    expect(html).toContain("<code>コード</code>");
  });

  it("supports 4-space indented continuation lines", () => {
    const html = renderMarkdown("本文[^n]\n\n[^n]: 一行目\n    二行目\n", safeOptions).bodyHtml;
    expect(html).toContain("一行目");
    expect(html).toContain("二行目");
  });

  it("does not convert references inside code spans", () => {
    const html = renderMarkdown("`[^1]`\n\n[^1]: note\n", safeOptions).bodyHtml;
    expect(html).toContain("<code>[^1]</code>");
    expect(html).not.toContain("md2html-footnotes");
  });

  it("escapes raw HTML in footnote content under the escape policy", () => {
    const html = renderMarkdown("本文[^n]\n\n[^n]: <script>alert(1)</script>\n", safeOptions).bodyHtml;
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
