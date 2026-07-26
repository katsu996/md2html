import { realpath } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";

import type { CliRunArguments } from "./args.js";
import { CliUsageError } from "./errors.js";

export interface PathPlan {
  inputPath: string | undefined;
  inputDisplayName: string;
  outputPath: string | undefined;
  outputDisplayName: string | undefined;
  cssPaths: string[];
  cssDisplayNames: string[];
  stdin: boolean;
  stdout: boolean;
}

/** Resolves CLI paths and rejects output aliases of protected input files. */
export async function resolvePathPlan(args: CliRunArguments): Promise<PathPlan> {
  if (args.output !== undefined && args.stdout) {
    throw new CliUsageError("--output and --stdout cannot be used together.");
  }

  const stdin = args.input === "-";
  if (stdin && args.output === undefined && !args.stdout) {
    throw new CliUsageError("Standard input requires --stdout or --output.");
  }

  const inputPath = stdin ? undefined : resolve(args.input);
  const outputPath = determineOutputPath(args, inputPath);
  const cssPaths = args.css.map((path) => resolve(path));

  if (outputPath !== undefined) {
    const protectedPaths = [inputPath, ...cssPaths].filter(
      (path): path is string => path !== undefined
    );
    for (const protectedPath of protectedPaths) {
      if (await pathsReferToSameFile(outputPath, protectedPath)) {
        throw new CliUsageError("Output path must not be the input Markdown or a CSS input file.");
      }
    }
  }

  return {
    inputPath,
    inputDisplayName: args.input,
    outputPath,
    outputDisplayName: args.output ?? (inputPath === undefined ? undefined : outputPath),
    cssPaths,
    cssDisplayNames: [...args.css],
    stdin,
    stdout: args.stdout
  };
}

export function defaultOutputPath(inputPath: string): string {
  const extension = extname(inputPath);
  return extension.length === 0 ? `${inputPath}.html` : `${inputPath.slice(0, -extension.length)}.html`;
}

export function inputBasenameWithoutExtension(inputPath: string): string {
  const name = basename(inputPath);
  const extension = extname(name);
  return extension.length === 0 ? name : name.slice(0, -extension.length);
}

function determineOutputPath(args: CliRunArguments, inputPath: string | undefined): string | undefined {
  if (args.stdout) {
    return undefined;
  }
  if (args.output !== undefined) {
    return resolve(args.output);
  }
  if (inputPath === undefined) {
    return undefined;
  }
  return defaultOutputPath(inputPath);
}

async function pathsReferToSameFile(first: string, second: string): Promise<boolean> {
  if (first === second) {
    return true;
  }
  const [firstCanonical, secondCanonical] = await Promise.all([
    canonicalPath(first),
    canonicalPath(second)
  ]);
  return firstCanonical === secondCanonical;
}

async function canonicalPath(path: string): Promise<string> {
  let current = path;
  const missingSegments: string[] = [];

  for (;;) {
    try {
      const resolved = await realpath(current);
      return join(resolved, ...missingSegments);
    } catch (error) {
      if (!isMissingPathError(error)) {
        return path;
      }
      const parent = dirname(current);
      if (parent === current) {
        return path;
      }
      missingSegments.unshift(basename(current));
      current = parent;
    }
  }
}

function isMissingPathError(error: unknown): boolean {
  return isNodeErrorWithCode(error, "ENOENT") || isNodeErrorWithCode(error, "ENOTDIR");
}

function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
