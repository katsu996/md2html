import { Md2HtmlError } from "./errors.js";
import type {
  ConvertOptions,
  NormalizedConvertOptions,
  RawHtmlMode
} from "./types.js";

const LEADING_MARKDOWN_NOISE = new Set(["\u200B", "\u200C", "\u200D", "\u200E", "\u200F", "\u2060", "\uFEFF"]);
const LANGUAGE_TAG = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

export function normalizeMarkdown(markdown: unknown): string {
  if (typeof markdown !== "string") {
    throw new Md2HtmlError("INVALID_ARGUMENT", "Markdown input must be a string.");
  }

  let normalized = markdown;
  while (LEADING_MARKDOWN_NOISE.has(normalized[0] ?? "")) {
    normalized = normalized.slice(1);
  }
  return normalized;
}

export function normalizeConvertOptions(options: unknown): NormalizedConvertOptions {
  if (options === undefined) {
    return defaultOptions();
  }

  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new Md2HtmlError("INVALID_OPTION", "Conversion options must be an object.");
  }

  const input = options as Record<string, unknown>;
  const title = validateOptionalString(input.title, "title");
  const lang = validateLanguage(input.lang);
  const defaultCss = validateOptionalBoolean(input.defaultCss, "defaultCss", true);
  const customCss = validateCustomCss(input.customCss);
  const rawHtml = validateRawHtml(input.rawHtml);
  const gfm = validateOptionalBoolean(input.gfm, "gfm", true);
  const breaks = validateOptionalBoolean(input.breaks, "breaks", false);

  return { title, lang, defaultCss, customCss, rawHtml, gfm, breaks };
}

export function validateDocumentTitle(value: unknown): string {
  if (typeof value !== "string") {
    throw new Md2HtmlError("INVALID_ARGUMENT", "Title must be a string.");
  }
  return value;
}

export function validateDocumentLang(value: unknown): string {
  return validateLanguage(value);
}

export function validateDocumentCss(value: unknown): string {
  if (typeof value !== "string") {
    throw new Md2HtmlError("INVALID_ARGUMENT", "Custom CSS must be a string.");
  }
  return value;
}

export function validateDefaultCssEnabled(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new Md2HtmlError("INVALID_ARGUMENT", "Default CSS setting must be a boolean.");
  }
  return value;
}

function defaultOptions(): NormalizedConvertOptions {
  return {
    title: undefined,
    lang: "und",
    defaultCss: true,
    customCss: [],
    rawHtml: "escape",
    gfm: true,
    breaks: false
  };
}

function validateOptionalString(value: unknown, name: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Md2HtmlError("INVALID_OPTION", `${name} option must be a string.`);
  }
  return value;
}

function validateLanguage(value: unknown): string {
  if (value === undefined) {
    return "und";
  }
  if (typeof value !== "string" || !LANGUAGE_TAG.test(value)) {
    throw new Md2HtmlError(
      "INVALID_OPTION",
      "lang option must be a language tag containing only letters, numbers, and hyphens."
    );
  }
  return value;
}

function validateOptionalBoolean(value: unknown, name: string, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "boolean") {
    throw new Md2HtmlError("INVALID_OPTION", `${name} option must be a boolean.`);
  }
  return value;
}

function validateCustomCss(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === "string") {
    return [value];
  }
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) {
    throw new Md2HtmlError(
      "INVALID_OPTION",
      "customCss option must be a string or an array of strings."
    );
  }
  return [...value];
}

function validateRawHtml(value: unknown): RawHtmlMode {
  if (value === undefined) {
    return "escape";
  }
  if (value !== "escape" && value !== "allow") {
    throw new Md2HtmlError(
      "INVALID_OPTION",
      "rawHtml option must be either \"escape\" or \"allow\"."
    );
  }
  return value;
}

export type { ConvertOptions };
