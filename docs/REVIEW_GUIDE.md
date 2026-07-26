# Sol向け実装レビューガイド

## 1. 目的

実装完了後のレビューで、要件適合性、公開互換性、安全性、ファイル保護、配布品質を優先して確認する。スタイルの好みより、利用者へ影響する不具合と将来修正が難しい公開契約を先に扱う。

レビューは原則として読み取りと診断に留める。ユーザーから修正も依頼された場合だけコードを変更する。

## 2. レビュー開始用プロンプト

Solへは、次の依頼文をそのまま渡せる。

```text
このリポジトリの実装レビューを行ってください。

最初にdocs/REQUIREMENTS.md、docs/BASIC_DESIGN.md、
docs/IMPLEMENTATION_TASKS.md、docs/IMPLEMENTATION_REPORT.mdを読み、
reportの主張を信用するだけでなく実際の差分・コード・テスト・package成果物と照合してください。

レビューでは公開API互換性、raw HTMLとURL/CSS注入、HTML template、
CLIの入力Markdown/CSS誤上書き、atomic write失敗時の保護、
ESM/CJSと型定義の解決を最優先してください。可能な範囲で検証コマンドを再実行してください。

結果は重大度順のfindingsを先に提示し、各findingにファイルと行、再現条件、
利用者への影響、修正方針を含めてください。問題がなければ明確にそう述べ、
残存リスクまたは未実行テストも記載してください。修正は別途依頼されるまで行わないでください。
```

## 3. レビュー入力

必須入力は次のとおり。

- `docs/REQUIREMENTS.md`
- `docs/BASIC_DESIGN.md`
- `docs/IMPLEMENTATION_TASKS.md`
- 記入済み `docs/IMPLEMENTATION_REPORT.md`
- 基準revisionからの全差分
- `package.json` とlockfile
- source、test、fixture
- packされた成果物または再生成可能な環境

`IMPLEMENTATION_REPORT.md` にプレースホルダー、未実行検証、設計差異の未記載がある場合は、それ自体を引継ぎ品質上の問題として扱う。

## 4. レビュー順序

### R-01 スコープと差分

- working tree、基準revision、変更ファイルがreportと一致するか。
- 要件外機能、不要なdependency、生成物、秘密情報が混入していないか。
- ユーザーの既存変更を消した形跡がないか。
- 設計差異がコードとreportで追跡可能か。

### R-02 公開API

- export名、signature、既定値、戻り値が基本設計と一致するか。
- 要件の非チェーン例とチェーン例が動くか。
- Builderが意図どおり可変で、自身を返すか。
- `toString`, `String`, template literalが一致するか。
- optionsまたは入力配列を変更していないか。
- `marked`、Node.js、内部型を公開していないか。
- エラーcodeとcauseが安定しているか。

### R-03 HTML変換と決定性

- Markdown token化を同一変換で重複していないか。
- title優先順位とプレーンテキスト化が正しいか。
- 完全HTMLのDOCTYPE、meta順、title、article、style、末尾LFが正しいか。
- 空styleを出さず、CSS順を保証しているか。
- 時刻、乱数、絶対パスを最終HTMLへ混ぜていないか。
- GFM、breaks、raw HTML modeが互いに干渉しないか。

### R-04 セキュリティ

- 生HTMLがdefault modeでblock/inlineともescapeされるか。
- allow modeの危険性がREADME/helpへ明記されるか。
- link/imageで許可スキームが分かれ、不許可URLが安全に縮退するか。
- URLの大文字、空白、制御文字、文字参照、percent encodingを使った偽装を防ぐか。
- titleがHTMLテキスト文脈でescapeされるか。
- langが属性注入できないか。
- CSS中の `</style>` が大文字小文字を問わず文書構造を破壊しないか。
- error/logへMarkdown本文やCSS全文を漏らさないか。

Markedは出力HTMLをサニタイズしないため、「markedを利用しているから安全」という前提を置かない。

### R-05 CLIとファイル保護

