# 実装完了報告・レビュー引継ぎ票

## 1. ステータス

| 項目 | 記入 |
| --- | --- |
| 実装状態 | 一部完了（実装と自動検証は完了、実ブラウザ視覚確認のみ未実行） |
| 実装担当 | GPT-5.6 Terra |
| 作業開始日 | 2026-07-26 |
| 最終確認日 | 2026-07-27 |
| 基準revision | `35b51769e55e8531dd16e513023e3da9f741735c` |
| review対象revision | working tree（commit / pushなし） |
| commit / push状態 | 未実施 |

### 完了していない場合

Chrome browser-controlの接続初期化が、このWSL workspaceのsandbox URIを受け付けず失敗した。`test/fixtures/article.md`の実ブラウザによるdesktop / mobile / print確認だけが未実行である。CSSの静的確認、media query / print rule test、browser bundle smoke testは完了している。

## 2. 実装要約

Markdownを1回だけtoken化し、完全なHTMLを返す`convertMdToHtml`と可変・チェーン可能な`HtmlDocument`を実装した。独立Marked instanceでGFM、breaks、H1 title、table wrapper、disabled task checkboxを処理する。既定ではraw HTMLをescapeし、link / image URLの難読化を正規化して危険schemeを可読テキストへ縮退する。title、lang、style raw textは文脈別に検証またはescapeする。CLIはstdin/stdout、CSS複数指定、force、path保護、atomic writeを提供する。ESM/CJS/CLI/d.ts、README、tarball検証、security / integration testを整備した。

## 3. 実装環境

| 項目 | 値 |
| --- | --- |
| OS | Linux 6.18.33.2-microsoft-standard-WSL2 x86_64 |
| Node.js | 22.22.0（公式配布物をSHA-256照合して`/tmp`へ展開） |
| npm | 10.9.4 |
| TypeScript | 5.9.3 |
| marked | 18.0.7 |
| tsdown | 0.22.14 |
| Vitest | 4.1.10 |

## 4. タスク完了状況

| ID | 状態 | 主な成果物 | 補足 |
| --- | --- | --- | --- |
| I-00 | 完了 | 環境・revision・依存調査 | 開始時treeはクリーン。Node要件を維持。 |
| I-01 | 完了 | package/config/lockfile | strict TS、ESM/CJS、CLI、lint、coverage。 |
| I-02 | 完了 | 型、error、normalize、escape | runtime検証、BOM / zero-width、文脈別escape。 |
| I-03 | 完了 | `DEFAULT_CSS`、article fixture | DESIGN.md準拠。実機視覚確認のみ未実行。 |
| I-04 | 完了 | `HtmlDocument`、template | 完全HTML、CSS順、末尾LF、primitive。 |
| I-05 | 完了 | renderer、URL policy | raw HTML、GFM、URL安全化、title抽出。 |
| I-06 | 完了 | convert core、public exports | API、fallback title、stable error。 |
| I-07 | 完了 | args、paths | option契約、realpath / symlink保護。 |
| I-08 | 完了 | run、CLI entry | UTF-8 I/O、exit code、atomic write。 |
| I-09 | 一部完了 | 回帰/security/coverage test | 89 tests、branch 93.27%。視覚確認のみ未実行。 |
| I-10 | 完了 | README、package check、smoke | publint、ATTW、ESM/CJS/CLI/browser bundle。 |
| I-11 | 一部完了 | 本report、最終gate | 全自動gate pass。視覚確認の残課題あり。 |

## 5. 変更ファイル一覧

