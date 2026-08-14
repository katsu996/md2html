import type { Md2HtmlErrorCode } from "./types.js";

/** Error type exposed by library operations. */
export class Md2HtmlError extends Error {
  readonly name = "Md2HtmlError";
  readonly code: Md2HtmlErrorCode;
  override readonly cause: unknown;

  constructor(code: Md2HtmlErrorCode, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}
