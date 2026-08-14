/** Controls how raw HTML found in Markdown is rendered. */
export type RawHtmlMode = "escape" | "allow";

/** Stable options accepted by {@link convertMdToHtml}. */
export interface ConvertOptions {
  title?: string;
  lang?: string;
  defaultCss?: boolean;
  customCss?: string | readonly string[];
  rawHtml?: RawHtmlMode;
  gfm?: boolean;
  breaks?: boolean;
}

/** Stable error codes emitted by the library API. */
export type Md2HtmlErrorCode =
  | "INVALID_ARGUMENT"
  | "INVALID_OPTION"
  | "MARKDOWN_PARSE_FAILED"
  | "HTML_BUILD_FAILED";

export interface NormalizedConvertOptions {
  title: string | undefined;
  lang: string;
  defaultCss: boolean;
  customCss: string[];
  rawHtml: RawHtmlMode;
  gfm: boolean;
  breaks: boolean;
}