| ファイル | タスク | 変更目的 | リスク |
| --- | --- | --- | --- |
| `.gitignore`, `.npmrc`, `eslint.config.js` | I-01 | 生成物除外、npm peer解決、lint設定 | 低 |
| `package.json`, `package-lock.json`, `tsconfig.json`, `tsdown.config.ts`, `vitest.config.ts` | I-01, I-09, I-10 | 依存、build、test、package構成 | 中 |
| `scripts/package-check.mjs` | I-10 | 実tarballにpublint / ATTWを直接実行 | 低 |
| `src/index.ts`, `src/cli.ts` | I-01, I-06, I-08 | 公開entryとCLI entry | 高 |
| `src/core/types.ts`, `src/core/errors.ts`, `src/core/normalize.ts` | I-02 | 型、error、入力検証 | 高 |
| `src/core/html-document.ts`, `src/core/html-template.ts` | I-04 | BuilderとHTML template | 高 |
| `src/core/markdown-renderer.ts`, `src/core/convert.ts` | I-05, I-06 | token変換と変換use case | 高 |
| `src/utils/escape.ts`, `src/utils/url.ts`, `src/styles/default-css.ts` | I-02, I-03, I-05 | 安全utilityと既定CSS | 高 |
| `src/cli/args.ts`, `src/cli/errors.ts`, `src/cli/paths.ts`, `src/cli/run.ts` | I-07, I-08 | CLI契約、I/O、ファイル保護 | 高 |
| `test/fixtures/article.md`, `test/fixtures/type-usage.ts` | I-03, I-06 | article / 公開型fixture | 低 |
| `test/unit/normalize-escape.test.ts`, `test/unit/document.test.ts`, `test/unit/default-css.test.ts`, `test/unit/markdown-renderer.test.ts`, `test/unit/convert-errors.test.ts`, `test/unit/cli-args-paths.test.ts` | I-02–I-07 | unit、security、path test | 低 |
| `test/integration/api.test.ts`, `test/integration/cli.test.ts` | I-06, I-08, I-09 | API / CLI integration test | 低 |
| `README.md`, `docs/IMPLEMENTATION_REPORT.md` | I-10, I-11 | 利用者文書と引継ぎ | 低 |

## 6. 最終公開API

### exports

```typescript
export { convertMdToHtml, HtmlDocument, DEFAULT_CSS, Md2HtmlError };
export type { ConvertOptions, RawHtmlMode, Md2HtmlErrorCode };
```

### 型とsignature

```typescript
type RawHtmlMode = "escape" | "allow";
type Md2HtmlErrorCode = "INVALID_ARGUMENT" | "INVALID_OPTION" | "MARKDOWN_PARSE_FAILED" | "HTML_BUILD_FAILED";
interface ConvertOptions {
  title?: string; lang?: string; defaultCss?: boolean;
  customCss?: string | readonly string[]; rawHtml?: RawHtmlMode;
  gfm?: boolean; breaks?: boolean;
}
class Md2HtmlError extends Error { readonly name: "Md2HtmlError"; readonly code: Md2HtmlErrorCode; readonly cause: unknown; }
class HtmlDocument {
  title(value: string): this; lang(value: string): this; customCss(css: string): this;
  useDefaultCss(enabled?: boolean): this; toString(): string;
  [Symbol.toPrimitive](hint: "string" | "number" | "default"): string;
}
function convertMdToHtml(markdown: string, options?: Readonly<ConvertOptions>): HtmlDocument;
```

### 基本設計との差

D-01、D-02、D-03、D-04を参照。

## 7. 最終CLI仕様

### help出力

```text
Usage: md2html <input.md | -> [options]

Convert one Markdown input into a complete self-contained HTML document.

Options:
  -o, --output <path>     Write HTML to this file.
      --css <path>        Add a UTF-8 CSS file after the default CSS (repeatable).
      --title <text>      Set the HTML document title.
      --lang <tag>        Set the document language tag.
      --no-default-css    Do not include the built-in article stylesheet.
      --allow-html        Allow raw Markdown HTML. Use only with trusted Markdown.
      --stdout            Write HTML to standard output instead of a file.
  -f, --force             Replace an existing output file; never an input or CSS file.
  -h, --help              Show this help message.
  -v, --version           Show the version.

Input from '-' requires --stdout or --output. Without --output, file input is
written beside the input with a .html extension.
```

### 動作確認例

| ケース | 実行コマンド | 結果 |
| --- | --- | --- |
| ファイル変換 | `md2html input.md -o output.html` | exit 0、完全HTMLを書込み、stdout / stderrは空 |
| CSS指定 | `md2html input.md --css one.css --css two.css --title T --lang ja` | 指定順CSSとtitle / langを反映 |
| stdin/stdout | `printf '# T' \| md2html - --stdout` | HTMLだけをstdoutへ出力 |
| 既存出力拒否 | `md2html input.md -o existing.html` | exit 1、既存内容を保持 |
| force上書き | `md2html input.md -o existing.html --force` | exit 0、atomic replacement |

## 8. 設計差異・実装判断

