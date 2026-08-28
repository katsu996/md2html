import { describe, expect, it } from "vitest";

import { convertMdToHtml, Md2HtmlError } from "../../src/index.js";

describe("HtmlDocument and complete HTML template", () => {
  it("creates the minimum complete document in the required order", () => {
    const html = convertMdToHtml("plain text", { defaultCss: false }).toString();
    expect(html).toMatch(/^<!doctype html>\n<html lang="und">\n<head>\n {2}<meta charset="utf-8">\n {2}<meta name="viewport"/);
    expect(html).toContain("<title>Markdown Document</title>");
    expect(html).toContain("<article class=\"md2html\">\n<p>plain text</p>");
    expect(html.endsWith("</html>\n")).toBe(true);
    expect(html.endsWith("</html>\n\n")).toBe(false);
  });

  it("applies title, language, CSS order, chainability, and style terminator protection", () => {
    const document = convertMdToHtml("# Candidate", {
      title: "A & <B>",
      lang: "ja-JP",
      customCss: ["p { color: green; }", "x </StYlE> y"]
    });
    const returned = document.customCss("p { color: red; }").useDefaultCss(false);
    document.useDefaultCss();
    const html = document.toString();

    expect(returned).toBe(document);
    expect(html).toContain('<html lang="ja-JP" data-md2html-theme="auto">');
    expect(html).toContain("<title>A &amp; &lt;B&gt;</title>");
    expect(html).toContain('<style id="md2html-default-css">');
    expect(html.indexOf("p { color: green; }")).toBeLessThan(html.indexOf("p { color: red; }"));
    expect(html).toContain("x <\\/style> y");
    expect(html).not.toContain("x </StYlE> y");
  });

  it("allows default CSS to be disabled and omits empty style elements", () => {
    const html = convertMdToHtml("# T", { defaultCss: false, customCss: "" }).toString();
    expect(html).not.toContain("md2html-default-css");
    expect(html).not.toContain("md2html-custom-css");
  });

  it("is deterministic and string-coercible without reparsing Markdown", () => {
    const document = convertMdToHtml("# Hello");
    const first = document.toString();
    expect(document.toString()).toBe(first);
    expect(String(document)).toBe(first);
    expect(`${document}`).toBe(first);
  });

  it("uses mutable builder settings and validates their boundary inputs", () => {
    const document = convertMdToHtml("# Original");
    document.title("").lang("en-US").customCss("h1 { color: blue; }");
    expect(document.toString()).toContain("<title></title>");
    expect(document.toString()).toContain('<html lang="en-US" data-md2html-theme="auto">');
    expect(() => document.title(1 as unknown as string)).toThrow(Md2HtmlError);
    expect(() => document.lang("en  us")).toThrow(Md2HtmlError);
    expect(() => document.customCss(null as unknown as string)).toThrow(Md2HtmlError);
    expect(() => document.useDefaultCss("yes" as unknown as boolean)).toThrow(Md2HtmlError);
  });

  it("does not retain later mutations to the options object or CSS array", () => {
    const css = ["h1 { color: green; }"];
    const options = { customCss: css, lang: "ja" };
    const document = convertMdToHtml("# Hello", options);
    css[0] = "h1 { color: red; }";
    options.lang = "en";
    const html = document.toString();
    expect(html).toContain("h1 { color: green; }");
    expect(html).not.toContain("h1 { color: red; }");
    expect(html).toContain('<html lang="ja" data-md2html-theme="auto">');
  });

  it("emits the full theme contract when default CSS is enabled", () => {
    const html = convertMdToHtml("plain text").toString();
    expect(html).toContain('<html lang="und" data-md2html-theme="auto">');
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
    expect(html).toContain('id="md2html-theme-toggle"');
    expect(html).toContain('class="md2html-theme-toggle"');
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="ダークモード"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('data-md2html-theme-icon="light"');
    expect(html).toContain('data-md2html-theme-icon="dark"');
    expect(html).toContain('id="md2html-theme-script"');
    expect(html).toContain("(() => {");
  });

  it("orders viewport, color-scheme, title, styles in head and button, article, script in body", () => {
    const html = convertMdToHtml("plain text").toString();
    const viewport = html.indexOf('name="viewport"');
    const colorScheme = html.indexOf('name="color-scheme"');
    const title = html.indexOf("<title>");
    const defaultCss = html.indexOf('id="md2html-default-css"');
    const button = html.indexOf('id="md2html-theme-toggle"');
    const article = html.indexOf('<article class="md2html">');
    const script = html.indexOf('id="md2html-theme-script"');
    expect(viewport).toBeLessThan(colorScheme);
    expect(colorScheme).toBeLessThan(title);
    expect(title).toBeLessThan(defaultCss);
    expect(button).toBeLessThan(article);
    expect(article).toBeLessThan(script);
  });

  it("never interpolates user input into the control script", () => {
    const html = convertMdToHtml("# UNIQUE_MARKER", {
      title: "SECRET_TITLE",
      lang: "xx",
      customCss: "SECRET_CSS"
    }).toString();
    const scriptStart = html.indexOf('id="md2html-theme-script"');
    const script = html.slice(scriptStart);
    expect(script).not.toContain("UNIQUE_MARKER");
    expect(script).not.toContain("SECRET_TITLE");
    expect(script).not.toContain("SECRET_CSS");
    expect(script).not.toContain("xx");
  });

  it("omits every theme contract when default CSS is disabled, even with custom CSS", () => {
    const html = convertMdToHtml("plain text", {
      defaultCss: false,
      customCss: "p { color: green; }"
    }).toString();
    expect(html).not.toContain("data-md2html-theme");
    expect(html).not.toContain('name="color-scheme"');
    expect(html).not.toContain("md2html-theme-toggle");
    expect(html).not.toContain("md2html-theme-script");
    expect(html).toContain('<html lang="und">');
    expect(html).toContain('id="md2html-custom-css"');
  });

  it("keeps the control script free of forbidden runtime APIs", () => {
    const html = convertMdToHtml("plain text").toString();
    const scriptStart = html.indexOf('id="md2html-theme-script"');
    const script = html.slice(scriptStart);
    expect(script).not.toMatch(/eval\s*\(/iu);
    expect(script).not.toMatch(/\bFunction\s*\(/iu);
    expect(script).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML/iu);
    expect(script).not.toMatch(/fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/iu);
    expect(script).not.toMatch(/localStorage|sessionStorage|document\.cookie/iu);
    expect(script).not.toMatch(/https?:\/\//iu);
  });

});
