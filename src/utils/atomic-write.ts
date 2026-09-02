import { randomBytes } from "node:crypto";
import { access, link, open, rename, unlink, type FileHandle } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

export interface AtomicWriteOperations {
  access(path: string): Promise<void>;
  open(path: string, flags: string, mode: number): Promise<FileHandle>;
  link(existingPath: string, newPath: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  unlink(path: string): Promise<void>;
}

export const atomicWriteOperations: AtomicWriteOperations = { access, open, link, rename, unlink };

export interface AtomicWriteRequest {
  outputPath: string;
  content: string;
  force: boolean;
  displayName?: string;
  operations?: AtomicWriteOperations;
  /** Creates the error thrown for every write failure. */
  createError: (message: string, cause?: unknown) => Error;
}

/** Writes content through a temporary file and an atomic rename/link step. */
export async function writeFileAtomically(request: AtomicWriteRequest): Promise<void> {
  const displayName = request.displayName ?? request.outputPath;
  const operations = request.operations ?? atomicWriteOperations;
  const { createError } = request;

  if (!request.force && (await fileExists(request.outputPath, operations, createError))) {
    throw createError(`Output file already exists: ${displayName}`);
  }

  const tempPath = join(
    dirname(request.outputPath),
    `.${basename(request.outputPath)}.${randomBytes(12).toString("hex")}.md2html-tmp`
  );

  let tempCreated = false;
  try {
    const handle = await operations.open(tempPath, "wx", 0o600);
    tempCreated = true;
    try {
      await handle.writeFile(request.content, "utf8");
    } finally {
      await handle.close();
    }

    if (request.force) {
      await operations.rename(tempPath, request.outputPath);
    } else {
      await operations.link(tempPath, request.outputPath);
      await operations.unlink(tempPath);
    }
    tempCreated = false;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Output file already exists:")) {
      throw error;
    }
    throw createError(`Cannot write output file: ${displayName}`, error);
  } finally {
    if (tempCreated) {
      await operations.unlink(tempPath).catch(() => undefined);
    }
  }
}

async function fileExists(
  path: string,
  operations: AtomicWriteOperations,
  createError: (message: string, cause?: unknown) => Error
): Promise<boolean> {
  try {
    await operations.access(path);
    return true;
  } catch (error) {
    if (isNodeErrorWithCode(error, "ENOENT")) {
      return false;
    }
    throw createError(`Cannot access output file: ${path}`, error);
  }
}

export function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
