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
  const defaultCode = renderer.code;

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

  renderer.code = function (token: Tokens.Code): string {
    const info = parseCodeInfo(token.lang);
    if (info === undefined) {
      return defaultCode.call(this, token);
    }
    const languageClass = info.language === ""
      ? ""
      : ` class="language-${escapeHtmlAttribute(info.language)}"`;
    const codeText = `${escapeHtmlText(token.text.replace(/\n+$/u, ""))}\n`;
    return `<figure class="md2html-code-block"><figcaption>${escapeHtmlText(info.title)}</figcaption><pre><code${languageClass}>${codeText}</code></pre></figure>`;
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

/** @internal Splits a fenced code info string into a language and an optional `:title`. */
export function parseCodeInfo(lang: string | undefined): { language: string; title: string } | undefined {
  const match = /^(\S*?):([\s\S]*)$/u.exec(lang ?? "");
  if (match === null) {
    return undefined;
  }
  const title = (match[2] ?? "").trim();
  if (title === "") {
    return undefined;
  }
  return { language: match[1] ?? "", title };
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
