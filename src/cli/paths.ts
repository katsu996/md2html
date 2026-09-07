import { resolve } from "node:path";

import { defaultOutputPath, pathsReferToSameFile } from "../utils/paths.js";
import type { EffectiveCliRunArguments } from "./config.js";
import { CliUsageError } from "./errors.js";

/**
 * Resolved input/output routing for one CLI run.
 *
 * Derived from {@link EffectiveCliRunArguments} (which merges `CliRunArguments`
 * with the loaded config) by {@link resolvePathPlan}; the plan shares its
 * input/output/stdout data with the parsed CLI arguments.
 */
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
export async function resolvePathPlan(
  args: EffectiveCliRunArguments,
  workingDirectory = process.cwd()
): Promise<PathPlan> {
  if (args.output !== undefined && args.stdout) {
    throw new CliUsageError("--output and --stdout cannot be used together.");
  }

  const stdin = args.input === "-";
  if (stdin && args.output === undefined && !args.stdout) {
    throw new CliUsageError("Standard input requires --stdout or --output.");
  }

  const baseDirectory = resolve(workingDirectory);
  const inputPath = stdin ? undefined : resolve(baseDirectory, args.input);
  const outputPath = determineOutputPath(args, inputPath, baseDirectory);
  const cssPaths = args.css.map((path) => resolve(args.cssBaseDirectory, path));

  if (outputPath !== undefined) {
    const protectedPaths = [inputPath, ...cssPaths].filter(
      (path): path is string => path !== undefined
    );
    for (const protectedPath of protectedPaths) {
      if (await pathsReferToSameFile(outputPath, protectedPath)) {
        throw new CliUsageError("Output path must not be the input Markdown or a CSS input file.");
      }
    }
    if (args.configPath !== undefined && await pathsReferToSameFile(outputPath, args.configPath)) {
      throw new CliUsageError("Output path must not be the active configuration file.");
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

function determineOutputPath(
  args: EffectiveCliRunArguments,
  inputPath: string | undefined,
  workingDirectory: string
): string | undefined {
  if (args.stdout) {
    return undefined;
  }
  if (args.output !== undefined) {
    return resolve(workingDirectory, args.output);
  }
  if (inputPath === undefined) {
    return undefined;
  }
  return defaultOutputPath(inputPath);
}
