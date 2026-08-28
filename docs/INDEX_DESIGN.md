# 生成HTMLの目次（index.html）作成・更新機能 詳細設計書

- 対象: `md2html` CLIおよびNode.js公開API
- ステータス: 確定（詳細設計 #18 に一致）
- 親設計: [【詳細設計】生成HTMLの目次（index.html）作成・更新機能](https://github.com/katsu996/md2html/issues/18)
- 要件定義: [INDEX_REQUIREMENTS.md](./INDEX_REQUIREMENTS.md)（#16）

本書は #16 の「詳細設計時の検討事項」7項目をすべて解決し、実装可能な粒度まで確定したものである。

## 1. モジュール構成

```
src/
  core/
    index-page.ts        (新規) 目次収集・目次HTML生成
    convert-file.ts      (新規) convertMarkdownFile() ファイル変換ユースケース
    convert.ts           (修正) convertMarkdown() に backLink フラグを追加
    html-template.ts     (修正) backLink による「目次へ戻る」nav 出力
    html-document.ts     (修正) fromRenderedMarkdown() に backLink を透過
    types.ts             (修正) Md2HtmlErrorCode 拡張、IndexPage* 型定義
  utils/
    atomic-write.ts      (新規) writeFileAtomically() を cli/run.ts から移動
  cli/
    args.ts              (修正) --index / --site-title
    config.ts            (修正) EffectiveCliRunArguments へ反映
    run.ts               (修正) 目次生成呼び出し、--stdout 併用チェック
    paths.ts             (修正なし) defaultOutputPath() を convert-file.ts から再利用
  index.ts               (修正) 公開エクスポート追加
  styles/
    default-css.ts       (修正) 目次・戻るリンク用の最小スタイル追記
```

依存方向: `cli/*` → `core/*` → `utils/*`（現行どおり）。`core/index-page.ts` は `node:fs/promises` に依存する（ブラウザ非対応は現行CLI・ファイルAPIと同じ境界）。

## 2. 公開API設計（検討事項1の解決）

### 2.1 型定義（`src/core/types.ts` に追加し `src/index.ts` から再エクスポート）

```ts
/** 目次に掲載する1エントリ。 */
export interface IndexPageEntry {
  /** 目次対象HTMLのファイル名。表示名でもある（例: "report.html"）。 */
  fileName: string;
  /** index.html からの相対URL。percent-encoding済みの単一セグメント。 */
  href: string;
  /** 有効な作成日時。birthtimeが無効ならmtime、statに失敗したらundefined。 */
  createdAt: Date | undefined;
  /** 作成日時の表示値（"YYYY-MM-DD HH:mm"）。取得できない場合は ""。 */
  createdAtText: string;
}

/** generateIndex() のオプション。 */
export interface IndexPageOptions {
  /** 目次ページのタイトル・見出し。既定 "目次"。 */
  siteTitle?: string;
  /** 目次ページのlang属性。既定 "und"（既存変換APIと同一規則）。 */
  lang?: string;
  /** 既定CSS（テーマ切替含む）の適用。既定 true。 */
  defaultCss?: boolean;
  /** 追加CSS。既存のcustomCssと同一の検証・適用規則。 */
  customCss?: string | readonly string[];
}

/** generateIndex() の返却値。 */
export interface GenerateIndexResult {
  /** 作成・更新した目次ファイルのパス。join(folderPath, "index.html")。 */
  indexPath: string;
  /** 目次に掲載したエントリ（ファイル名昇順）。 */
  entries: IndexPageEntry[];
}

/** convertMarkdownFile() のオプション。ConvertOptions を継承する。 */
export interface ConvertMarkdownFileOptions extends ConvertOptions {
  /** 出力先HTMLパス。既定: 入力と同フォルダの拡張子を .html に置換したパス。 */
  output?: string;
  /** 出力HTMLの既存ファイル上書き許可。既定 false。目次には適用されない。 */
  force?: boolean;
  /** 変換成功後に目次を更新する。既定 false。 */
  index?: boolean;
  /** index: true のときの目次タイトル。既定 "目次"。 */
  siteTitle?: string;
}

/** convertMarkdownFile() の返却値。 */
export interface ConvertMarkdownFileResult {
  /** 書き込んだ出力HTMLのパス。 */
  outputPath: string;
  /** index: true のときの目次生成結果。それ以外は undefined。 */
  index: GenerateIndexResult | undefined;
}
```

### 2.2 関数シグネチャ

```ts
export async function generateIndex(
  folderPath: string,
  options?: Readonly<IndexPageOptions>
): Promise<GenerateIndexResult>;

export async function convertMarkdownFile(
  inputPath: string,
  options?: Readonly<ConvertMarkdownFileOptions>
): Promise<ConvertMarkdownFileResult>;
```

### 2.3 エラー設計

`Md2HtmlErrorCode` に次の3コードを追加する（既存4コードは変更しない）。

| コード | 発生条件 | `cause` |
| --- | --- | --- |
| `FILE_READ_FAILED` | 入力Markdown・目次対象HTMLのstatに失敗（ENOENT等） | Node.jsのエラー |
| `FILE_WRITE_FAILED` | 出力HTML・目次ファイルの書き込みに失敗 | Node.jsのエラー |
| `INDEX_GENERATION_FAILED` | 目次収集（readdir等）に失敗 | Node.jsのエラー |

オプション型違反は既存の `INVALID_ARGUMENT`（引数本体）・`INVALID_OPTION`（オプション値）を使う。メッセージは既存スタイル（英語・単文）に従い、失敗したパスを含める。CLIは `Md2HtmlError` を既存の `exitCodeForError()`（非使用エラー=1）でそのまま扱う。

### 2.4 `generateIndex()` の振る舞い

1. `folderPath` が非空文字列でなければ `INVALID_ARGUMENT`。
2. `readdir(folderPath, { withFileTypes: true })` で収集。ENOENT等は `INDEX_GENERATION_FAILED`。
3. `buildIndexPageHtml()` で目次HTMLを組み立て。
4. 既存の原子書き込み（テンポラリファイル→`rename`。`src/utils/atomic-write.ts` に移動した `writeFileAtomically()` を `force: true` 相当で呼ぶ）で `join(folderPath, "index.html")` に上書き。
5. `GenerateIndexResult` を返す。既存HTMLは一切読み書きしない。

### 2.5 `convertMarkdownFile()` の振る舞い

1. `inputPath` が非空文字列でなければ `INVALID_ARGUMENT`。読み込み失敗は `FILE_READ_FAILED`。
2. `normalizeMarkdown` → `renderMarkdown` → `HtmlDocument.fromRenderedMarkdown()` を直接呼ぶ（`index: true` のとき `backLink` を渡す）。`convertMdToHtml()` の純粋性は維持する。
3. 出力パス: `options.output`。省略時は既存CLIと同一の規則（`defaultOutputPath()`: 拡張子を `.html` に置換、拡張子なしなら付与）を `src/cli/paths.ts` から `src/core/convert-file.ts` 側へ移動せず共用化する（`paths.ts` から export し `convert-file.ts` が import）。
4. `writeFileAtomically(output, html, force)`。既存ファイルが存在し `force: false` なら `FILE_WRITE_FAILED`（メッセージは既存CLIの「already exists; use --force」と同趣旨）。
5. 書き込み成功後かつ `index: true` のときのみ、`generateIndex(dirname(output), { siteTitle, lang, defaultCss, customCss })` を実行する。変換・書き込みが失敗した時点で例外のため目次は更新されない（FR-02）。
6. `index` ページへは `lang`・`defaultCss`・`customCss` を伝播し、出力HTMLと整合させる（検討事項3）。

## 3. 目次の収集規則（検討事項4・7の解決）

### 3.1 収集

`src/core/index-page.ts` の `collectIndexEntries(folderPath)` が次の規則で収集する。

| 規則 | 設計 |
| --- | --- |
| 対象 | `readdir(dir, { withFileTypes: true })` で得た直接の子のうち `dirent.isFile() === true` かつ拡張子が `.html`（**大小文字を区別しない**: `/\.html$/i`） |
| 除外1 | ファイル名が `index.html` と**完全一致（小文字固定）**のもの=目次自身 |
| 除外2 | シンボリックリンク（`dirent.isFile()` が `false` になるため自然に除外。安全側の選択） |
| サブフォルダ | 走査しない（`readdir` が直接の子のみを返すため構造的に保証される） |
| 隠しファイル | `.` で始まる名前も実在HTMLなら掲載する |
| stat失敗 | エントリ自体は掲載する（実在する限り掲載が要件）。`createdAt` を `undefined` にする |

境界条件: 大文字小文字を区別するファイルシステムでは `INDEX.html` は `index.html` と別ファイルとして**掲載対象**になる。Windows（NTFS等の大文字小文字非保持FS）では生成される `index.html` が `INDEX.html` を上書きする。目次ファイル名は常に小文字 `index.html` 固定とする。

### 3.2 順序

ファイル名の**UTF-16コード単位の昇順**（`Array.prototype.sort` の既定比較と等価な明示的比較）。

- 根拠: ICUロケール照合はICUバージョンで結果が変わり得るため、既存の決定性要件（同一入力→同一出力）を環境非依存に満たすのはコード単位順である。
- 日本語ファイル名は五十音順にはならない（Unicode順）。これは仕様であり、自然順ソート（`numeric`照合）も対象外とする。

### 3.3 URLエンコード

`href = encodeURIComponent(fileName)`。

- 単一パスセグメントであるため `encodeURIComponent` が正しい。`A-Z a-z 0-9 - _ . ! ~ * ' ( )` はそのまま（すべてRFC 3986のpchar）、空白は `%20`、日本語はUTF-8のpercent-encodingになる。
- ローカルブラウザ（`file:` スキーム）で正しく遷移する。二重エンコードは行わない。
- `href` は `escapeHtmlAttribute()` を通して属性値に出力する。

## 4. 作成日時（検討事項2の解決）

| 状態 | `createdAt` | `createdAtText` |
| --- | --- | --- |
| `stat.birthtimeMs > 0` | `birthtime` | `YYYY-MM-DD HH:mm` |
| birthtime無効（0またはエポック初期値） | `mtime` | `YYYY-MM-DD HH:mm`（mtime由来） |
| `stat` に失敗 | `undefined` | `""`（表示は日時セルごと省略） |

- 整形は自前実装（`getFullYear()`等+ゼロ埋め）とし、実行環境のローカル時刻で出力する。`Intl`は使用しない（環境差と決定性の排除）。
- 要件の「作成日時」はファイルシステムのbirthtimeを指す。mtimeへの代替は表示値のみで、`createdAt` に由来情報を持たせ呼び出し元が判別できる。

## 5. 目次ページのHTML構造（検討事項3の解決）

目次ページは既存の `buildHtmlDocument()` を再利用して生成する。`bodyHtml` として次を渡す。

```html
<nav class="md2html-index-back" hidden><a href="index.html">目次へ戻る</a></nav>
<h1>資料一覧</h1>
<ul class="md2html-index">
  <li><a href="a.html">a.html</a><time datetime="2026-08-14T10:30">2026-08-14 10:30</time></li>
</ul>
<p class="md2html-index-empty" hidden>HTMLファイルはありません。</p>
```

- `hidden` 属性はテンプレート側で除去せず、組み立て時に不要な方だけ出力する（上記は説明用の両記載）。戻るnavは目次ページには出力しない。
- タイトル・見出し: `siteTitle ?? "目次"`。`<title>` と `<h1>` の両方に用いる。
- `defaultCss` が有効な場合は既存のテーマ切替ボタン・カラースキーム契約がそのまま適用される（テーマ機能の「既定CSSが有効な場合だけ出力」規則に従う）。
- 追記する既定CSSは最小の4セレクタのみ（DEFAULT_CSS の末尾、`@media print` より前）:
  - `.md2html-index-back` — article先頭の戻るリンクの余白
  - `.md2html-index` — リストの行間・`list-style` 調整
  - `.md2html-index time` — ブロック表示・`--md2html-muted` 色
  - `.md2html-index-empty` — 空フォルダ表示の余白
- `defaultCss: false` の場合は追記CSS・テーマDOMを出力しない（既存契約どおり。リンク・リストは素のHTMLとして機能する）。

## 6. 「目次へ戻る」リンク（検討事項5の解決）

- 出力位置: `<body>` 内、テーマ切替ボタンの直後・`<article>` の直前。

```html
<nav class="md2html-index-back"><a href="index.html">目次へ戻る</a></nav>
<article class="md2html">
```

- 実装: `HtmlTemplateInput` に `backLink?: boolean` を追加し、`buildHtmlDocument()` が `true` のとき上記navを先頭body部品として出力する。`HtmlDocument.fromRenderedMarkdown()` に第8引数として透過し、内部ユースケース `convertMarkdown()` に第4引数 `backLink?: boolean` を追加する。公開ビルダーメソッドには公開しない（`convertMdToHtml()` の出力は変更されない）。
- `href` は常に `index.html`（同一フォルダ相対）。文言は「目次へ戻る」固定（FR-10）。
- 注入対象は当該実行で書き込む出力HTMLのみ。既存HTMLの再書き込み・一括置換は行わない（FR-11）。`--index` なしでは `backLink` は渡らず現行出力と1バイトも変わらない。

## 7. CLI設計（検討事項6の解決）

### 7.1 オプション

| オプション | 型 | 既定 | 説明 |
| --- | --- | --- | --- |
| `--index` | boolean | false | 変換成功後に出力先フォルダの `index.html` を作成・更新する |
| `--site-title <t>` | string | なし | 目次ページのタイトル・見出し（`--index` 時に有効。省略時は「目次」） |

- ペアオプション（`--no-index` 等）は設けない。設定ファイルキー（`CONFIG_KEYS`）にも追加**しない**（明示的フラグとしてCLIのみ。将来拡張）。
- ヘルプ（`helpText()`）追記:

```
  --index            Generate or update index.html in the output folder after conversion.
  --site-title <t>   Title for the generated index page (default: 目次).
```

### 7.2 `runCli()` への組み込み

1. パース後、`--stdout` と `--index` の同時指定は `CliUsageError`（exit 2）: `--index cannot be used with --stdout.`（目次生成先フォルダが確定しないため）。
2. `plan.outputPath === undefined`（stdin入力かつ`--output`なし）のまま `--index` の場合は既存の「output could not be determined」使用エラーが先に発火する。追加チェック不要。
3. 変換: `convertMarkdown(markdown, options, fallbackTitle, effective.index)` — 第4引数で戻るリンクを注入。
4. `writeFileAtomically()` 成功後、`effective.index === true` なら `generateIndex(dirname(plan.outputPath), { siteTitle: effective.siteTitle, lang: effective.lang, defaultCss: effective.defaultCss, customCss })` を実行する。CSSは既存の読み込み済み文字列を使い再読込しない。
5. 目次生成の失敗は `Md2HtmlError` として既存catchへ流れ exit 1（FR-02: 変換失敗時は目次に到達しない）。
6. 成功時の標準出力は現行どおり無言。

### 7.3 処理フロー（要件定義書6章への対応）

1. 変換（戻るリンク込み） → 2. 出力HTML書き込み → 3. `dirname(output)` 直下を再収集（今回の出力HTMLを含む） → 4. `index.html` 原子上書き → 5. exit 0。

## 8. テスト設計

| ファイル | カバーコード | 主なケース |
| --- | --- | --- |
| `test/unit/index-page.test.ts` (新規) | 収集・生成 | 昇順、`index.html` 除外、大小文字拡張子、サブフォルダ除外、シンボリックリンク除外、隠しファイル、日本語・空白ファイル名のhref、birthtime/mtime/取得失敗の3状態、`siteTitle`・`lang`・`defaultCss: false`、空フォルダ表示、戻るnav非出力 |
| `test/unit/convert-file.test.ts` (新規) | ファイル変換API | `output` 既定規則、`force` 規則、`index` 連携、変換失敗時に目次不更新、戻るリンク含有、エラーコード（`FILE_READ_FAILED` 等） |
| `test/unit/cli-args-paths.test.ts` (追記) | CLIパース | `--index`、`--site-title`、`--stdout` 併用の使用エラー |
| `test/unit/document.test.ts` (追記) | テンプレート | `backLink` あり/なしの文書構造・属性エスケープ・決定性 |
| `test/integration/cli.test.ts` (追記) | CLI結合 | 受入基準11項目のうちCLI側9項目（一時ディレクトリで実施） |
| `test/integration/api.test.ts` (追記) | API結合 | `generateIndex()` 単独更新、`convertMarkdownFile()` の受入シナリオ、既存API非変化 |

既存テストの全維持を条件とし、`--index` なしの出力文字列が1バイトも変わらないことを既存スナップショット系テストで担保する。

## 9. 既存コードへの影響と非破壊確認

| 対象 | 影響 |
| --- | --- |
| `convertMdToHtml()` / `HtmlDocument` 公開ビルダー | なし（`backLink` は内部経路のみ） |
| 既存CLIオプション・設定ファイルキー・終了コード | なし（オプション追加のみ） |
| `writeFileAtomically()` | `src/cli/run.ts` → `src/utils/atomic-write.ts` への移動。シグネチャ不変、CLIはimport差替のみ |
| `DEFAULT_CSS` | セレクタ追記（既存セレクタ・変数を変更しない） |
| `Md2HtmlErrorCode` | 3コード追加（既存コード値は不変、union拡張は非破壊） |
| README / docs | `--index`・`--site-title`・新APIの追記、`docs/REQUIREMENTS.md` のリンク整備 |

## 10. 対象外（実装Issueに持ち越さないもの）

- サブフォルダ再帰、HTML削除、前後ナビゲーション、検索（要件どおり対象外）
- 設定ファイルでの `index` / `siteTitle` 既定値（将来拡張）
- 目次ページのカスタムテンプレート
