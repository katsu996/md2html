import type { Dirent } from "node:fs";
import { readdir, realpath, stat } from "node:fs/promises";
import { join } from "node:path";

import { writeFileAtomically } from "../../utils/atomic-write.js";
import { escapeHtmlAttribute, escapeHtmlText } from "../../utils/escape.js";
import { HtmlDocument } from "../html-document.js";
import { Md2HtmlError } from "../conversion/errors.js";
import { normalizeIndexPageOptions } from "../normalize.js";
import type {
  GenerateIndexResult,
  IndexPageEntry,
  IndexPageOptions,
  NormalizedIndexPageOptions
} from "../types.js";

const INDEX_FILE_NAME = "index.html";
const HTML_EXTENSION = /\.html$/iu;
const DEFAULT_INDEX_TITLE = "目次";
const NO_ENTRIES_TEXT = "HTMLファイルはありません。";

/**
 * Creates or updates the index page (index.html) for the given folder.
 * Lists the HTML files that currently exist directly inside the folder;
 * existing HTML files are never rewritten.
 */
export async function generateIndex(
  folderPath: string,
  options?: Readonly<IndexPageOptions>
): Promise<GenerateIndexResult> {
  if (typeof folderPath !== "string" || folderPath.length === 0) {
    throw new Md2HtmlError("INVALID_ARGUMENT", "Folder path must be a non-empty string.");
  }

  const normalizedOptions = normalizeIndexPageOptions(options);
  const entries = await collectIndexEntries(folderPath);
  const html = buildIndexPageHtml(entries, normalizedOptions);
  const indexPath = join(folderPath, INDEX_FILE_NAME);

  try {
    await writeFileAtomically({
      outputPath: indexPath,
      content: html,
      force: true,
      createError: (message, cause) => new Md2HtmlError("FILE_WRITE_FAILED", message, cause)
    });
  } catch (error) {
    if (error instanceof Md2HtmlError) {
      throw error;
    }
    throw new Md2HtmlError("FILE_WRITE_FAILED", `Cannot write index file: ${indexPath}`, error);
  }

  return { indexPath, entries };
}

/**
 * Collects the HTML files that exist directly inside the folder, in ascending
 * file name order (UTF-16 code unit order). The index file itself is excluded.
 */
export async function collectIndexEntries(folderPath: string): Promise<IndexPageEntry[]> {
  let dirents: Dirent[];
  try {
    dirents = await readdir(folderPath, { withFileTypes: true });
  } catch (error) {
    throw new Md2HtmlError(
      "INDEX_GENERATION_FAILED",
      `Cannot read folder for index generation: ${folderPath}`,
      error
    );
  }

  const indexPath = join(folderPath, INDEX_FILE_NAME);
  // On case-insensitive filesystems a differently cased candidate (e.g. INDEX.html)
  // is the same real file as the index to be written; realpath identity detects it
  // without lowercasing names. On case-sensitive filesystems it stays listed.
  const indexRealPath = await resolveRealPath(indexPath);

  const entries: IndexPageEntry[] = [];
  for (const dirent of dirents) {
    const fileName = dirent.name;
    if (!dirent.isFile() || !HTML_EXTENSION.test(fileName) || fileName === INDEX_FILE_NAME) {
      continue;
    }
    const candidatePath = join(folderPath, fileName);
    if (indexRealPath !== undefined && (await resolveRealPath(candidatePath)) === indexRealPath) {
      continue;
    }
    const createdAt = await readCreationTime(candidatePath);
    entries.push({
      fileName,
      href: encodeURIComponent(fileName),
      createdAt,
      createdAtText: createdAt === undefined ? "" : formatLocalTimestamp(createdAt)
    });
  }

  entries.sort((first, second) => (first.fileName < second.fileName ? -1 : first.fileName > second.fileName ? 1 : 0));
  return entries;
}

/** Builds the self-contained index page HTML from the collected entries. */
export function buildIndexPageHtml(
  entries: readonly IndexPageEntry[],
  options: Readonly<NormalizedIndexPageOptions>
): string {
  const title = options.siteTitle ?? DEFAULT_INDEX_TITLE;
  const document = HtmlDocument.fromRenderedMarkdown(
    indexBodyHtml(entries, title),
    undefined,
    title,
    options.lang,
    options.defaultCss,
    options.customCss,
    title
  );
  return document.toString();
}

function indexBodyHtml(entries: readonly IndexPageEntry[], title: string): string {
  const heading = `<h1>${escapeHtmlText(title)}</h1>`;
  if (entries.length === 0) {
    return `${heading}\n<p class="md2html-index-empty">${NO_ENTRIES_TEXT}</p>`;
  }

  const items = entries.map((entry) => {
    const time = entry.createdAt === undefined
      ? ""
      : `<time datetime="${escapeHtmlAttribute(formatLocalTimestamp(entry.createdAt, "T"))}">${entry.createdAtText}</time>`;
    return `  <li><a href="${escapeHtmlAttribute(entry.href)}">${escapeHtmlText(entry.fileName)}</a>${time}</li>`;
  });
  return `${heading}\n<ul class="md2html-index">\n${items.join("\n")}\n</ul>`;
}

async function readCreationTime(path: string): Promise<Date | undefined> {
  try {
    const stats = await stat(path);
    return stats.birthtimeMs > 0 ? stats.birthtime : stats.mtime;
  } catch {
    return undefined;
  }
}

function formatLocalTimestamp(date: Date, separator = " "): string {
  return `${pad(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}${separator}${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function resolveRealPath(path: string): Promise<string | undefined> {
  try {
    return await realpath(path);
  } catch {
    return undefined;
  }
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
