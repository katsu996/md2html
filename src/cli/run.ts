import { randomBytes } from "node:crypto";
import {
  access,
  link,
  open,
  readFile,
  rename,
  unlink,
  type FileHandle
} from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import {
  cwd as processCwd,
  stdin as processStdin,
  stderr as processStderr,
  stdout as processStdout
} from "node:process";

import { convertMarkdown } from "../core/convert.js";
import { Md2HtmlError } from "../core/errors.js";
import { helpText, parseCliArguments, VERSION } from "./args.js";
import { resolveCliConfiguration } from "./config.js";
import { CliOperationError, CliUsageError } from "./errors.js";
import { inputBasenameWithoutExtension, resolvePathPlan } from "./paths.js";

interface WritableOutput {
  write(chunk: string): boolean;
}

interface CliIo {
  stdin: AsyncIterable<unknown>;
  stdout: WritableOutput;
  stderr: WritableOutput;
}

interface AtomicWriteOperations {
  access(path: string): Promise<void>;
  open(path: string, flags: string, mode: number): Promise<FileHandle>;
  link(existingPath: string, newPath: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  unlink(path: string): Promise<void>;
}

const atomicWriteOperations: AtomicWriteOperations = { access, open, link, rename, unlink };

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
    }, fallbackTitle);
    const html = document.toString();

    if (plan.stdout) {
      io.stdout.write(html);
      return 0;
    }
    if (plan.outputPath === undefined || plan.outputDisplayName === undefined) {
      throw new CliUsageError("An output destination could not be determined.");
    }
    await writeFileAtomically(plan.outputPath, html, effective.force, plan.outputDisplayName);
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
  if (!force && await fileExists(outputPath, operations)) {
    throw new CliOperationError(`Output file already exists: ${displayName}`);
  }

  const tempPath = join(
    dirname(outputPath),
    `.${basename(outputPath)}.${randomBytes(12).toString("hex")}.md2html-tmp`
  );

  let tempCreated = false;
  try {
    const handle = await operations.open(tempPath, "wx", 0o600);
    tempCreated = true;
    try {
      await handle.writeFile(content, "utf8");
    } finally {
      await handle.close();
    }

    if (force) {
      await operations.rename(tempPath, outputPath);
    } else {
      await operations.link(tempPath, outputPath);
      await operations.unlink(tempPath);
    }
    tempCreated = false;
  } catch (error) {
    throw new CliOperationError(`Cannot write output file: ${displayName}`, error);
  } finally {
    if (tempCreated) {
      await operations.unlink(tempPath).catch(() => undefined);
    }
  }
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

async function fileExists(path: string, operations: Pick<AtomicWriteOperations, "access">): Promise<boolean> {
  try {
    await operations.access(path);
    return true;
  } catch (error) {
    if (isNodeErrorWithCode(error, "ENOENT")) {
      return false;
    }
    throw new CliOperationError(`Cannot access output file: ${path}`, error);
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

function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
