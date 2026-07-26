import { HtmlDocument } from "./html-document.js";
import { Md2HtmlError } from "./errors.js";
import { renderMarkdown } from "./markdown-renderer.js";
import { normalizeConvertOptions, normalizeMarkdown } from "./normalize.js";
import type { ConvertOptions } from "./types.js";

/** Converts Markdown into a mutable, complete HTML document. */
export function convertMdToHtml(markdown: string, options?: Readonly<ConvertOptions>): HtmlDocument {
  return convertMarkdown(markdown, options, "Markdown Document");
}

/** @internal Shared conversion use-case used by the Node.js CLI. */
export function convertMarkdown(
  markdown: unknown,
  options: unknown,
  fallbackTitle: string
): HtmlDocument {
  const normalizedMarkdown = normalizeMarkdown(markdown);
  const normalizedOptions = normalizeConvertOptions(options);

  try {
    const rendered = renderMarkdown(normalizedMarkdown, normalizedOptions);
    return HtmlDocument.fromRenderedMarkdown(
      rendered.bodyHtml,
      rendered.titleCandidate,
      normalizedOptions.title,
      normalizedOptions.lang,
      normalizedOptions.defaultCss,
      normalizedOptions.customCss,
      fallbackTitle
    );
  } catch (error) {
    if (error instanceof Md2HtmlError) {
      throw error;
    }
    throw new Md2HtmlError("MARKDOWN_PARSE_FAILED", "Markdown could not be converted.", error);
  }
}