- unknown option、入力数、stdin/output/stdoutの組み合わせを正しく拒否するか。
- `--css` の順序が保持されるか。
- 自動出力名が正しいか。
- lexical pathとrealpathの双方を考慮しているか。
- 出力と入力MarkdownまたはCSSが同一なら `--force` ありでも拒否するか。
- 既存出力を `--force` なしで変更しないか。
- atomic write失敗時に既存出力を保持するか。
- 一時ファイルを排他的に作成し、file handleと一時ファイルを回収するか。
- 回収処理が他者ファイルを削除し得るglobや広いパスを使っていないか。
- stdoutへHTML以外を混ぜず、stderrと終了コード0/1/2を守るか。
- LinuxとWindowsのrename/path差を考慮しているか。

### R-06 packageと型解決

- exportsのimport/require条件とtype条件が実在する成果物を指すか。
- ESMとCJSで同じ公開名を利用できるか。
- dual package hazardを型定義構成で避けているか。
- CLI成果物にshebangがあるか。
- browser bundleへNode.js builtinが混入しないか。
- `marked` 以外のruntime dependencyがないか。
- pack内容が `files` と一致し、source/test/coverageを含まないか。
- publintとATTWがerrorなしで通るか。

### R-07 CSS・アクセシビリティ

- DESIGN.mdの色、font fallback、spacing、radius原則へ対応するか。
- 記事に不要なmarketing CSSを含めていないか。
- linkを下線と色で識別でき、focus-visibleがあるか。
- table/code/image/long URLでページ全体が横overflowしないか。
- mobile media queryとprint CSSが機能するか。
- 外部CDN、Webフォント、scriptへ依存しないか。
- desktop/mobile/printの視覚確認記録が信頼できるか。

### R-08 テスト品質

- 正常系だけでなく境界値と失敗系があるか。
- security testが危険文字列の不在を明示assertするか。
- CLI失敗系で保護対象の内容不変を確認するか。
- snapshotを盲目的に広く使用していないか。
- OS/timing依存のflaky testがないか。
- skip、only、TODO、説明のないlint/type抑制がないか。
- coverage 90%目標が重要モジュールで満たされるか。
- report記載のtest数、coverage、環境が実結果と一致するか。

## 5. 推奨検証コマンド

リポジトリの最終scriptを確認してから実行する。

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

加えて、可能なら一時fixtureから次を再現する。

- pack tarballのESM import
- pack tarballのCJS require
- pack tarballのCLI起動
- stdin/stdout変換
- 既存出力拒否とforce上書き
- 入力Markdown/CSS同一出力の拒否
- default modeのXSS回帰fixture
- desktop/mobileでの生成HTML表示

検証コマンドがネットワーク、権限、OS等で実行できない場合は、未実行理由と残存リスクをレビューへ記載する。

## 6. findingの重大度

| 重大度 | 基準 | 例 |
| --- | --- | --- |
| P0 | 利用者データ、実行環境、公開成果物へ即時かつ重大な被害 | 任意コード実行、広範囲なファイル破壊 |
| P1 | 1.0.0をblockする主要要件違反または高確率の安全性問題 | default mode XSS、入力上書き、API不動作 |
| P2 | 一般的な利用で誤動作、互換性低下、重要test不足 | CJS型解決失敗、force動作不良、Windows非互換 |
| P3 | 限定条件の問題、保守性低下、軽微な文書不一致 | error文言ずれ、局所的な重複、軽いCSS崩れ |

好みだけの指摘はfindingにしない。将来の具体的な不具合または変更コストへ結び付く場合に、条件と影響を示す。

## 7. finding記載形式

```text
[P1] 短い命令形または問題要約
場所: src/example.ts:42

再現条件:
利用者への影響:
根拠:
推奨修正:
関連設計・要件:
```

行範囲は問題を理解するための最小範囲にする。同じ根本原因による指摘を重複させない。

## 8. 最終レビュー出力

次の順で返す。

1. 重大度順findings
2. 確認質問または前提
3. 検証したコマンドと結果
4. 未実行検証と残存リスク
5. 短い総評

findingがない場合は「重大な指摘なし」と明記する。その場合も、未実行のOS/browser確認や所有者判断待ちを隠さない。

