import { describe, expect, it } from "vitest";

import { DEFAULT_CSS } from "../../src/index.js";

describe("DEFAULT_CSS", () => {
  it("is a self-contained article stylesheet with responsive and print rules", () => {
    expect(DEFAULT_CSS.length).toBeGreaterThan(1000);
    expect(DEFAULT_CSS).not.toMatch(/@import|https?:\/\//iu);
    for (const selector of [
      "html", "body", ".md2html", "h1", "h6", "strong", "em", "del", "small", "a:focus-visible",
      "ul", "ol", "input[type=\"checkbox\"]", "blockquote", "code", "pre > code",
      ".md2html-table-wrap", "table", "thead", "tbody", "th", "td", "img", "figure", "figcaption", "hr"
    ]) {
      expect(DEFAULT_CSS).toContain(selector);
    }
    expect(DEFAULT_CSS).toContain("@media (max-width: 600px)");
    expect(DEFAULT_CSS).toContain("@media print");
  });
});
