import { escapeHtmlAttribute, escapeHtmlText, escapeStyleRawText } from "../utils/escape.js";
import { THEME_CONTROL_SCRIPT, THEME_TOGGLE_HTML } from "./theme-control.js";

export interface HtmlTemplateInput {
  bodyHtml: string;
  title: string;
  lang: string;
  defaultCss: string | undefined;
  customCss: readonly string[];
}

export function buildHtmlDocument(input: HtmlTemplateInput): string {
  const customCss = input.customCss.filter((css) => css.length > 0).join("\n");
  const themeEnabled = input.defaultCss !== undefined;
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
    ...(themeEnabled
      ? ["<meta name=\"color-scheme\" content=\"light dark\">"]
      : []),
    `<title>${escapeHtmlText(input.title)}</title>`,
    ...styles
  ].join("\n  ");

  const htmlStart = themeEnabled
    ? `<html lang="${escapeHtmlAttribute(input.lang)}" data-md2html-theme="auto">`
    : `<html lang="${escapeHtmlAttribute(input.lang)}">`;

  const bodyParts = [
    themeEnabled ? THEME_TOGGLE_HTML : undefined,
    "  <article class=\"md2html\">",
    input.bodyHtml.length === 0 ? "" : input.bodyHtml.trimEnd(),
    "  </article>",
    themeEnabled
      ? "  <script id=\"md2html-theme-script\">\n" + THEME_CONTROL_SCRIPT + "\n  </script>"
      : undefined
  ].filter((part): part is string => part !== undefined);

  return [
    "<!doctype html>",
    htmlStart,
    "<head>",
    `  ${head}`,
    "</head>",
    "<body>",
    ...bodyParts,
    "</body>",
    "</html>",
    ""
  ].join("\n");
}