| ID | 設計箇所 | 設計または課題 | 実装内容 | 理由 | 互換性・リスク |
| --- | --- | --- | --- | --- | --- |
| D-01 | 3.1 / 14.4 | 採用時安定版TypeScript | TypeScript 5.9.3へ固定、TS 7.0.2は不採用 | tsdown 0.22.14がTS 7 APIを実験的として扱った | 公開API / Node要件に影響なし |
| D-02 | 12.2 | URL正規化方式 | HTML entity decodeと最大4回percent decode後にscheme判定 | 大小文字、entity、percent、control偽装を防止 | 空白URLは安全側で拒否 |
| D-03 | 8.3 / 12.5 | no-forceの競合防止 | 一時ファイルから`link`で新規出力を作成 | renameだけではTOCTOU上書きがあり得る | link非対応filesystemは安全に失敗 |
| D-04 | 14.2 / 16.4 | package validatorのpack連携 | 一時tarballを生成してvalidatorへ直接渡し、ATTWはnode16 profile | npm 10 + publintの自動pack結果取得不具合を回避。engineはNode 22以上 | Node16 resolverのCJS/ESM/bundlerがgreen、Node10は対象外 |

## 9. セキュリティ実装

| 境界・脅威 | 防御 | 主な実装箇所 | 検証test |
| --- | --- | --- | --- |
| Markdown生HTML | 既定escape、allow時だけraw出力 | `markdown-renderer.ts` | `markdown-renderer.test.ts` |
| link URL | 許可scheme、正規化、unsafe text縮退 | `url.ts` | `markdown-renderer.test.ts` |
| image URL | http / https / 相対だけ許可 | `url.ts` | `markdown-renderer.test.ts` |
| title / lang | text escape / language tag検証 | `html-template.ts`, `normalize.ts` | `document.test.ts`, `normalize-escape.test.ts` |
| `</style>`注入 | case-insensitiveで`<\\/style`へ変換 | `escape.ts` | `normalize-escape.test.ts`, `document.test.ts` |
| Markdown / CSS上書き | lexical + realpath比較、forceでも拒否 | `paths.ts` | `cli-args-paths.test.ts`, `cli.test.ts` |
| 一時ファイル競合・残存 | random 96-bit名、`wx`、限定cleanup | `run.ts` | `cli.test.ts` |

### `rawHtml: "allow"` の制約

allow時はMarkdownのraw HTMLをそのまま出力し、script、event attribute、危険なraw HTML内URLをサニタイズしない。Markdown link / image tokenのURL policyは維持される。信頼できるMarkdown専用である。

## 10. 検証結果

| コマンド | 状態 | 結果要約 |
| --- | --- | --- |
| `npm ci` | pass | Node 22.22.0 / npm 10.9.4、241 packages、vulnerability 0。sandbox DNS失敗後に同lockfileでregistry接続を許可して再実行。 |
| `npm run typecheck` | pass | strict TSと公開型fixtureを含めexit 0。 |
| `npm run lint` | pass | ESLint exit 0、warning 0。 |
| `npm test` | pass | 8 test files / 89 tests。 |
| `npm run test:coverage` | pass | lines 97.00%、branches 93.27%、functions 98.79%、statements 96.77%。 |
| `npm run build` | pass | ESM / CJS / `.d.mts` / `.d.cts`、shebang付きCLIを生成。 |
| `npm run package:check` | pass | publint strictはAll good、ATTW node16 CJS / ESM / bundlerはgreen。 |
| `npm pack --dry-run` | pass | 10 files、unpacked 179.0 kB、source / test / coverageなし。 |
| `git diff --check` | pass | whitespace errorなし。 |

### 実行しなかった検証

Node 24 LTS、Node 26 current、Windows CLI、実ブラウザdesktop / mobile / print previewは未実行。残存リスクはOS固有rename / path差とCSS実レンダリング差である。

## 11. package smoke test

| 項目 | 結果 | 使用fixture・コマンド |
| --- | --- | --- |
| ESM import | pass | clean `/tmp` consumerにtarball導入後、`import { convertMdToHtml } from "md2html"`。 |
| CJS require | pass | 同consumerで`require("md2html")`。 |
| CLI from tarball | pass | `printf '# CLI smoke' \| node_modules/.bin/md2html - --stdout`。 |
| browser bundle | pass | tarball consumerからrolldown browser ESM bundle（68,278 bytes）、`node:` importなし。 |

### pack内容

```text
README.md
dist/bin/md2html.js
dist/bin/md2html.js.map
dist/lib/index.cjs
dist/lib/index.cjs.map
dist/lib/index.d.cts
dist/lib/index.d.mts
dist/lib/index.mjs
dist/lib/index.mjs.map
package.json
```

## 12. 視覚確認

