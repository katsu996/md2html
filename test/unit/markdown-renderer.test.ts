import { marked } from "marked";
import { describe, expect, it } from "vitest";

import { convertMdToHtml } from "../../src/index.js";
import { parseCodeInfo, plainTextFromTokens, renderMarkdown } from "../../src/core/markdown-renderer.js";
import { isAllowedImageUrl, isAllowedLinkUrl } from "../../src/utils/url.js";

const safeOptions = { rawHtml: "escape" as const, gfm: true, breaks: false };

describe("Markdown renderer", () => {
  it("renders the supported Markdown and GFM elements", () => {
    const html = renderMarkdown(`
# Heading

Paragraph with **bold**, *italic*, ~~deleted~~, [link](https://example.com), [titled link](https://example.com "link title"), ![image](https://example.com/image.png), and ![titled image](https://example.com/image.png "image title").

> quote

- item

1. one

\`inline\`

\`\`\`js
const answer = 42;
\`\`\`

---

| left | right |
| --- | ---: |
| a | b |

- [x] done
- [ ] not done
`, safeOptions).bodyHtml;

    for (const expected of [
      "<h1>Heading</h1>", "<p>Paragraph", "<strong>bold</strong>", "<em>italic</em>",
      "<del>deleted</del>", '<a href="https://example.com">link</a>',
      '<a href="https://example.com" title="link title">titled link</a>',
      '<img src="https://example.com/image.png" alt="image">', "<blockquote>", "<ul>", "<ol>",
      "<code>inline</code>", "<pre><code class=\"language-js\">", "<hr>",
      '<img src="https://example.com/image.png" alt="titled image" title="image title">',
      '<div class="md2html-table-wrap"><table>', '<input checked disabled type="checkbox">',
      '<input disabled type="checkbox">'
    ]) {
      expect(html).toContain(expected);
    }
  });

  it("honors gfm and breaks options", () => {
    expect(renderMarkdown("one\ntwo", { ...safeOptions, breaks: false }).bodyHtml).toContain("one\ntwo");
    expect(renderMarkdown("one\ntwo", { ...safeOptions, breaks: true }).bodyHtml).toContain("one<br>two");
    expect(renderMarkdown("~~gone~~", { ...safeOptions, gfm: false }).bodyHtml).not.toContain("<del>");
  });

  it("derives a first non-empty H1 candidate from inline tokens", () => {
    expect(renderMarkdown("No title", safeOptions).titleCandidate).toBeUndefined();
    expect(renderMarkdown("# **First** `title`\n# Second", safeOptions).titleCandidate).toBe("First title");
    expect(renderMarkdown("# ***\n# Actual", safeOptions).titleCandidate).toBe("Actual");
    expect(renderMarkdown("# 日本語の見出し", safeOptions).titleCandidate).toBe("日本語の見出し");
  });

  it("escapes block and inline raw HTML by default and only allows it explicitly", () => {
    const markdown = "<script>alert(1)</script>\n\ntext <span onclick=\"run()\">inside</span>";
    const escaped = renderMarkdown(markdown, safeOptions).bodyHtml;
    expect(escaped).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(escaped).toContain("&lt;span onclick=\"run()\"&gt;inside&lt;/span&gt;");
    expect(escaped).not.toContain("<script>");
    expect(renderMarkdown(markdown, { ...safeOptions, rawHtml: "allow" }).bodyHtml).toContain(
      '<span onclick="run()">inside</span>'
    );
  });

  it("uses an independent Marked instance", () => {
    marked.setOptions({ gfm: false });
    try {
      expect(renderMarkdown("| a |\n| - |\n| b |", safeOptions).bodyHtml).toContain("<table>");
    } finally {
      marked.setOptions({ gfm: true });
    }
  });

  it("turns line breaks and unknown token shapes into safe title text", () => {
    expect(plainTextFromTokens([
      { type: "text", raw: "One", text: "One" },
      { type: "br", raw: "  \n" },
      { type: "text", raw: "Two", text: "Two" },
      { type: "custom", raw: "ignored" }
    ])).toBe("One Two");
  });
});

