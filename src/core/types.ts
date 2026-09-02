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
  | "HTML_BUILD_FAILED"
  | "FILE_READ_FAILED"
  | "FILE_WRITE_FAILED"
  | "INDEX_GENERATION_FAILED";

export interface NormalizedConvertOptions {
  title: string | undefined;
  lang: string;
  defaultCss: boolean;
  customCss: string[];
  rawHtml: RawHtmlMode;
  gfm: boolean;
  breaks: boolean;
}

/** Normalized options for {@link generateIndex}. */
export interface NormalizedIndexPageOptions {
  siteTitle: string | undefined;
  lang: string;
  defaultCss: boolean;
  customCss: string[];
}

/** One entry listed on the generated index page. */
export interface IndexPageEntry {
  /** File name of the listed HTML file; also used as the display name. */
  fileName: string;
  /** Percent-encoded single-segment relative URL from index.html. */
  href: string;
  /** Creation time from the filesystem, falling back to mtime; undefined when unavailable. */
  createdAt: Date | undefined;
  /** Formatted local timestamp ("YYYY-MM-DD HH:mm"), or "" when unavailable. */
  createdAtText: string;
}

/** Stable options accepted by {@link generateIndex}. */
export interface IndexPageOptions {
  /** Title and heading of the index page. Defaults to 目次. */
  siteTitle?: string;
  /** Language tag of the index page. Defaults to "und". */
  lang?: string;
  /** Whether the default CSS (including theme switching) is applied. Defaults to true. */
  defaultCss?: boolean;
  /** Additional CSS following the same rules as customCss. */
  customCss?: string | readonly string[];
}

/** Stable result returned by {@link generateIndex}. */
export interface GenerateIndexResult {
  /** Path of the created or updated index file. */
  indexPath: string;
  /** Listed entries in ascending file name order. */
  entries: IndexPageEntry[];
}

/** Stable options accepted by {@link convertMarkdownFile}. */
export interface ConvertMarkdownFileOptions extends ConvertOptions {
  /** Output HTML path. Defaults to the input path with a .html extension. */
  output?: string;
  /** Whether an existing output HTML may be overwritten. Defaults to false. Never applies to the index. */
  force?: boolean;
  /** Whether to regenerate the index after a successful conversion. Defaults to false. */
  index?: boolean;
  /** Title for the generated index page when index is enabled. */
  siteTitle?: string;
}

/** Stable result returned by {@link convertMarkdownFile}. */
export interface ConvertMarkdownFileResult {
  /** Path of the written output HTML. */
  outputPath: string;
  /** Index generation result when index was enabled; otherwise undefined. */
  index: GenerateIndexResult | undefined;
}
