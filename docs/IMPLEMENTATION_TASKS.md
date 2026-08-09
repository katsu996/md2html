# Terra向け実装タスク設計

## 1. この文書の使い方

この文書は、`md2html` 1.0.0の実装を担当するエージェントが、設計判断を暗黙に変更せず、テストを伴って実装を完了するための作業仕様である。

実装担当者は次の順で資料を読む。

1. `docs/REQUIREMENTS.md`
2. `docs/BASIC_DESIGN.md`
3. 本書
4. `DESIGN.md`
5. `docs/IMPLEMENTATION_REPORT.md`

競合時の優先順位は、ユーザーからの最新の明示指示、要件定義、基本設計、本書、実装上の便宜の順とする。基本設計から外れる必要がある場合は、変更を隠さず `IMPLEMENTATION_REPORT.md` の「設計差異」へ記録する。

## 2. 実装開始用プロンプト

Terraへは、次の依頼文をそのまま渡せる。

```text
docs/REQUIREMENTS.md、docs/BASIC_DESIGN.md、
docs/IMPLEMENTATION_TASKS.mdを順に読み、I-00から依存順に全タスクを実装してください。

各タスクでは、そのタスクに記載されたテストも同時に追加し、受入条件を満たしてから
次へ進んでください。設計と異なる判断が必要なら、公開API・安全性・CLI動作へ影響する
変更は勝手に確定せず、理由と候補を示してください。軽微な実装判断は進めて構いませんが、
docs/IMPLEMENTATION_REPORT.mdの設計差異または補足へ記録してください。

実装中は既存のユーザー変更を保持し、破壊的なgit操作、commit、push、npm publishは
依頼されない限り行わないでください。全実装と検証が完了したら、
docs/IMPLEMENTATION_REPORT.mdを実際の結果で埋め、プレースホルダーを残さず引き渡してください。
```

## 3. 完了条件

次をすべて満たしたときだけ「実装完了」とする。

- I-00からI-11までが完了している。
- 公開APIとCLIが基本設計どおり動作する。
- 変更した処理には正常系、境界値、失敗系のテストがある。
- 型検査、lint、単体テスト、統合テスト、coverage、build、package検証が成功する。
- ESM import、CJS require、ビルド済みCLI起動をpackした成果物で確認している。
- Markdown、title、lang、URL、raw HTML、CSS終端文字列の安全テストが成功する。
- 既存出力、入力Markdown、入力CSSを誤って上書きしない。
- 既定CSSをデスクトップ幅、モバイル幅、印刷想定で確認している。
- READMEに公開API、CLI、安全上の注意、対応環境を記載している。
- `docs/IMPLEMENTATION_REPORT.md` が実際の実装内容と一致する。
- `TODO`, `FIXME`, テストのskip、説明のない型抑制を残していない。
- `git diff --check` が成功し、秘密情報や一時ファイルを含めていない。

ライセンス、author、repository URL、npmパッケージ名の空き確認は所有者判断であり、実装完了を妨げない。ただし、値を推測して作成せず、公開前確認事項として報告する。

## 4. 品質ルール

### 4.1 実装

- ライブラリ共通コードから `node:*` をimportしない。
- CLIから独自のMarkdown変換処理を実装せず、共通コアを呼ぶ。
- `marked` のグローバル設定を変更せず、独立インスタンスを使用する。
- `any` を使用しない。外部入力とcatch値は `unknown` から絞り込む。
- 型アサーション、non-null assertion、lint無効化は最小範囲とし、必要性をコメントまたは報告へ残す。
- 公開型へ `marked` 固有型、Node.js固有型、内部状態を露出させない。
- エラーを握り潰さない。利用者が対処できる文脈を付け、必要なら `cause` を保持する。
- エラーメッセージへMarkdown本文、CSS全文、秘密情報を含めない。
- 同じ入力と設定から、時刻や絶対パスに依存しない決定的なHTMLを生成する。
- ファイルは責務単位に分ける。循環依存を作らない。
- 依存追加は、標準APIまたは既存依存で代替できない場合だけ行い、理由を報告する。

### 4.2 テスト

