import {
  convertMdToHtml,
  type ConvertOptions,
  type HtmlDocument,
  Md2HtmlError,
  type Md2HtmlErrorCode,
  type RawHtmlMode
} from "../../src/index.js";

const mode: RawHtmlMode = "escape";
const options: ConvertOptions = { lang: "ja", rawHtml: mode, customCss: ["p { color: red; }"] };
const document: HtmlDocument = convertMdToHtml("# 型", options);
const html: string = document.title("型").toString();
const code: Md2HtmlErrorCode = "INVALID_OPTION";
const error = new Md2HtmlError(code, "invalid option");

void html;
void error;
