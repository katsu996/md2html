import { parseArgs } from "node:util";

import { CliUsageError } from "./errors.js";

export const VERSION = "1.0.0";

export interface CliRunArguments {
  input: string;
  output: string | undefined;
  css: string[] | undefined;
  title: string | undefined;
  lang: string | undefined;
  defaultCss: boolean | undefined;
  allowHtml: boolean | undefined;
  stdout: boolean;
  force: boolean;
  config: string | undefined;
  searchConfig: boolean;
}

export type ParsedCliArguments =
  | { kind: "help" }
  | { kind: "version" }
  | { kind: "run"; value: CliRunArguments };

const OPTION_CONFIG = {
  output: { type: "string", short: "o" },
  css: { type: "string", multiple: true },
  title: { type: "string" },
  lang: { type: "string" },
  "default-css": { type: "boolean" },
  "no-default-css": { type: "boolean" },
  "allow-html": { type: "boolean" },
  "no-allow-html": { type: "boolean" },
  config: { type: "string" },
  "no-config": { type: "boolean" },
  stdout: { type: "boolean" },
  force: { type: "boolean", short: "f" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" }
} as const;

export function parseCliArguments(args: readonly string[]): ParsedCliArguments {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args: [...args],
      options: OPTION_CONFIG,
      allowPositionals: true,
      strict: true
    });
  } catch (error) {
    throw new CliUsageError(errorMessage(error));
  }

  if (parsed.values.help === true) {
    return { kind: "help" };
  }
  if (parsed.values.version === true) {
    return { kind: "version" };
  }
  if (parsed.positionals.length === 0) {
    throw new CliUsageError("An input Markdown file or '-' is required.");
  }
  if (parsed.positionals.length > 1) {
    throw new CliUsageError("Only one input Markdown file or '-' may be specified.");
  }

  const input = parsed.positionals[0];
  if (input === undefined) {
    throw new CliUsageError("An input Markdown file or '-' is required.");
  }

  const config = optionalString(parsed.values.config, "--config");
  if (config !== undefined && parsed.values["no-config"] === true) {
    throw new CliUsageError("--config and --no-config cannot be used together.");
  }

  return {
    kind: "run",
    value: {
      input,
      output: optionalString(parsed.values.output, "--output"),
      css: optionalStringArray(parsed.values.css, "--css"),
      title: optionalString(parsed.values.title, "--title"),
      lang: optionalString(parsed.values.lang, "--lang"),
      defaultCss: booleanOverride(
        parsed.values["default-css"],
        parsed.values["no-default-css"],
        "--default-css",
        "--no-default-css"
      ),
      allowHtml: booleanOverride(
        parsed.values["allow-html"],
        parsed.values["no-allow-html"],
        "--allow-html",
        "--no-allow-html"
      ),
      stdout: parsed.values.stdout === true,
      force: parsed.values.force === true,
      config,
      searchConfig: parsed.values["no-config"] !== true
    }
  };
}

export function helpText(): string {
  return `Usage: md2html <input.md | -> [options]

Convert one Markdown input into a complete self-contained HTML document.

Options:
  -o, --output <path>     Write HTML to this file.
      --css <path>        Add a UTF-8 CSS file after the default CSS (repeatable).
      --title <text>      Set the HTML document title.
      --lang <tag>        Set the document language tag.
      --default-css       Include the built-in stylesheet, overriding config.
      --no-default-css    Do not include the built-in article stylesheet.
      --allow-html        Allow raw Markdown HTML. Use only with trusted Markdown.
      --no-allow-html     Escape raw Markdown HTML, overriding config.
      --config <path>     Use this JSON configuration file.
      --no-config         Do not search for a configuration file.
      --stdout            Write HTML to standard output instead of a file.
  -f, --force             Replace output; never an input, CSS, or active config file.
  -h, --help              Show this help message.
  -v, --version           Show the version.

Configuration is searched from the current directory upward. CLI options override
configuration. Input from '-' requires --stdout or --output. Without --output,
file input is written beside the input with a .html extension.`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Invalid command line arguments.";
}

function optionalString(value: unknown, option: string): string | undefined {
  if (value === undefined || typeof value === "string") {
    return value;
  }
  throw new CliUsageError(`${option} requires a text value.`);
}

function optionalStringArray(value: unknown, option: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    return [...value];
  }
  throw new CliUsageError(`${option} requires one or more path values.`);
}

function booleanOverride(
  enabled: unknown,
  disabled: unknown,
  enabledOption: string,
  disabledOption: string
): boolean | undefined {
  if (enabled === true && disabled === true) {
    throw new CliUsageError(`${enabledOption} and ${disabledOption} cannot be used together.`);
  }
  if (enabled === true) {
    return true;
  }
  if (disabled === true) {
    return false;
  }
  return undefined;
}