- 実装とテストを同じタスクで行う。
- スナップショットだけで安全性を証明せず、重要な属性や不許可文字列を明示assertする。
- OS、カレントディレクトリ、タイミングへ不要に依存しない。
- CLIテストは実際の引数、終了コード、stdout、stderr、ファイル内容を確認する。
- 失敗系では「失敗したこと」だけでなく、保護対象ファイルが変更されていないことも確認する。
- privateメソッドの実装詳細より公開動作を優先してテストする。
- coverage不足を無意味な分岐テストで埋めず、未検証リスクを減らす。

### 4.3 変更管理

- 既存の未追跡・未commit変更もユーザー所有物として保持する。
- 要件定義を実装に合わせて書き換えない。
- 基本設計の変更が必要なら、コード変更と設計差異を一対一で追跡可能にする。
- 生成物、coverage、packしたtarball、一時HTMLをgit管理対象へ入れない。
- commit、push、PR、npm publishは、ユーザーから明示依頼がある場合だけ行う。

## 5. タスク一覧

| ID | タスク | 主成果物 | 依存 |
| --- | --- | --- | --- |
| I-00 | 現状確認と実装前提の固定 | 調査結果、前提記録 | なし |
| I-01 | プロジェクト基盤とビルド | package/config/lockfile | I-00 |
| I-02 | 公開型、エラー、入力検証、escape | 基盤utilityと単体テスト | I-01 |
| I-03 | 既定CSS | `DEFAULT_CSS`と確認fixture | I-01, I-02 |
| I-04 | HTML文書Builderとtemplate | `HtmlDocument`、完全HTML | I-02, I-03 |
| I-05 | Markdown Renderer | token解析、本文HTML、安全URL | I-02 |
| I-06 | 変換ユースケースと公開API | `convertMdToHtml`, exports | I-04, I-05 |
| I-07 | CLI引数とパス解決 | args/help/path policy | I-01, I-02 |
| I-08 | CLI入出力と安全な書込み | CLI実行処理 | I-06, I-07 |
| I-09 | 回帰・セキュリティ・視覚検証 | 網羅テストと検証結果 | I-08 |
| I-10 | パッケージと利用者文書 | README、pack smoke test | I-09 |
| I-11 | 最終品質ゲートと引継ぎ | 完了報告 | I-10 |

I-03とI-05、I-04とI-05は依存範囲が重ならない限り作業順を入れ替えてよい。完了判定は一覧の依存関係を満たす順で行う。

## 6. タスク詳細

### I-00 現状確認と実装前提の固定

#### 目的

ユーザー変更を失わず、設計資料と実行環境を確認してから実装を開始する。

#### 作業

- リポジトリの指示ファイル、状態、追跡済みファイルを確認する。
- Node.js、npmのバージョンを確認する。
- Node.js 22.18.0以上で作業できることを確認する。
- `marked`, `tsdown`, TypeScript, Vitestの採用時安定版と対応Node.jsを公式情報で確認する。
- npmパッケージ名、ライセンス等の未確定事項を識別する。
- 基本設計と実装タスクの矛盾があれば、コード変更前に整理する。

#### 成果物

- 選択した依存バージョンが `package.json` とlockfileに反映される準備
- `IMPLEMENTATION_REPORT.md` の「実装環境」「公開前確認事項」の初期記入

#### 受入条件

- 既存変更と実装開始前の基準revisionを識別できる。
- 未確定の公開情報を推測で埋めていない。
- 対応外Node.jsしか使えない場合は、黙ってengine要件を下げずユーザーへ報告している。

### I-01 プロジェクト基盤とビルド

#### 目的

strict TypeScript、テスト、ESM/CJS、CLIを継続的に検証できる基盤を作る。

#### 主な対象

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsdown.config.ts`
- `vitest.config.ts`
- lint設定
- `.gitignore`
- 最小エントリーファイル

#### 作業

- 基本設計14章のexports、bin、engine、scriptsを実装する。
- `marked` だけをruntime dependencyにする。
- ライブラリをneutralなESM/CJS、CLIをNode.js向けESMとして設定する。
- ESM/CJSそれぞれに適合する型定義を生成する。
- CLIのshebangがビルド後も保持される設定にする。
- npm packageへ含めるファイルを制限する。
- coverage、dist、tarball、一時ファイルをignoreする。

#### 必須テスト・確認

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
git diff --check
```

