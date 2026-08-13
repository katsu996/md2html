import { readFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import type { CliRunArguments } from "./args.js";
import { CliOperationError, CliUsageError } from "./errors.js";

const CONFIG_FILE_NAMES = [".md2htmlrc", ".md2htmlrc.json", "md2html.config.json"] as const;
const CONFIG_KEYS = new Set(["css", "title", "lang", "defaultCss", "allowHtml"]);
const LANGUAGE_TAG = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

interface NormalizedCliConfig {
  css: string[] | undefined;
  title: string | undefined;
  lang: string | undefined;
  defaultCss: boolean | undefined;
  allowHtml: boolean | undefined;
}

interface LoadedCliConfig {
  value: NormalizedCliConfig;
  path: string;
  directory: string;
}

/** Fully resolved CLI values after configuration and built-in defaults are applied. */
export interface EffectiveCliRunArguments {
  input: string;
  output: string | undefined;
  css: string[];
  cssBaseDirectory: string;
  title: string | undefined;
  lang: string | undefined;
  defaultCss: boolean;
  allowHtml: boolean;
  stdout: boolean;
  force: boolean;
  configPath: string | undefined;
}

/** Loads optional project configuration and applies CLI-over-config precedence. */
export async function resolveCliConfiguration(
  args: CliRunArguments,
  workingDirectory: string
): Promise<EffectiveCliRunArguments> {
  const startDirectory = resolve(workingDirectory);
  const loaded = args.config !== undefined
    ? await loadExplicitConfig(resolve(startDirectory, args.config))
    : args.searchConfig
      ? await searchForConfig(startDirectory)
      : undefined;
  const config = loaded?.value;
  const hasCliCss = args.css !== undefined;

  return {
    input: args.input,
    output: args.output,
    css: args.css ?? config?.css ?? [],
    cssBaseDirectory: hasCliCss ? startDirectory : loaded?.directory ?? startDirectory,
    title: args.title ?? config?.title,
    lang: args.lang ?? config?.lang,
    defaultCss: args.defaultCss ?? config?.defaultCss ?? true,
    allowHtml: args.allowHtml ?? config?.allowHtml ?? false,
    stdout: args.stdout,
    force: args.force,
    configPath: loaded?.path
  };
}

async function searchForConfig(startDirectory: string): Promise<LoadedCliConfig | undefined> {
  let directory = startDirectory;

  for (;;) {
    const packageConfig = await loadPackageConfig(join(directory, "package.json"), false);
    if (packageConfig !== undefined) {
      return packageConfig;
    }

    for (const name of CONFIG_FILE_NAMES) {
      const path = join(directory, name);
      const source = await readOptionalConfigFile(path);
      if (source !== undefined) {
        return loadedConfig(normalizeConfig(parseJson(source, path), path), path);
      }
    }

    const parent = dirname(directory);
    if (parent === directory) {
      return undefined;
    }
    directory = parent;
  }
}

async function loadExplicitConfig(path: string): Promise<LoadedCliConfig> {
  if (basename(path) === "package.json") {
    const config = await loadPackageConfig(path, true);
    if (config === undefined) {
      throw new CliUsageError(`No "md2html" configuration was found in: ${path}`);
    }
    return config;
  }

  const source = await readRequiredConfigFile(path);
  return loadedConfig(normalizeConfig(parseJson(source, path), path), path);
}

async function loadPackageConfig(
  path: string,
  required: boolean
): Promise<LoadedCliConfig | undefined> {
  const source = required
    ? await readRequiredConfigFile(path)
    : await readOptionalConfigFile(path);
  if (source === undefined) {
    return undefined;
  }

  const packageJson = parseJson(source, path);
  if (!isRecord(packageJson)) {
    throw new CliUsageError(`package.json must contain a JSON object: ${path}`);
  }
  if (!Object.prototype.hasOwnProperty.call(packageJson, "md2html")) {
    return undefined;
  }
  return loadedConfig(normalizeConfig(packageJson.md2html, path), path);
}

function loadedConfig(value: NormalizedCliConfig, path: string): LoadedCliConfig {
  return { value, path, directory: dirname(path) };
}

async function readRequiredConfigFile(path: string): Promise<string> {
  const source = await readOptionalConfigFile(path);
  if (source === undefined) {
    throw new CliOperationError(`Cannot read configuration file: ${path}`);
  }
  return source;
}

async function readOptionalConfigFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (isNodeErrorWithCode(error, "ENOENT") || isNodeErrorWithCode(error, "ENOTDIR")) {
      return undefined;
    }
    throw new CliOperationError(`Cannot read configuration file: ${path}`, error);
  }
}

function parseJson(source: string, path: string): unknown {
  try {
    return JSON.parse(source.replace(/^\uFEFF/, ""));
  } catch {
    throw new CliUsageError(`Invalid JSON in configuration file: ${path}`);
  }
}

function normalizeConfig(value: unknown, path: string): NormalizedCliConfig {
  if (!isRecord(value)) {
    throw new CliUsageError(`md2html configuration must be a JSON object: ${path}`);
  }

  for (const key of Object.keys(value)) {
    if (!CONFIG_KEYS.has(key)) {
      throw new CliUsageError(`Unknown md2html configuration option "${key}" in: ${path}`);
    }
  }

  return {
    css: optionalCssPaths(value.css, path),
    title: optionalString(value.title, "title", path),
    lang: optionalLanguage(value.lang, path),
    defaultCss: optionalBoolean(value.defaultCss, "defaultCss", path),
    allowHtml: optionalBoolean(value.allowHtml, "allowHtml", path)
  };
}

function optionalCssPaths(value: unknown, path: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  const paths = typeof value === "string" ? [value] : value;
  if (!Array.isArray(paths) || !paths.every((entry) => typeof entry === "string" && entry.length > 0)) {
    throw new CliUsageError(
      `md2html configuration option "css" must be a non-empty path or an array of paths: ${path}`
    );
  }
  return [...paths];
}

function optionalString(value: unknown, name: string, path: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new CliUsageError(`md2html configuration option "${name}" must be a string: ${path}`);
  }
  return value;
}

function optionalLanguage(value: unknown, path: string): string | undefined {
  const lang = optionalString(value, "lang", path);
  if (lang !== undefined && !LANGUAGE_TAG.test(lang)) {
    throw new CliUsageError(
      `md2html configuration option "lang" must contain only letters, numbers, and hyphens: ${path}`
    );
  }
  return lang;
}

function optionalBoolean(value: unknown, name: string, path: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw new CliUsageError(`md2html configuration option "${name}" must be a boolean: ${path}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
