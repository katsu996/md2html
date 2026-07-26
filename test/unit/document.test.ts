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
    expect(html).toContain('<html lang="ja-JP">');
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
    expect(document.toString()).toContain('<html lang="en-US">');
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
    expect(html).toContain('<html lang="ja">');
  });
});
