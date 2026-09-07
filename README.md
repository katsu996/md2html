# md2html

[![Codecov](https://codecov.io/gh/katsu996/md2html/graph/badge.svg)](https://app.codecov.io/gh/katsu996/md2html)

Markdown文字列または1つのMarkdownファイルを、既定スタイル込みの自己完結したHTML文書へ変換するTypeScriptライブラリとCLIです。生成HTMLは外部CSS、外部JavaScript、Webフォントへ依存しません。既定CSS付きのHTMLにはライト／ダークテーマ切替のための固定インラインJavaScriptを含みますが、JavaScriptが無効な環境でも端末設定に従うテーマ表示はCSSだけで機能します。

## 対応環境

- Node.js `>=22`
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

`convertMarkdownFile()`と`generateIndex()`は、さらに次の安定エラーコードを返します。

| コード | 発生条件 |
| ------ | -------- |
| `FILE_READ_FAILED` | 入力Markdownファイルの読み込みに失敗 |
| `FILE_WRITE_FAILED` | 出力HTML・目次ファイルの書き込みに失敗。既存出力が`force`なしで存在する場合も含む |
| `INDEX_GENERATION_FAILED` | 目次生成時のフォルダ読み取り（`readdir`）に失敗 |

### `convertMarkdownFile(inputPath, options)`

MarkdownファイルをHTMLファイルへ変換するNode.js向けAPIです。

| option      | 既定値                  | 内容                                                    |
| ----------- | ----------------------- | -------------------------------------------------------- |
| `output`    | 入力と同フォルダの`.html` | 出力先HTMLパス                                          |
| `force`     | `false`                 | 既存出力HTMLの上書き許可（目次には適用されない）          |
| `index`     | `false`                 | 変換成功後に出力先フォルダの目次（`index.html`）を更新    |
| `siteTitle` | `目次`                  | 目次ページのタイトル・見出し（`index: true`時に有効）     |

`index`を有効にした出力HTMLには「目次へ戻る」リンクが追加されます。`ConvertOptions`（`title`、`lang`、`defaultCss`、`customCss`等）も指定でき、`lang`・`defaultCss`・`customCss`は目次ページへも引き継がれます。

### `generateIndex(folderPath, options)`

既存HTMLだけを対象に、目次（`index.html`）を作成・更新します。Markdown変換も既存HTMLの書き換えも行いません。

```ts
const result = await generateIndex("./public", { siteTitle: "資料一覧" });
console.log(result.indexPath);  // ./public/index.html
console.log(result.entries);    // ファイル名・href・作成日時の一覧（昇順）
```

| option       | 既定値  | 内容                                     |
| ------------ | ------- | ------------------------------------------ |
| `siteTitle`  | `目次`  | 目次ページのタイトル・見出し              |
| `lang`       | `und`   | 目次ページの言語タグ                      |
| `defaultCss` | `true`  | 既定CSS（テーマ切替含む）の適用           |
| `customCss`  | `[]`    | 追加CSS                                   |

目次は出力先フォルダ直下に実在する`.html`（`index.html`自身を除く）をファイル名昇順で掲載し、エントリにはリンクとローカル時刻の作成日時（`YYYY-MM-DD HH:mm`）を表示します。手作業で作成したHTMLや対応するMarkdownを持たないHTMLも掲載対象です。詳細は[目次機能の要件定義](docs/INDEX_REQUIREMENTS.md)と[詳細設計](docs/INDEX_DESIGN.md)を参照してください。

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

# 変換後に出力先フォルダの目次（index.html）を作成・更新
md2html docs/report.md --index --site-title 資料一覧
```

| option                 | short       | 内容                               |
| ---------------------- | ----------- | ---------------------------------- |
| `--output <path>`      | `-o`        | 出力HTMLファイル                   |
| `--css <path>`         |             | UTF-8のCSSファイル。複数指定可     |
| `--title <text>`       |             | HTMLタイトル                       |
| `--lang <tag>`         |             | 文書言語                           |
| `--default-css`        |             | 設定にかかわらず既定CSSを使用      |
| `--no-default-css`     |             | 既定CSSを省略                      |
| `--allow-html`         |             | Markdown中の生HTMLを許可           |
| `--no-allow-html`      |             | 設定にかかわらず生HTMLをエスケープ |
| `--config <path>`      |             | 指定したJSON設定を使用             |
| `--no-config`          |             | 設定ファイルの自動探索を無効化     |
| `--stdout`             |             | HTMLを標準出力へ出力               |
| `--index`              |             | 変換成功後に出力先フォルダの目次（`index.html`）を作成・更新 |
| `--site-title <text>`  |             | 目次ページのタイトル・見出し（既定: 目次） |
| `--force`              | `-f`        | 既存の出力ファイルを置換           |
| `--help` / `--version` | `-h` / `-v` | ヘルプ / バージョン                |

stdinでは`--stdout`または`--output`が必須です。ファイル入力では出力先を省略すると、拡張子を`.html`へ変更した同じディレクトリのファイルが選ばれます。既存出力は`--force`なしでは変更しません。入力Markdown、`--css`で渡したファイル、または実際に読み込んだ設定ファイルと同じ出力先は、`--force`を指定しても拒否します。

### CLI設定ファイル

毎回同じ変換オプションを渡す代わりに、次のいずれかへJSON設定を置けます。

- `package.json`の`md2html`プロパティ
- `.md2htmlrc`
- `.md2htmlrc.json`
- `md2html.config.json`

例えば`md2html.config.json`は次のように記述します。

```json
{
  "css": ["./styles/article.css", "./styles/print.css"],
  "title": "Project documentation",
  "lang": "ja",
  "defaultCss": true,
  "allowHtml": false
}
```

`css`は1つの文字列でも文字列配列でも指定できます。相対CSSパスは設定ファイルがあるディレクトリを基準に解決されます。

新しいファイルを作りたくない場合は、既存の`package.json`へ同じ内容を追加できます。

```json
{
  "name": "example-project",
  "md2html": {
    "css": "./styles/article.css",
    "lang": "ja",
    "defaultCss": false
  }
}
```

設定はCLIを実行したカレントディレクトリから親ディレクトリへ探索します。各ディレクトリでは`package.json`、`.md2htmlrc`、`.md2htmlrc.json`、`md2html.config.json`の順に確認し、最初に見つかった設定だけを使用します。`package.json`に`md2html`プロパティがなければ探索を継続します。

優先順位は「CLIオプション > 読み込んだ設定 > 組み込み既定値」です。CLIで1つ以上の`--css`を渡した場合は設定側の`css`配列全体を置き換えます。特定ファイルを使う場合は`--config <path>`、一時的に設定を無視する場合は`--no-config`を指定してください。出力先、標準出力、既存ファイル置換のような実行単位の操作は、意図しない書き込みを避けるため設定項目には含めていません。

## 安全性

- 既定ではMarkdown中の生HTMLをHTML文字参照へエスケープします。
- `--allow-html`、`allowHtml: true`、`rawHtml: "allow"`はMarkdown中の生HTMLを**サニタイズせず**そのまま出力します。信頼できるMarkdown専用のオプションであり、信頼されない入力では有効化しないでください。
- linkは`http`、`https`、`mailto`、`tel`、相対URL、fragmentだけを許可します。imageは`http`、`https`、相対URLだけを許可します。
- `javascript:`、`vbscript:`、`data:`、`file:`および難読化されたスキームはリンク化せず、可読なテキストへ縮退します。
- title、lang、style要素の終端文字列は文脈別に検証またはエスケープします。

## ライト／ダークテーマ切替

既定CSS付きの生成HTMLには、画面右上にライト／ダークテーマ切替ボタンが含まれます。初期表示は端末の`prefers-color-scheme`に従い、ボタンでライトとダークを切り替えられます。

- 手動選択はそのページを開いている間だけ有効で、再読み込みすると自動選択へ戻ります。
- 端末設定の保存や追跡は行いません。CookieやWeb Storageは使用しません。
- `defaultCss: false`またはCLIの`--no-default-css`では、テーマ切替ボタンと制御スクリプトも出力されません。
- 印刷時は常にライト系で、切替ボタンは印刷されません。
- カスタムCSSから`data-md2html-theme`、`.md2html-theme-toggle`、`--md2html-*`変数を使って表示を上書きできます。
- Markdown中の画像自体の色は変更しません。

制御スクリプトは入力MarkdownやCSSをコードへ補間せず、外部通信、Cookie、Web Storageを使用しません。詳細は[カラーテーマ切替機能 要件定義書](docs/THEME_SWITCHING_REQUIREMENTS.md)を参照してください。

## パッケージ構成（`package.json` の論理3分割）

`package.json` は単一ファイルのため物理分割できません。代わりにフィールドを次の3群に分けて責務を管理します（単一ファイルの星型構造に由来する低凝集の文書化による補完）。

### Group A: Runtime / Metadata

公開パッケージの素性を表す群です。

- `name`、`version`、`description`、`license`、`author`
- `type`（`module`）、`sideEffects: false`
- `exports`（`./dist/lib/index` のESM/CJS条件と型定義）、`bin`（`md2html` → `./dist/bin/md2html.js`）
- `files`（`dist`、`README.md`、`LICENSE` のみ配布）

### Group B: Scripts

開発・検証・配布の操作を表す群です。`scripts` がハブになります。

- `build` / `dev`（tsdown）
- `typecheck`、`lint`、`test` / `test:watch` / `test:coverage` / `coverage:summary`
- `sample` / `sample:stdout`（動作確認用）
- `prepack`（`typecheck` → `test` → `build`）

### Group C: Publishing / Env

依存と公開・実行環境を表す群です。

- `dependencies`: `marked` のみ。ランタイム依存を1本に抑えることで、browser bundleへのNode.js builtin混入を防ぎます（[レビューガイド R-06](docs/REVIEW_GUIDE.md) と整合）。
- `devDependencies`: ビルド・検証用（`typescript`、`vitest`、`eslint`、`tsdown`、`publint`、`@arethetypeswrong/core` 等）。公開成果物には含まれません。
- `repository`、`engines`（`node >=22`）、`devEngines`、`publishConfig`（`access: public`）、`packageManager`（pnpm固定）

`devDependencies` → `package` → `dependencies` という参照の橋は設定上不可避であり、コード分割の対象外です。ランタイム依存を追加する場合は Group C の方針（browser bundleへの混入有無、R-06の確認項目）に照らして検討してください。

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
