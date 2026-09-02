import { Marked, type Token, type Tokens } from "marked";

import { escapeHtmlAttribute, escapeHtmlText } from "../utils/escape.js";
import { isAllowedImageUrl, isAllowedLinkUrl } from "../utils/url.js";
import type { NormalizedConvertOptions } from "./types.js";

export interface MarkdownRenderResult {
  bodyHtml: string;
  titleCandidate: string | undefined;
}

/** Renders one token stream and derives its first level-one heading title. */
export function renderMarkdown(
  markdown: string,
  options: Pick<NormalizedConvertOptions, "rawHtml" | "gfm" | "breaks">
): MarkdownRenderResult {
  const rendererHost = new Marked<string, string>();
  const renderer = new rendererHost.Renderer();
  const defaultTable = renderer.table;

  renderer.html = ({ text }: Tokens.HTML | Tokens.Tag): string =>
    options.rawHtml === "allow" ? text : escapeHtmlText(text);

  renderer.link = function ({ href, title, tokens }: Tokens.Link): string {
    const content = this.parser.parseInline(tokens);
    if (!isAllowedLinkUrl(href)) {
      return content;
    }
    const titleAttribute = title === null || title === undefined
      ? ""
      : ` title="${escapeHtmlAttribute(title)}"`;
    return `<a href="${escapeHtmlAttribute(href)}"${titleAttribute}>${content}</a>`;
  };

  renderer.image = ({ href, title, text }: Tokens.Image): string => {
    if (!isAllowedImageUrl(href)) {
      return escapeHtmlText(text);
    }
    const titleAttribute = title === null ? "" : ` title="${escapeHtmlAttribute(title)}"`;
    return `<img src="${escapeHtmlAttribute(href)}" alt="${escapeHtmlAttribute(text)}"${titleAttribute}>`;
  };

  renderer.table = function (token: Tokens.Table): string {
    return `<div class="md2html-table-wrap">${defaultTable.call(this, token)}</div>`;
  };

  renderer.checkbox = ({ checked }: Tokens.Checkbox): string =>
    `<input ${checked ? "checked " : ""}disabled type="checkbox">`;

  const parser = new Marked<string, string>({
    async: false,
    gfm: options.gfm,
    breaks: options.breaks,
    renderer
  });
  const tokens = parser.lexer(markdown);
  const titleCandidate = tokens
    .filter((token): token is Tokens.Heading => token.type === "heading" && token.depth === 1)
    .map((heading) => plainTextFromTokens(heading.tokens).replace(/[*_~`]/gu, "").trim())
    .find((candidate) => candidate.length > 0);

  return {
    bodyHtml: parser.parser(tokens),
    titleCandidate
  };
}

/** @internal Converts Marked inline tokens into a title candidate's plain text. */
export function plainTextFromTokens(tokens: readonly Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === "br") {
        return " ";
      }
      if ("tokens" in token && Array.isArray(token.tokens)) {
        return plainTextFromTokens(token.tokens);
      }
      if ("text" in token && typeof token.text === "string") {
        return token.text;
      }
      return "";
    })
    .join("");
}
