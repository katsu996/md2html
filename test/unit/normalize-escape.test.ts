import { describe, expect, it } from "vitest";

import { Md2HtmlError } from "../../src/core/errors.js";
import { normalizeConvertOptions, normalizeMarkdown } from "../../src/core/normalize.js";
import {
  escapeHtmlAttribute,
  escapeHtmlText,
  escapeStyleRawText
} from "../../src/utils/escape.js";

describe("input normalization", () => {
  it.each([null, [], {}, 1, false])("rejects non-string Markdown input: %j", (input) => {
    expect(() => normalizeMarkdown(input)).toThrow(Md2HtmlError);
    expect(() => normalizeMarkdown(input)).toThrow(/Markdown input must be a string/);
  });

  it("removes BOM and known zero-width characters only at the start", () => {
    expect(normalizeMarkdown("\uFEFF\u200B\u200C# Title")).toBe("# Title");
    expect(normalizeMarkdown("A\u200B B")).toBe("A\u200B B");
  });

  it.each([
    [null, "Conversion options must be an object"],
    [[], "Conversion options must be an object"],
    [{ title: 1 }, "title option must be a string"],
    [{ lang: "ja JA" }, "lang option"],
    [{ lang: "ja\"" }, "lang option"],
    [{ lang: "<ja>" }, "lang option"],
    [{ defaultCss: "true" }, "defaultCss option must be a boolean"],
    [{ customCss: ["a", 1] }, "customCss option"],
    [{ rawHtml: "sanitize" }, "rawHtml option"],
    [{ gfm: 1 }, "gfm option must be a boolean"],
    [{ breaks: null }, "breaks option must be a boolean"]
  ])("rejects invalid options %#", (options, message) => {
    expect(() => normalizeConvertOptions(options)).toThrow(message);
  });

  it("uses documented defaults, accepts common language tags, and ignores unknown keys", () => {
    expect(normalizeConvertOptions(undefined)).toEqual({
      title: undefined,
      lang: "und",
      defaultCss: true,
      customCss: [],
      rawHtml: "escape",
      gfm: true,
      breaks: false
    });
    expect(normalizeConvertOptions({ lang: "ja-JP", unknown: true }).lang).toBe("ja-JP");
  });

  it("defensively copies custom CSS arrays", () => {
    const css = ["p { color: red; }"];
    const options = normalizeConvertOptions({ customCss: css });
    css.push("p { color: blue; }");
    expect(options.customCss).toEqual(["p { color: red; }"]);
  });
});

describe("context-specific escaping", () => {
  it("escapes text and attribute contexts independently", () => {
    expect(escapeHtmlText("<&>\"'")).toBe("&lt;&amp;&gt;\"'");
    expect(escapeHtmlAttribute("<&>\"'")).toBe("&lt;&amp;&gt;&quot;&#39;");
  });

  it("neutralizes every case variation of a style closing sequence", () => {
    expect(escapeStyleRawText("a</style>b</StYlE>c</STYLE d")).toBe(
      "a<\\/style>b<\\/style>c<\\/style d"
    );
  });
});