この段階では空実装のsmoke testでよいが、全コマンドが実行可能でなければならない。

#### 受入条件

- strict系TypeScriptオプションが有効である。
- `dist/lib` にESM、CJS、対応型定義が生成される。
- `dist/bin` にshebang付きCLIが生成される。
- package exportsが実際の生成ファイルを指す。
- `src` やtest fixtureがpack対象にならない。
- runtime dependencyを不用意にバンドルしていない。

### I-02 公開型、エラー、入力検証、escape

#### 目的

外部入力を安全に扱う基盤を、変換処理より先に確立する。

#### 主な対象

- `src/core/types.ts`
- `src/core/errors.ts` または同等責務
- `src/utils/escape.ts`
- オプション正規化モジュール
- 対応する単体テスト

#### 作業

- `ConvertOptions`, `RawHtmlMode`, `Md2HtmlErrorCode`, `Md2HtmlError` を実装する。
- 文字列、boolean、配列、raw HTML mode、langを実行時検証する。
- optionオブジェクトとCSS配列を防御的にコピーする。
- HTMLテキスト、HTML属性、style raw textを別関数として扱う。
- `</style` を大文字小文字を問わず終端タグにならない形へ変換する。
- Markdown先頭のBOMと既知のゼロ幅文字を除去する。

#### 必須テスト

- null、配列、オブジェクト等をMarkdownとして渡した場合
- optionの各不正型
- `rawHtml` の不正値
- 正常なlangと、引用符・空白・山括弧を含む不正lang
- titleの `&`, `<`, `>`
- CSS内の `</style>`, `</StYlE>`, 複数出現
- custom CSS配列を呼び出し後に変更しても文書設定へ影響しないこと
- BOM、ゼロ幅文字あり・なし

#### 受入条件

- エスケープ関数名から対象文脈を判断できる。
- 文字列置換をHTML、属性、CSSで不用意に共用していない。
- エラーcodeが基本設計と一致する。
- 不正値を暗黙の文字列化やboolean化で受理しない。

### I-03 既定CSS

#### 目的

`DESIGN.md` のデザイン言語を、読みやすく自己完結したMarkdown記事CSSへ変換する。

#### 主な対象

- `src/styles/default-css.ts`
- CSS確認用Markdown fixture
- CSSに関する単体テスト

#### 作業

- `DEFAULT_CSS` を唯一の定義元として作成する。
- 基本設計11章のトークン、対象要素、レスポンシブ、印刷仕様を実装する。
- CSSセレクタは記事要素を原則 `.md2html` 配下に限定する。
- `html`, `body`, print等、文書全体に必要な指定だけをグローバルにする。
- 外部フォント、外部画像、外部CSS、スクリプトへ依存させない。
- カスタムCSSで上書き可能な詳細度に保つ。

#### 必須テスト・確認

- `DEFAULT_CSS` が空でない。
- 外部 `@import` を含まない。
- 基本設計11.3の要素・クラスを網羅する。
- 600px以下のmedia queryとprint指定がある。
- GFM表、タスクリスト、長いコード、長いURL、画像を含むfixtureを用意する。
- デスクトップ幅とモバイル幅でfixtureを表示し、overflow、余白、可読性を確認する。

#### 受入条件

- DESIGN.mdの色、文字、spacing、radius原則との対応を説明できる。
- 記事に不要なmarketing component CSSを含めない。
- 水平スクロールは表またはコード領域内に閉じ、ページ全体を横に広げない。
- 視覚確認結果を実装報告へ記録する。

### I-04 HTML文書Builderとtemplate

#### 目的

変換済み本文と文書設定から、決定的な完全HTMLを生成する。

#### 主な対象

- `src/core/html-document.ts`
- `src/core/html-template.ts`
- 対応する単体・スナップショットテスト

#### 作業