| 項目 | 値 |
| --- | --- |
| 確認用fixture | `test/fixtures/article.md`（GFM table、task list、長いURL / code、image、日本語） |
| browser / renderer | Chrome browser-control接続を試行したがsandbox URI制約で初期化失敗 |
| デスクトップviewport | 未実行 |
| モバイルviewport | 未実行 |
| print確認 | 未実行（`@media print`の静的確認は実施） |
| 結果 | CSS selector、600px media query、print rule、browser bundleを静的確認。実画面確認は残る。 |

### 視覚上の既知課題

実機ブラウザ確認が未実行のため、特定ブラウザでの横overflow、印刷余白、font fallbackの見え方は未確認である。

## 13. 対応環境の確認

| 環境 | 状態 | 補足 |
| --- | --- | --- |
| Node.js 22 LTS | pass | Node 22.22.0で全自動検証、tarball smoke、Linux CLIを実行。 |
| Node.js 24 LTS | not run | runtimeなし。 |
| 現行Node.js | not run | runtimeなし。 |
| Linux CLI | pass | WSL2 Linux上でsource / tarball CLIを確認。 |
| Windows CLI | not run | Windows runtime interopがsandboxで利用不可。 |

## 14. 既知課題・残作業

| ID | 内容 | 影響 | 回避策 | 1.0.0 blocker |
| --- | --- | --- | --- | --- |
| K-01 | 実ブラウザのdesktop / mobile / print視覚確認が未実行 | CSS表示差を自動testだけでは捕捉できない | browser接続可能な環境でfixtureを確認 | no |

## 15. 公開前確認事項

| 項目 | 状態 | 必要な判断 |
| --- | --- | --- |
| npmパッケージ名 | 未確定 | `md2html`のregistry利用可否を所有者が確認。 |
| ライセンス | 未確定 | LICENSE本文を所有者が決定。 |
| author | 未確定 | package metadata値を所有者が決定。 |
| repository URL | 未確定 | package metadata URLを所有者が決定。 |
| npm publish | 未実施 | 所有者の明示承認が必要。 |

## 16. レビュー重点箇所

| 優先度 | ファイル・場所 | 理由 | 関連test |
| --- | --- | --- | --- |
| 高 | `src/utils/url.ts` `isAllowedUrl` | scheme偽装とlink / image差分 | `markdown-renderer.test.ts` |
| 高 | `src/core/markdown-renderer.ts` renderer overrides | raw HTML、URL縮退、table、checkbox | `markdown-renderer.test.ts` |
| 高 | `src/utils/escape.ts` `escapeStyleRawText` | style終端による文書構造破壊 | `normalize-escape.test.ts` |
| 高 | `src/core/html-template.ts` `buildHtmlDocument` | title / lang / CSS出力 | `document.test.ts` |
| 高 | `src/cli/paths.ts` `resolvePathPlan` | Markdown / CSS誤上書き、symlink | `cli-args-paths.test.ts` |
| 高 | `src/cli/run.ts` `writeFileAtomically` | force、競合、失敗時保護 | `cli.test.ts` |
| 高 | `package.json`, `tsdown.config.ts`, `src/index.ts` | exports / types / bin | package check、tarball smoke |

## 17. 再現手順

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
npm run package:check
npm pack --dry-run
git diff --check
git status --short
```

NodeがPATHにない環境ではNode.js 22.18.0以上をPATHへ追加する。ネットワーク制限環境ではnpm cacheにwritableな場所を設定する。

## 18. 実装者セルフレビュー

- [x] 要件定義と基本設計を再読した
- [x] 公開APIとCLI helpが文書と一致する
- [x] ライブラリ共通コードにNode.js builtinがない
- [x] CLIは共通変換coreを利用する
- [x] default modeのraw HTMLと危険URLをテストした
- [x] title、lang、style終端を文脈別に安全化した
- [x] 入力MarkdownとCSSの誤上書きをテストした
- [x] atomic write失敗時の既存出力保護をテストした
- [x] ESM/CJSの実行と型解決をtarballから確認した
- [ ] 実ブラウザによる視覚確認を行った（環境制約により未実行）
- [x] skip、TODO、FIXME、不要な型抑制がない
- [x] 実行していない検証と既知課題を明記した
- [x] commit、push、publish状態を正確に記載した
- [x] 本文にプレースホルダーが残っていない

## 19. レビュー担当への補足

公開metadataは意図的に推測していない。`name: "md2html"`は設計で指定されたローカル配布名であり、registry上の利用可否は未確認である。LICENSEが未提供のためtarballには含まれない。ATTWのNode 10 failureはpackage engineのNode 22以上と矛盾しないためpackage checkでは対象外にしている。
