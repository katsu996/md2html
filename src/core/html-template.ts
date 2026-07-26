import { escapeHtmlAttribute, escapeHtmlText, escapeStyleRawText } from "../utils/escape.js";

export interface HtmlTemplateInput {
  bodyHtml: string;
  title: string;
  lang: string;
  defaultCss: string | undefined;
  customCss: readonly string[];
}

/** Builds a complete, deterministic HTML document. */
export function buildHtmlDocument(input: HtmlTemplateInput): string {
  const customCss = input.customCss.filter((css) => css.length > 0).join("\n");
  const styles = [
    input.defaultCss === undefined
      ? undefined
      : `<style id="md2html-default-css">\n${input.defaultCss}\n</style>`,
    customCss.length === 0
      ? undefined
      : `<style id="md2html-custom-css">\n${escapeStyleRawText(customCss)}\n</style>`
  ].filter((style): style is string => style !== undefined);

  const head = [
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    `<title>${escapeHtmlText(input.title)}</title>`,
    ...styles
  ].join("\n  ");

  return [
    "<!doctype html>",
    `<html lang="${escapeHtmlAttribute(input.lang)}">`,
    "<head>",
    `  ${head}`,
    "</head>",
    "<body>",
    "  <article class=\"md2html\">",
    input.bodyHtml.length === 0 ? "" : input.bodyHtml.trimEnd(),
    "  </article>",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}