- 可変 `HtmlDocument` と基本設計7.4の全メソッドを実装する。
- 変換済み本文、タイトル候補、明示タイトル、lang、CSS状態をprivateに保持する。
- 既定CSS、options CSS、メソッドCSSの順を保証する。
- 基本設計10.1の完全HTML構造を生成する。
- 空のCSS要素を出力しない。
- 末尾LFを1つだけ出力する。
- `toString`, `String`, template literalを一致させる。

#### 必須テスト

- 最小完全HTML
- title/langの設定前後
- `customCss()` が自身を返し、戻り値を受け取らなくても変更が残ること
- CSS複数追加時の順序
- `useDefaultCss(false)` と再有効化
- CSSなしの場合のstyle要素省略
- 複数回 `toString()` の一致と状態不変
- `String(document)`, `${document}`, `toString()` の一致
- DOCTYPE、meta順、article class、末尾LF

#### 受入条件

- 文字列化でMarkdownを再解析しない。
- templateへ未escapeのtitle/lang/custom CSSを渡さない、またはtemplate内で文脈別に必ず処理する。
- インスタンス内部状態を公開しない。

### I-05 Markdown Renderer

#### 目的

GFM Markdownを安全な本文HTMLへ変換し、タイトル候補を抽出する。

#### 主な対象

- `src/core/markdown-renderer.ts`
- `src/utils/url.ts`
- Markdown変換とURLの単体テスト

#### 作業

- 独立したMarkedインスタンスとRendererを作る。
- token列を一度生成し、同じ列からH1候補と本文を得る。
- 生HTMLのescape/allowを実装する。
- linkとimageへURLポリシーを適用する。
- tableを `.md2html-table-wrap` で囲む。
- task checkboxの非操作状態を維持する。
- H1候補はinline装飾を除いたプレーンテキストとして返す。

#### 必須テスト

- 見出し、段落、強調、リスト、引用、code、画像、リンク、区切り線
- GFMテーブル、取り消し線、タスクリスト
- `breaks` true/false、`gfm` true/false
- H1なし、複数H1、装飾付きH1、空相当H1、日本語H1
- 生HTML block/inlineのescapeとallow
- linkのhttp、https、mailto、tel、相対、fragment
- imageのhttp、https、相対
- `javascript`, `vbscript`, `data`, `file`
- 大文字、先頭空白、制御文字、文字参照、percent encodingによるURL偽装
- 不許可linkは文字を残し、不許可imageはaltを残す
- グローバルMarked設定へ副作用がないこと

#### 受入条件

- default modeの変換結果にscript、event handler、不許可URLを生成しない。
- URL判定を正規表現1つだけに依存させず、正規化手順をテストしている。
- Marked固有型が公開APIへ漏れない。

### I-06 変換ユースケースと公開API

#### 目的

各コンポーネントを統合し、要件のライブラリ利用方法を完成させる。

#### 主な対象

- `src/core/convert.ts`
- `src/index.ts`
- API統合テスト

#### 作業

- `convertMdToHtml(markdown, options)` を実装する。
- 入力正規化、option検証、render、タイトル決定、Builder生成を一方向に構成する。
- `HtmlDocument`, `DEFAULT_CSS`, errors、公開型を基本設計どおりexportする。
- パーサーの例外を安定した公開エラーへwrapする。
- 明示タイトル、H1、fallbackの優先順を実装する。

#### 必須テスト

- 要件定義に記載された非チェーン例
- チェーン例
- optionsによるtitle/lang/CSS/defaultCss/rawHtml/gfm/breaks
- title決定の全優先順位
- 日本語、絵文字、空Markdown
- parser例外のエラーcode/cause
- ESMエントリーからの全公開export
- 公開APIの型利用fixture

#### 受入条件

- 要件のサンプルコードがそのまま動く。
- optionsオブジェクトを変更しない。
- CLIなしでブラウザバンドラーがcoreを解決できる。
- Node.js builtinがライブラリbundleへ混入しない。

### I-07 CLI引数とパス解決

#### 目的

CLIの公開契約と、ファイル誤上書きを防ぐパス規則をI/Oから分離して実装する。

#### 主な対象

