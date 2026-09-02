import { realpath } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";

/** Derives the default output path: input path with the extension replaced by .html. */
export function defaultOutputPath(inputPath: string): string {
  const extension = extname(inputPath);
  return extension.length === 0 ? `${inputPath}.html` : `${inputPath.slice(0, -extension.length)}.html`;
}

/** Returns whether two paths refer to the same file, following symlinks where they exist. */
export async function pathsReferToSameFile(first: string, second: string): Promise<boolean> {
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
      if (!(isNodeErrorWithCode(error, "ENOENT") || isNodeErrorWithCode(error, "ENOTDIR"))) {
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


function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

/** Returns the input file basename without its extension. */
export function inputBasenameWithoutExtension(inputPath: string): string {
  const name = basename(inputPath);
  const extension = extname(name);
  return extension.length === 0 ? name : name.slice(0, -extension.length);
}
