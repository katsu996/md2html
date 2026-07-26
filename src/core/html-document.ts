import { DEFAULT_CSS } from "../styles/default-css.js";
import { buildHtmlDocument } from "./html-template.js";
import {
  validateDefaultCssEnabled,
  validateDocumentCss,
  validateDocumentLang,
  validateDocumentTitle
} from "./normalize.js";

interface HtmlDocumentInitialState {
  title: string | undefined;
  lang: string;
  defaultCss: boolean;
  customCss: readonly string[];
  fallbackTitle: string;
}

/** A mutable, chainable representation of a rendered HTML document. */
export class HtmlDocument {
  readonly #bodyHtml: string;
  readonly #titleCandidate: string | undefined;
  readonly #fallbackTitle: string;
  #title: string | undefined;
  #lang: string;
  #defaultCss: boolean;
  readonly #customCss: string[];

  private constructor(
    bodyHtml: string,
    titleCandidate: string | undefined,
    initialState: HtmlDocumentInitialState
  ) {
    this.#bodyHtml = bodyHtml;
    this.#titleCandidate = titleCandidate;
    this.#fallbackTitle = initialState.fallbackTitle;
    this.#title = initialState.title;
    this.#lang = initialState.lang;
    this.#defaultCss = initialState.defaultCss;
    this.#customCss = [...initialState.customCss];
  }

  /** @internal Creates a document from a single rendered Markdown token stream. */
  static fromRenderedMarkdown(
    bodyHtml: string,
    titleCandidate: string | undefined,
    title: string | undefined,
    lang: string,
    defaultCss: boolean,
    customCss: readonly string[],
    fallbackTitle: string
  ): HtmlDocument {
    return new HtmlDocument(bodyHtml, titleCandidate, {
      title,
      lang,
      defaultCss,
      customCss,
      fallbackTitle
    });
  }

  title(value: string): this {
    this.#title = validateDocumentTitle(value);
    return this;
  }

  lang(value: string): this {
    this.#lang = validateDocumentLang(value);
    return this;
  }

  customCss(css: string): this {
    this.#customCss.push(validateDocumentCss(css));
    return this;
  }

  useDefaultCss(enabled = true): this {
    this.#defaultCss = validateDefaultCssEnabled(enabled);
    return this;
  }

  toString(): string {
    return buildHtmlDocument({
      bodyHtml: this.#bodyHtml,
      title: this.#title ?? (this.#titleCandidate || this.#fallbackTitle),
      lang: this.#lang,
      defaultCss: this.#defaultCss ? DEFAULT_CSS : undefined,
      customCss: this.#customCss
    });
  }

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string {
    void hint;
    return this.toString();
  }
}