- `src/cli/args.ts`
- `src/cli/paths.ts`
- 対応する単体テスト

#### 作業

- `util.parseArgs` で基本設計8.2の全オプションを定義する。
- `--css` を `multiple: true` で指定順に保持する。
- helpとversionはI/O処理より先に完結させる。
- 入力数、stdin、output、stdoutの組み合わせを検証する。
- 自動出力名を入力ファイルの同じディレクトリへ決める。
- lexicalな正規化と、存在するパスのrealpath比較を組み合わせる。
- 出力先と入力MarkdownまたはCSSが同一なら常に拒否する。
- エラーを利用方法エラーと処理エラーへ分類する。

#### 必須テスト

- 全オプション、短縮名、help、version
- 未知オプション、値不足、入力なし、複数入力
- CSS複数指定と順序
- stdinでoutput/stdoutなし
- outputとstdoutの同時指定
- `.md`, `.markdown`, 拡張子なし、複数dotの自動出力名
- 相対/絶対パス、`.`/`..`、空白、Unicode
- 同じ入力/出力を異なる表記で指定
- symlink経由の入力/出力同一
- 出力とCSS入力が同一

#### 受入条件

- パス比較が文字列一致だけではない。
- 存在しない出力の比較でも入力上書きを防止できる。
- args/pathモジュールがファイル内容を読み書きしない。
- helpに `--allow-html` と `--force` の危険性を明記する。

### I-08 CLI入出力と安全な書込み

#### 目的

共通APIを使用してUTF-8入出力を行い、失敗時にも保護対象を破損しないCLIを完成させる。

#### 主な対象

- `src/cli/run.ts`
- `src/cli.ts`
- CLI統合テスト

#### 作業

- 入力MarkdownとCSSをUTF-8で読む。
- CLI fallback titleとして入力basenameを適用する。
- ファイル出力、stdout、stderrを明確に分ける。
- 既存出力は `--force` なしで拒否する。
- 同一ディレクトリの排他的な一時ファイルへ書いてから出力先へ置換する。
- 成功・失敗のすべての経路でfile handleを閉じる。
- 失敗時に自身が作成した一時ファイルだけを回収する。
- expected errorを終了コード1/2へmapする。
- 予期しないエラーを無言で終了させない。

#### 必須テスト

- ファイル入力→明示出力
- ファイル入力→自動出力
- CSS複数適用とタイトル/lang
- stdin→stdout、stdin→file
- 成功時のstdout/stderr
- input/CSS不存在、読込不可、親ディレクトリ不存在、書込不可
- 既存出力の拒否、`--force` 上書き
- 入力またはCSSと出力同一時に元ファイル内容が不変
- 書込み途中を模擬した失敗で既存出力が不変
- 失敗後に一時ファイルが残らない
- 終了コード0/1/2
- パスに空白、Unicodeを含むケース

#### 受入条件

- CLI内にMarkdown変換ロジックを複製していない。
- `--force` なしで既存ファイルを変更しない。
- 入力またはCSSは `--force` があっても変更しない。
- stdout HTMLに進捗や診断が混ざらない。
- 一時ファイル削除の対象を曖昧なglobで決めない。

### I-09 回帰・セキュリティ・視覚検証

#### 目的

コンポーネント単位では見落としやすい境界を、利用者視点で検証する。

#### 作業

- 基本設計16章のテスト一覧と既存テストを突合する。
- 完全HTMLスナップショットfixtureを整備する。
- セキュリティ回帰ケースを専用test suiteへ集約する。
- 同一入力を複数回変換し、決定性を確認する。
- 長文、長いcode/table/URL、日本語、絵文字を確認する。
- coverage結果を確認し、未検証の重要分岐へテストを追加する。
- 既定CSS付きHTMLをデスクトップ幅とモバイル幅で表示する。
- 印刷CSSを静的確認し、可能ならprint previewも確認する。

