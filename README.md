# md2html

Markdown文字列または1つのMarkdownファイルを、既定スタイル込みの自己完結したHTML文書へ変換するTypeScriptライブラリとCLIです。生成HTMLは外部CDN、Webフォント、JavaScriptへ依存しません。

## 対応環境

- Node.js `>=22.18.0`
- ESM、CJS、およびES2022対応ブラウザバンドラー向けのライブラリ出力

公開パッケージ名は`@katsu996/md2html`です。公開後は次の形式で導入できます。

```bash
pnpm add @katsu996/md2html
```

## ライブラリ

```ts
import { convertMdToHtml } from "@katsu996/md2html";

const document = convertMdToHtml("# Hello", { lang: "ja" });
document.customCss(".md2html h1 { color: red; }");

console.log(document.toString());
console.log(`${document}`);
```

チェーン形式も利用できます。

```ts
const html = convertMdToHtml("# Hello")
  .title("Greeting")
  .customCss(".md2html h1 { color: blue; }")
  .toString();
```

### `convertMdToHtml(markdown, options)`

| option       | 既定値                      | 内容                                   |
| ------------ | --------------------------- | -------------------------------------- |
| `title`      | H1または`Markdown Document` | HTMLの`title`                          |
| `lang`       | `und`                       | 文書言語タグ                           |
| `defaultCss` | `true`                      | 既定の記事CSSを含めるか                |
| `customCss`  | `[]`                        | 文字列または文字列配列の追加CSS        |
| `rawHtml`    | `escape`                    | `escape` または `allow`                |
| `gfm`        | `true`                      | table、取り消し線、task list等を有効化 |
| `breaks`     | `false`                     | 単一改行を`<br>`へ変換                 |

`HtmlDocument`は`title(value)`、`lang(value)`、`customCss(css)`、`useDefaultCss(enabled?)`を持ち、すべて同一インスタンスを返します。CSSの適用順は、ブラウザ既定 → `DEFAULT_CSS` → `options.customCss` → `document.customCss()`の呼び出し順です。

`DEFAULT_CSS`、`HtmlDocument`、`Md2HtmlError`もexportされます。ライブラリで発生する安定エラーコードは`INVALID_ARGUMENT`、`INVALID_OPTION`、`MARKDOWN_PARSE_FAILED`、`HTML_BUILD_FAILED`です。

## CLI

```text
md2html <input.md | -> [options]
```

```bash
# input.html を入力ファイルと同じ場所へ作成
md2html input.md

# CSS、title、langを指定
md2html input.md -o output.html --css ./custom.css --title "My document" --lang ja

# stdinからstdoutへ出力
cat input.md | md2html - --stdout > output.html
```

| option                 | short       | 内容                           |
| ---------------------- | ----------- | ------------------------------ |
| `--output <path>`      | `-o`        | 出力HTMLファイル               |
| `--css <path>`         |             | UTF-8のCSSファイル。複数指定可 |
| `--title <text>`       |             | HTMLタイトル                   |
| `--lang <tag>`         |             | 文書言語                       |
| `--no-default-css`     |             | 既定CSSを省略                  |
| `--allow-html`         |             | Markdown中の生HTMLを許可       |
| `--stdout`             |             | HTMLを標準出力へ出力           |
| `--force`              | `-f`        | 既存の出力ファイルを置換       |
| `--help` / `--version` | `-h` / `-v` | ヘルプ / バージョン            |

stdinでは`--stdout`または`--output`が必須です。ファイル入力では出力先を省略すると、拡張子を`.html`へ変更した同じディレクトリのファイルが選ばれます。既存出力は`--force`なしでは変更しません。入力Markdownまたは`--css`で渡したファイルと同じ出力先は、`--force`を指定しても拒否します。

## 安全性

- 既定ではMarkdown中の生HTMLをHTML文字参照へエスケープします。
- linkは`http`、`https`、`mailto`、`tel`、相対URL、fragmentだけを許可します。imageは`http`、`https`、相対URLだけを許可します。
- `javascript:`、`vbscript:`、`data:`、`file:`および難読化されたスキームはリンク化せず、可読なテキストへ縮退します。
- title、lang、style要素の終端文字列は文脈別に検証またはエスケープします。

`--allow-html`または`rawHtml: "allow"`は、信頼できるMarkdown専用です。このモードはHTMLをサニタイズせず、`script`要素、イベント属性、危険URLを含む生HTMLをそのまま許可します。信頼できない入力には使用しないでください。

## 開発

このリポジトリのパッケージマネージャーはpnpmです。バージョンは`mise.toml`で固定されています。mise未使用の環境ではcorepackを利用できます。

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:coverage
pnpm run build
pnpm pack --dry-run
```

`pnpm run build`はtsdownがpublintとattwを統合実行するため、パッケージ検証(package:check)は不要です。
