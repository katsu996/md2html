import { describe, expect, it } from "vitest";

import { DEFAULT_CSS } from "../../src/index.js";

/** Extracts the flat declaration block opened by the given selector. */
function declarationBlock(selector: string): string {
  const start = DEFAULT_CSS.indexOf(`${selector} {`);
  expect(start).toBeGreaterThanOrEqual(0);
  return DEFAULT_CSS.slice(start, DEFAULT_CSS.indexOf("}", start));
}

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

  it("defines every theme variable in its own light, manual dark, and auto dark block", () => {
    const variables = [
      "--md2html-canvas",
      "--md2html-surface",
      "--md2html-ink",
      "--md2html-text",
      "--md2html-muted",
      "--md2html-border",
      "--md2html-accent",
      "--md2html-focus",
      "--md2html-code-surface",
      "--md2html-control-surface",
      "--md2html-control-hover",
      "--md2html-control-text",
      "--md2html-article-shadow",
      "--md2html-control-shadow"
    ];
    const light = declarationBlock(":root");
    const manualDark = declarationBlock('html[data-md2html-theme="dark"]');
    const autoDark = declarationBlock('html[data-md2html-theme="auto"]');

    for (const variable of variables) {
      expect(light).toContain(`${variable}:`);
      expect(manualDark).toContain(`${variable}:`);
      expect(autoDark).toContain(`${variable}:`);
    }

    for (const variable of variables) {
      const pattern = new RegExp(`${variable}:\\s*([^;]+);`);
      expect(pattern.exec(autoDark)?.[1]).toBe(pattern.exec(manualDark)?.[1]);
    }
  });

  it("defines light values on :root with a light color-scheme", () => {
    expect(DEFAULT_CSS).toMatch(/:root\s*\{[^}]*color-scheme:\s*light/s);
    expect(DEFAULT_CSS).toContain("--md2html-canvas: #f6f5f4");
    expect(DEFAULT_CSS).toContain("--md2html-surface: #ffffff");
    expect(DEFAULT_CSS).toContain("--md2html-ink: #000000");
    expect(DEFAULT_CSS).toContain("--md2html-accent: #0075de");
  });

  it("defines the same dark values for manual dark and auto dark", () => {
    expect(DEFAULT_CSS).toContain('html[data-md2html-theme="dark"]');
    expect(DEFAULT_CSS).toContain('html[data-md2html-theme="auto"]');
    expect(DEFAULT_CSS).toContain("--md2html-canvas: #171717");
    expect(DEFAULT_CSS).toContain("--md2html-surface: #202020");
    expect(DEFAULT_CSS).toContain("--md2html-ink: #f5f5f5");
    expect(DEFAULT_CSS).toContain("--md2html-accent: #62aef0");
    expect(DEFAULT_CSS).toContain("@media (prefers-color-scheme: dark)");
  });

  it("references variables from every themed selector", () => {
    for (const fragment of [
      "html {", "body {", ".md2html {", ".md2html h1", ".md2html strong", ".md2html del",
      ".md2html a {", ".md2html blockquote", ".md2html code", ".md2html pre",
      ".md2html th", ".md2html img", ".md2html hr"
    ]) {
      expect(DEFAULT_CSS).toContain(fragment);
    }
    expect(DEFAULT_CSS).toContain("background: var(--md2html-canvas)");
    expect(DEFAULT_CSS).toContain("color: var(--md2html-text)");
    expect(DEFAULT_CSS).toContain("background: var(--md2html-surface)");
    expect(DEFAULT_CSS).toContain("border: 1px solid var(--md2html-border)");
    expect(DEFAULT_CSS).toContain("color: var(--md2html-accent)");
    expect(DEFAULT_CSS).toContain("outline: 3px solid var(--md2html-focus)");
    expect(DEFAULT_CSS).toContain("accent-color: var(--md2html-accent)");
    expect(DEFAULT_CSS).toContain("box-shadow: var(--md2html-article-shadow)");
  });

  it("styles the theme toggle button with a fixed 44px hit area and safe areas", () => {
    expect(DEFAULT_CSS).toContain(".md2html-theme-toggle");
    expect(DEFAULT_CSS).toContain("position: fixed");
    expect(DEFAULT_CSS).toContain("width: 44px");
    expect(DEFAULT_CSS).toContain("height: 44px");
    expect(DEFAULT_CSS).toContain("env(safe-area-inset-top");
    expect(DEFAULT_CSS).toContain("env(safe-area-inset-right");
    expect(DEFAULT_CSS).toContain("border-radius: 50%");
    expect(DEFAULT_CSS).toContain("background: var(--md2html-control-surface)");
    expect(DEFAULT_CSS).toContain("background: var(--md2html-control-hover)");
    expect(DEFAULT_CSS).toContain("box-shadow: var(--md2html-control-shadow)");
    expect(DEFAULT_CSS).toContain(".md2html-theme-toggle:focus-visible");
  });

  it("keeps the hidden toggle invisible even when author CSS sets display", () => {
    expect(DEFAULT_CSS).toContain(".md2html-theme-toggle[hidden] {");
    expect(DEFAULT_CSS).toContain("display: none");
  });

  it("reserves top padding so the fixed button never covers the article", () => {
    expect(DEFAULT_CSS).toContain("padding: calc(80px + env(safe-area-inset-top, 0px)) 24px 32px");
  });

  it("adds a mobile layout for 320px-wide screens", () => {
    expect(DEFAULT_CSS).toContain("padding: calc(72px + env(safe-area-inset-top, 0px)) 16px 16px");
  });

  it("forces a light theme and hides the button in print", () => {
    const print = DEFAULT_CSS.slice(DEFAULT_CSS.indexOf("@media print"));
    expect(print).toContain('html[data-md2html-theme]');
    expect(print).toContain("color-scheme: light");
    expect(print).toContain("--md2html-canvas: #f6f5f4");
    expect(print).toContain(".md2html-theme-toggle");
    expect(print).toContain("display: none");
  });

  it("does not filter images or animate the theme", () => {
    expect(DEFAULT_CSS).not.toMatch(/filter\s*:/iu);
    expect(DEFAULT_CSS).not.toMatch(/opacity\s*:/iu);
    expect(DEFAULT_CSS).not.toMatch(/mix-blend-mode/iu);
    expect(DEFAULT_CSS).not.toMatch(/transition\s*:/iu);
    expect(DEFAULT_CSS).not.toMatch(/animation\s*:/iu);
  });

  it("keeps the dark icon invisible while the hidden attribute is present", () => {
    expect(DEFAULT_CSS).toContain(".md2html-theme-toggle svg[hidden] {");
  });
});
