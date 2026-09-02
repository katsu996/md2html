import { readFile } from "node:fs/promises";
import {
  cwd as processCwd,
  stdin as processStdin,
  stderr as processStderr,
  stdout as processStdout
} from "node:process";
import { dirname, join } from "node:path";

import { convertMarkdown } from "../core/convert.js";
import { Md2HtmlError } from "../core/errors.js";
import { generateIndex } from "../core/index-page.js";
import { writeFileAtomically as writeFileAtomicallyCommon, type AtomicWriteOperations, atomicWriteOperations } from "../utils/atomic-write.js";
import { inputBasenameWithoutExtension } from "../utils/paths.js";
import type { IndexPageOptions } from "../core/types.js";
import { resolveCliConfiguration } from "./config.js";
import { CliOperationError, CliUsageError } from "./errors.js";
import { resolvePathPlan } from "./paths.js";
import { helpText, parseCliArguments, VERSION } from "./args.js";

interface WritableOutput {
  write(chunk: string): boolean;
}

interface CliIo {
  stdin: AsyncIterable<unknown>;
  stdout: WritableOutput;
  stderr: WritableOutput;
}

const processIo: CliIo = {
  stdin: processStdin,
  stdout: processStdout,
  stderr: processStderr
};

/** Runs the CLI without calling process.exit, returning its documented exit code. */
export async function runCli(
  args: readonly string[],
  io: CliIo = processIo,
  workingDirectory = processCwd()
): Promise<number> {
  try {
    const parsed = parseCliArguments(args);
    if (parsed.kind === "help") {
      io.stdout.write(`${helpText()}\n`);
      return 0;
    }
    if (parsed.kind === "version") {
      io.stdout.write(`${VERSION}\n`);
      return 0;
    }

    const effective = await resolveCliConfiguration(parsed.value, workingDirectory);
    const plan = await resolvePathPlan(effective, workingDirectory);
    if (effective.index && plan.stdout) {
      throw new CliUsageError("--index cannot be used with --stdout.");
    }
    if (effective.index && plan.outputPath !== undefined
      && plan.outputPath === join(dirname(plan.outputPath), "index.html")) {
      throw new CliUsageError("--output cannot be index.html when --index is enabled; the index page would overwrite the converted HTML.");
    }
    const markdown = plan.stdin
      ? await readUtf8FromStdin(io.stdin)
      : await readInputFile(plan.inputPath, plan.inputDisplayName);
    const customCss = await readCssFiles(plan.cssPaths, plan.cssDisplayNames);
    const fallbackTitle = plan.inputPath === undefined
      ? "Markdown Document"
      : inputBasenameWithoutExtension(plan.inputPath);
    const document = convertMarkdown(markdown, {
      title: effective.title,
      lang: effective.lang,
      defaultCss: effective.defaultCss,
      customCss,
      rawHtml: effective.allowHtml ? "allow" : "escape"
    }, fallbackTitle, effective.index);
    const html = document.toString();

    if (plan.stdout) {
      io.stdout.write(html);
      return 0;
    }
    if (plan.outputPath === undefined || plan.outputDisplayName === undefined) {
      throw new CliUsageError("An output destination could not be determined.");
    }
    await writeFileAtomically(plan.outputPath, html, effective.force, plan.outputDisplayName);
    if (effective.index && plan.outputPath !== undefined) {
      const indexOptions: IndexPageOptions = {
        ...(effective.siteTitle === undefined ? undefined : { siteTitle: effective.siteTitle }),
        ...(effective.lang === undefined ? undefined : { lang: effective.lang }),
        defaultCss: effective.defaultCss,
        customCss
      };
      await generateIndex(dirname(plan.outputPath), indexOptions);
    }
    return 0;
  } catch (error) {
    const code = exitCodeForError(error);
    io.stderr.write(`md2html: error: ${errorMessage(error)}\n`);
    if (code === 2) {
      io.stderr.write("md2html: hint: Run 'md2html --help' for usage.\n");
    }
    return code;
  }
}

export async function writeFileAtomically(
  outputPath: string,
  content: string,
  force: boolean,
  displayName = outputPath,
  operations: AtomicWriteOperations = atomicWriteOperations
): Promise<void> {
  await writeFileAtomicallyCommon({
    outputPath,
    content,
    force,
    displayName,
    operations,
    createError: (message, cause) => new CliOperationError(message, cause)
  });
}

async function readInputFile(path: string | undefined, displayName: string): Promise<string> {
  if (path === undefined) {
    throw new CliOperationError("Input file path is unavailable.");
  }
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw new CliOperationError(`Cannot read input file: ${displayName}`, error);
  }
}

async function readCssFiles(paths: readonly string[], displayNames: readonly string[]): Promise<string[]> {
  const css: string[] = [];
  for (const [index, path] of paths.entries()) {
    const displayName = displayNames[index] ?? path;
    try {
      css.push(await readFile(path, "utf8"));
    } catch (error) {
      throw new CliOperationError(`Cannot read CSS file: ${displayName}`, error);
    }
  }
  return css;
}

async function readUtf8FromStdin(input: AsyncIterable<unknown>): Promise<string> {
  const chunks: Buffer[] = [];
  try {
    for await (const chunk of input) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (error) {
    throw new CliOperationError("Cannot read standard input.", error);
  }
}

function exitCodeForError(error: unknown): 1 | 2 {
  if (error instanceof CliUsageError || error instanceof Md2HtmlError && error.code === "INVALID_OPTION") {
    return 2;
  }
  return 1;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected failure.";
}