#### 必須コマンド

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:coverage
pnpm run build
git diff --check
```

#### 受入条件

- 変換コア、template、security utilityの行・分岐coverageが90%以上である。
- skipされたテストがない。
- default modeのfixtureに実行可能なHTML/URL注入がない。
- 視覚確認でページ全体の横overflow、文字切れ、読めない配色がない。
- 視覚確認の環境と結果を実装報告へ記録している。

### I-10 パッケージと利用者文書

#### 目的

ソースツリー上だけでなく、実際に配布するtarballから全入口が利用できることを保証する。

#### 主な対象

- `README.md`
- package metadata
- pack smoke test fixture
- package validation設定

#### 作業

- READMEへ概要、install、API、CLI、options、CSS順序、raw HTML警告、対応Node.jsを記載する。
- ライセンス等の未確定情報を推測で追加しない。
- `publint` と `attw` を実行する。
- pack内容に必要ファイルだけが含まれることを確認する。
- 新規の空プロジェクトへtarballを導入し、ESM/CJS/CLIを確認する。
- browser bundle smoke testでNode.js builtin混入を検出する。

#### 必須コマンド

```bash
pnpm run build
pnpm pack --dry-run
```

#### 受入条件

- packされた成果物からESM importが動作する。
- packされた成果物からCJS requireが動作する。
- packされた成果物のCLIが動作する。
- import/requireで同じ公開名と動作を利用できる。
- exports/typesにATTWまたはpublintのerrorがない。
- tarballへsource、test、coverage、一時HTML、秘密情報を含めない。

### I-11 最終品質ゲートと引継ぎ

#### 目的

Solが実装意図の推測に時間を使わず、リスクの高い差分からレビューできる状態にする。

#### 作業

- 完了条件を上から再確認する。
- working treeの全変更を確認し、意図しない変更を除く。
- 全品質コマンドをクリーンな状態から再実行する。
- `docs/IMPLEMENTATION_REPORT.md` の全項目を実値で更新する。
- 変更ファイル、公開API、CLI help、設計差異、既知課題、レビュー重点箇所を記録する。
- 実行しなかった検証を成功扱いにせず、理由と影響を記録する。
- commitやpushをしていない場合は、その状態を明記する。

#### 最終コマンド

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:coverage
pnpm run build
pnpm pack --dry-run
git diff --check
git status --short
```

#### 受入条件

- 上記コマンドが成功するか、実行不能項目が理由・影響とともに報告されている。
- reportのタスク状態と実際の成果物が一致する。
- reportに `{入力}`、`TBD`、未処理の案内コメントが残っていない。
- reviewerが再現に必要なコマンドと前提をreportだけから確認できる。
- ユーザーへ「完了」「未完了」「所有者判断待ち」を区別して報告できる。

## 7. 設計変更の判断基準

### 7.1 実装者判断で進めてよいもの

- private関数名
- 同一責務内のファイル分割
- test fixture名
- エラーメッセージの軽微な表現
- CSSの微細な値調整。ただしDESIGN.mdとの対応を維持し、報告する

### 7.2 記録を必須とするもの

- 基本設計と異なるdependencyまたはbuild option
- public exportの追加
- CLI内部の一時ファイル方式
- URL正規化方式
- CSS selectorまたはHTML構造の互換性に関わる変更
- OS差を吸収するfallback

### 7.3 ユーザー確認を必須とするもの

- public API名、引数、戻り値、既定値の変更
- CLI option名、既定出力、上書き規則、終了コードの変更
- raw HTMLを既定許可にする変更
- 対応Node.jsを下げる変更
- runtime dependencyの追加
- 1.0.0の対象機能を削除または大幅追加する変更
- ライセンス、npm publish、外部サービスへの送信

## 8. レビュー可能性のための実装上の注意

- セキュリティ境界を担当する関数は、汎用utilityへ混ぜず検索しやすい名前にする。
- 公開APIの組み立ては `src/index.ts` で一覧できるようにする。
- CLI option定義とhelp文を同じデータから生成し、記載ずれを避ける。
- exit codeのmapは1箇所へ集約する。
- atomic writeの処理は専用関数とし、正常系・失敗系を個別テスト可能にする。
- snapshot更新時は、差分を読まずに一括承認しない。
- reportの「レビュー重点箇所」にはファイルだけでなく関数名または行番号を書く。