describe("Code block titles", () => {
  it("renders a lang:title fence as a titled figure", () => {
    const html = renderMarkdown("```html:sample\n<div>a</div>\n```", safeOptions).bodyHtml;
    expect(html).toContain(
      '<figure class="md2html-code-block"><figcaption>sample</figcaption>' +
      '<pre><code class="language-html">'
    );
    expect(html).toContain("&lt;div&gt;a&lt;/div&gt;");
    expect(html).not.toContain("language-html:sample");
  });

  it("keeps untitled fences on the default rendering", () => {
    const html = renderMarkdown("```js\nconst a = 1;\n```\n\n```\nplain\n```", safeOptions).bodyHtml;
    expect(html).toContain('<pre><code class="language-js">');
    expect(html).toContain("<pre><code>plain");
    expect(html).not.toContain("md2html-code-block");
  });

  it("falls back to the default rendering when the title is empty", () => {
    const html = renderMarkdown("```js:\nconst a = 1;\n```", safeOptions).bodyHtml;
    expect(html).toContain("<pre><code");
    expect(html).not.toContain("md2html-code-block");
  });

  it("renders a title without a language and keeps extra colons in the title", () => {
    const titledOnly = renderMarkdown("```:sample\nx\n```", safeOptions).bodyHtml;
    expect(titledOnly).toContain('<figcaption>sample</figcaption><pre><code>');
    const multiColon = renderMarkdown("```js:a:b\nx\n```", safeOptions).bodyHtml;
    expect(multiColon).toContain('<figcaption>a:b</figcaption><pre><code class="language-js">');
  });

  it("escapes HTML in titles and code content", () => {
    const html = renderMarkdown('```js:<script>alert(1)</script>\n<b>bold</b> & "quotes"\n```', safeOptions).bodyHtml;
    expect(html).toContain("<figcaption>&lt;script&gt;alert(1)&lt;/script&gt;</figcaption>");
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt; &amp;");
    expect(html).not.toContain("<script>");
  });

  it("parses code info strings", () => {
    expect(parseCodeInfo(undefined)).toBeUndefined();
    expect(parseCodeInfo("js")).toBeUndefined();
    expect(parseCodeInfo("js:")).toBeUndefined();
    expect(parseCodeInfo("js:   ")).toBeUndefined();
    expect(parseCodeInfo("html:sample")).toEqual({ language: "html", title: "sample" });
    expect(parseCodeInfo(":sample")).toEqual({ language: "", title: "sample" });
    expect(parseCodeInfo("js:a:b")).toEqual({ language: "js", title: "a:b" });
  });
});

describe("URL policy", () => {
  it.each([
    ["https://example.com", true],
    ["", false],
    ["HTTP://example.com", true],
    ["mailto:test@example.com", true],
    ["tel:+81-3-1234", true],
    ["/relative/path", true],
    ["relative/path", true],
    ["#fragment", true],
    ["javascript:alert(1)", false],
    ["JaVaScRiPt:alert(1)", false],
    [" javaScript:alert(1)", false],
    ["java\nscript:alert(1)", false],
    ["java&#x0A;script&#58;alert(1)", false],
    ["javascript&colon;alert(1)", false],
    ["javascript&tab;:alert(1)", false],
    ["javascript&newline;:alert(1)", false],
    ["java%0ascript%3Aalert(1)", false],
    ["%256a%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1)", false],
    ["vbscript:msgbox(1)", false],
    ["data:text/html,boom", false],
    ["file:///tmp/secret", false]
  ])("validates link URL %s", (url, allowed) => {
    expect(isAllowedLinkUrl(url)).toBe(allowed);
  });

  it.each([
    ["https://example.com/image.png", true],
    ["relative/image.png", true],
    ["/relative/image.png", true],
    ["mailto:test@example.com", false],
    ["tel:+813", false],
    ["javascript:alert(1)", false],
    ["data:image/png;base64,aaa", false],
    ["file:///tmp/image.png", false]
  ])("validates image URL %s", (url, allowed) => {
    expect(isAllowedImageUrl(url)).toBe(allowed);
  });

  it("degrades unsafe Markdown URLs to their readable text", () => {
    const html = convertMdToHtml(
      "[visible](javascript:alert(1)) ![image alt](data:text/html,boom)",
      { defaultCss: false }
    ).toString();
    expect(html).toContain("visible image alt");
    expect(html).not.toMatch(/(?:href|src)="[^"]*(?:javascript|data|file):/iu);
  });
});
