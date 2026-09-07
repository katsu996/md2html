import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

import { writeFileAtomically } from "../../utils/atomic-write.js";
import { defaultOutputPath, inputBasenameWithoutExtension, pathsReferToSameFile } from "../../utils/paths.js";
import { convertMarkdown } from "../conversion/convert.js";
import { Md2HtmlError } from "../conversion/errors.js";
import { generateIndex } from "./index-page.js";
import { normalizeConvertOptions, validateOptionalBoolean, validateOptionalString } from "../normalize.js";
import type {
  ConvertMarkdownFileOptions,
  ConvertMarkdownFileResult,
  GenerateIndexResult,
  IndexPageOptions
} from "../types.js";

/**
 * Converts a Markdown file into an output HTML file and, when requested,
 * regenerates the index page of the output folder afterwards.
 */
export async function convertMarkdownFile(
  inputPath: string,
  options?: Readonly<ConvertMarkdownFileOptions>
): Promise<ConvertMarkdownFileResult> {
  if (typeof inputPath !== "string" || inputPath.length === 0) {
    throw new Md2HtmlError("INVALID_ARGUMENT", "Input path must be a non-empty string.");
  }

  const fileOptions = validateFileOptions(options);
  let markdown: string;
  try {
    markdown = await readFile(inputPath, "utf8");
  } catch (error) {
    throw new Md2HtmlError("FILE_READ_FAILED", `Cannot read input file: ${inputPath}`, error);
  }
  const outputPath = fileOptions.output ?? defaultOutputPath(inputPath);
  if (await pathsReferToSameFile(outputPath, inputPath)) {
    throw new Md2HtmlError("INVALID_OPTION", "output must not be the same file as the input Markdown.");
  }

  const document = convertMarkdown(
    markdown,
    options,
    inputBasenameWithoutExtension(inputPath),
    fileOptions.index
  );

  if (fileOptions.index && basename(resolve(outputPath)) === "index.html") {
    throw new Md2HtmlError(
      "INVALID_OPTION",
      "output must not be index.html when index is enabled; the index page would overwrite the converted HTML."
    );
  }
  try {
    await writeFileAtomically({
      outputPath,
      content: document.toString(),
      force: fileOptions.force,
      createError: (message, cause) => new Md2HtmlError("FILE_WRITE_FAILED", message, cause)
    });
  } catch (error) {
    if (error instanceof Md2HtmlError) {
      throw error;
    }
    throw new Md2HtmlError("FILE_WRITE_FAILED", `Cannot write output file: ${outputPath}`, error);
  }

  if (!fileOptions.index) {
    return { outputPath, index: undefined };
  }

  const normalizedOptions = normalizeConvertOptions(options);
  const indexOptions: IndexPageOptions = {
    ...(fileOptions.siteTitle === undefined ? undefined : { siteTitle: fileOptions.siteTitle }),
    lang: normalizedOptions.lang,
    defaultCss: normalizedOptions.defaultCss,
    customCss: normalizedOptions.customCss
  };
  const index: GenerateIndexResult = await generateIndex(dirname(outputPath), indexOptions);
  return { outputPath, index };
}

/**
 * @internal Validated subset of {@link ConvertMarkdownFileOptions}.
 *
 * Produced by `validateFileOptions()` and consumed by {@link convertMarkdownFile},
 * which is why this type shares data with the public file conversion options.
 */
export interface ValidatedFileOptions {
  output: string | undefined;
  force: boolean;
  index: boolean;
  siteTitle: string | undefined;
}

function validateFileOptions(options: unknown): ValidatedFileOptions {
  if (options === undefined) {
    return { output: undefined, force: false, index: false, siteTitle: undefined };
  }
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new Md2HtmlError("INVALID_OPTION", "Conversion options must be an object.");
  }

  const input = options as Record<string, unknown>;
  return {
    output: validateOptionalString(input.output, "output"),
    force: validateOptionalBoolean(input.force, "force", false),
    index: validateOptionalBoolean(input.index, "index", false),
    siteTitle: validateOptionalString(input.siteTitle, "siteTitle")
  };
}
