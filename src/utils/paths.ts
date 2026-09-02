import { basename, extname } from "node:path";

/** Derives the default output path: input path with the extension replaced by .html. */
export function defaultOutputPath(inputPath: string): string {
  const extension = extname(inputPath);
  return extension.length === 0 ? `${inputPath}.html` : `${inputPath.slice(0, -extension.length)}.html`;
}

/** Returns the input file basename without its extension. */
export function inputBasenameWithoutExtension(inputPath: string): string {
  const name = basename(inputPath);
  const extension = extname(name);
  return extension.length === 0 ? name : name.slice(0, -extension.length);
}
