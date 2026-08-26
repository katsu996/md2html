# カラーテーマ切替機能 要件定義書

- 対象: `md2html`が既定CSS付きで生成する自己完結HTML
- ステータス: 確定（親設計 #9 に一致）
- 親設計: [生成HTMLのライト／ダークテーマ切替を設計する](https://github.com/katsu996/md2html/issues/9)

## 1. 目的

生成HTMLをどの端末設定で開いても読みやすくする。初期表示では端末のカラースキーム設定を自動反映し、閲覧中は利用者がライトテーマとダークテーマを画面右上のボタンで切り替えられるようにする。

## 2. 用語

| 用語 | 定義 |
| --- | --- |
| 選択モード | `auto`、`light`、`dark`のいずれか。`html`要素の`data-md2html-theme`属性が保持する。 |
| 有効テーマ | 実際に画面へ適用される`light`または`dark`。 |
| 端末設定 | ブラウザの`prefers-color-scheme`メディア特性から得られる値。 |

## 3. 対象範囲

### 対象

- 既定CSSを有効にして生成するすべてのHTML
- ライブラリAPIとCLIの両方から生成されるHTML
- デスクトップとモバイルの主要なモダンブラウザ
- 通常表示、キーボード操作、印刷

### 既定CSSを無効にした場合

`defaultCss: false`またはCLIの`--no-default-css`が指定された場合、テーマ用の属性、`<meta name="color-scheme">`、切替ボタン、制御用CSS、制御用スクリプトを一切出力しない。既定CSS自体を明示的に無効化した出力の表示責任は、カスタムCSSの利用者が持つ。

## 4. 状態モデル

選択モードは`auto`、`light`、`dark`の3値、有効テーマは`light`または`dark`の2値とする。

| 現在の選択モード | 条件または操作 | 次の選択モード | 有効テーマ |
| --- | --- | --- | --- |
| `auto` | 初回表示かつ端末がdark | `auto` | `dark` |
| `auto` | 初回表示かつ端末がdark以外 | `auto` | `light` |
| `auto` | 端末設定を変更 | `auto` | 変更後の端末設定へ即時追従 |
| `auto` | ボタンを押す | 現在と反対の`light`または`dark` | 現在と反対 |
| `light` | ボタンを押す | `dark` | `dark` |
| `dark` | ボタンを押す | `light` | `light` |
| `light`または`dark` | 端末設定を変更 | 変更しない | 変更しない |
| 任意 | ページを再読み込み | `auto` | 再読込時の端末設定に従う |

`matchMedia`またはカラースキーム判定を利用できない場合、`auto`の有効テーマは`light`とする。ただしJavaScriptが動けば、ボタンによる手動切替は利用できる。

## 5. 機能要件

| ID | 要件 |
| --- | --- |
| FR-01 | 既定CSS付きHTMLの画面右上に、テーマ切替ボタンを1つ表示する。 |
| FR-02 | ボタンはコンテンツより前面に表示しつつ、見出しや本文を覆わない配置にする。 |
| FR-03 | 初回表示時の選択モードを`auto`とし、dark端末ではダークテーマ、それ以外ではライトテーマを適用する。 |
| FR-04 | `auto`の間に端末設定が変更された場合、ページの再読み込みなしで有効テーマを追従させる。 |
| FR-05 | `auto`でボタンを1回押すと、現在の有効テーマと反対のテーマへ切り替え、選択モードを`light`または`dark`にする。 |
| FR-06 | 手動選択後はボタンを押すたびに`light`と`dark`を交互に切り替える。 |
| FR-07 | 手動選択中に端末設定が変更されても、選択中のテーマを維持する。 |
| FR-08 | 手動選択は現在のページを開いている間だけ有効とし、再読み込み時は`auto`に戻す。 |
| FR-09 | テーマ切替時にページの再読み込みやスクロール位置の変更を発生させない。 |
| FR-10 | テーマはHTML文書全体と既定CSSのすべての要素に一貫して適用する。 |
| FR-11 | Markdown中の画像本体へ反転、減光、フィルターを適用しない。画像の枠線など既定CSSの装飾のみテーマに合わせる。 |
| FR-12 | 印刷時は選択中のテーマに関わらず現行のライト系印刷スタイルを使用し、テーマ切替ボタンを印刷しない。 |
| FR-13 | 生成HTMLはテーマ機能のために外部CSS、外部JavaScript、Webフォント、外部アイコンを読み込まない。 |
| FR-14 | JavaScriptを実行できない環境でも、CSSの端末設定判定による初期テーマは適用する。操作できないボタンは表示しない。 |
| FR-15 | 端末設定を判定できない環境では`auto`の有効テーマを`light`とする。 |

## 6. 生成HTMLの契約

既定CSSが有効な場合だけ、次の構造を出力する。インデントとSVGの`path`値は実装時に固定し、時刻、乱数、nonceを含めない。

```html
<html lang="ja" data-md2html-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>...</title>
  <style id="md2html-default-css">...</style>
  <style id="md2html-custom-css">...</style>
</head>
<body>
  <button id="md2html-theme-toggle" class="md2html-theme-toggle" type="button" hidden aria-label="ダークモード" aria-pressed="false">
    <svg data-md2html-theme-icon="light" aria-hidden="true" focusable="false">...</svg>
    <svg data-md2html-theme-icon="dark" aria-hidden="true" focusable="false" hidden>...</svg>
  </button>
  <article class="md2html">
    ...
  </article>
  <script id="md2html-theme-script">...</script>
</body>
</html>
```

### 公開DOMフック

- `html[data-md2html-theme="auto|light|dark"]`: 現在の選択モード
- `#md2html-theme-toggle`および`.md2html-theme-toggle`: 切替ボタン
- `[data-md2html-theme-icon="light"]`と`[data-md2html-theme-icon="dark"]`: 現在の有効テーマを表すアイコン
- `#md2html-theme-script`: 固定のインライン制御スクリプト
- `--md2html-*`: 後述するテーマ色のCSSカスタムプロパティ

カスタムCSSは既定CSSより後に配置されるため、上記のフックとCSS変数を利用して表示を上書きできる。

## 7. UI・アクセシビリティ要件

| ID | 要件 |
| --- | --- |
| UI-01 | ボタンは画面右上に`position: fixed`で固定し、セーフエリアを加味した余白を取る。 |
| UI-02 | 狭い画面でも本文に重ならず、画面外へはみ出さない。 |
| UI-03 | 操作領域は44×44 CSS px以上、円形、`z-index`を持たせる。 |
| UI-04 | ネイティブの`button type="button"`を使用し、Tab、Enter、Spaceの標準操作を壊さない。 |
| UI-05 | 両テーマで3:1以上の`:focus-visible`を表示する。 |
| UI-06 | 固定のアクセシブルネームを「ダークモード」とし、`aria-pressed`でdarkの有効状態を表す。`title`で次の切替先を伝える。 |
| UI-07 | SVGは`aria-hidden="true"`、`focusable="false"`とし、外部画像やアイコンフォントを使用しない。 |
| UI-08 | JavaScriptが使えない場合はボタンを表示せず、操作不能なUIを残さない。 |
| UI-09 | テーマ変更のアニメーションは追加しない。初回ちらつきと不要な動きを避ける。 |

## 8. CSSカスケード順

1. `:root`へライト値を定義する。
2. `html[data-md2html-theme="dark"]`へダーク値を定義する。
3. `@media (prefers-color-scheme: dark)`内の`html[data-md2html-theme="auto"]`へ同じダーク値を定義する。
4. 既存の各セレクタは色の直接値ではなくCSS変数を参照する。
5. `@media print`の最後で、`html[data-md2html-theme]`へライト値を再定義する。このセレクタは手動dark規則と同等以上の詳細度を持たせる。

この順序により、初回描画から端末設定を反映し、手動lightがdark端末上で上書きされることを防ぐ。

## 9. 色トークン

| CSS変数 | ライト | ダーク | 用途 |
| --- | --- | --- | --- |
| `--md2html-canvas` | `#f6f5f4` | `#171717` | ページ背景 |
| `--md2html-surface` | `#ffffff` | `#202020` | 記事背景 |
| `--md2html-ink` | `#000000` | `#f5f5f5` | 見出し・強調 |
| `--md2html-text` | `#31302e` | `#dedbd7` | 本文 |
| `--md2html-muted` | `#615d59` | `#aaa6a1` | 補助文 |
| `--md2html-border` | `#e6e6e6` | `#3b3a38` | 枠線・区切り |
| `--md2html-accent` | `#0075de` | `#62aef0` | リンク・引用・チェック |
| `--md2html-focus` | `#62aef0` | `#62aef0` | フォーカスリング |
| `--md2html-code-surface` | `#f6f5f4` | `#292827` | code・pre・table見出し |
| `--md2html-control-surface` | `#ffffff` | `#292827` | 切替ボタン |
| `--md2html-control-hover` | `#eeecea` | `#343331` | 切替ボタンhover |
| `--md2html-control-text` | `#31302e` | `#f5f5f5` | 切替アイコン |
| `--md2html-article-shadow` | 現行の4層shadow | 黒を強めた4層shadow | 記事カード |
| `--md2html-control-shadow` | `0 2px 8px rgba(0, 0, 0, 0.12)` | `0 2px 8px rgba(0, 0, 0, 0.4)` | 切替ボタン |

ダーク配色の基準コントラストは、本文`#dedbd7`対`#202020`が11.81:1、補助文`#aaa6a1`対`#202020`が6.73:1、リンク`#62aef0`対`#202020`が6.85:1である。通常文字4.5:1以上、UI部品3:1以上を下回らないこと。

## 10. 非機能要件

| ID | 分類 | 要件 |
| --- | --- | --- |
| NFR-01 | 視認性 | 通常文字4.5:1以上、UI部品3:1以上のコントラストを維持する。 |
| NFR-02 | 初期表示 | 自動選択はCSSの`prefers-color-scheme`を基本とし、初回描画後に異なるテーマが一瞬表示される現象を起こさない。 |
| NFR-03 | 自己完結性 | テーマのCSS、制御スクリプト、アイコンは生成HTMLの内部に含め、ネットワークリクエストを追加しない。 |
| NFR-04 | 安全性 | 制御スクリプトは`eval`、`Function`コンストラクタ、HTML文字列の再挿入、外部通信、Cookie、Web Storageを使用しない。Markdown、title、lang、customCssをスクリプトへ補間しない。 |
| NFR-05 | 安定性 | 同じMarkdownとオプションからは、実行時刻や乱数に左右されず同一のHTML文字列を生成する。 |
| NFR-06 | 互換性 | `matchMedia`と`prefers-color-scheme`をサポートする主要なモダンブラウザで動作する。機能が不足する環境ではライト表示へ安全に縮退する。 |
| NFR-07 | カスタマイズ性 | 既定CSS → `options.customCss` → `document.customCss()`の現行の順序を維持する。 |

## 11. 受け入れ条件

- [ ] dark端末で開くと、最初の視認可能な描画からダークテーマである。
- [ ] light端末で開くと、最初の視認可能な描画からライトテーマである。
- [ ] `auto`中の端末設定変更へ再読み込みなしで追従する。
- [ ] 最初のクリックで現在と反対のテーマになり、以降はlightとdarkが交互に切り替わる。
- [ ] 手動選択後は端末設定を変更してもテーマが変わらない。
- [ ] 再読み込みすると保存値を読まず`auto`へ戻る。
- [ ] JavaScript無効時も本文は端末設定に従い、ボタンは表示されない。
- [ ] 320 CSS px幅でもボタンが画面内に収まり、本文を覆わない。
- [ ] Tab、Enter、Spaceで操作でき、フォーカスが両テーマで見える。
- [ ] 記事内の全既定要素がダーク配色へ切り替わり、画像本体の色は変わらない。
- [ ] 印刷プレビューは常にライト系で、ボタンを表示しない。
- [ ] `defaultCss: false`と`--no-default-css`の出力にテーマ用DOM、CSS、スクリプトが含まれない。
- [ ] カスタムCSSがテーマ変数とボタン表示を上書きできる。
- [ ] 同じ入力とオプションから同一のHTML文字列を生成する。
- [ ] 外部リクエストと新しい実行時依存を追加しない。

## 12. 検証方針

- 自動テスト: 生成HTMLの構造、属性、CSS順序、既定CSS無効時の省略、決定性
- DOMテスト: `matchMedia`の結果と変更通知、クリック、手動選択の維持、縮退
- 視覚確認: light/dark×desktop/mobile、初期表示のちらつき、コントラスト、フォーカス、本文との重なり
- 印刷確認: light/darkの両方から印刷プレビューを開いた際のライト化とボタン非表示
- 静的確認: 外部URL、乱数、時刻、Web Storage、Cookie、動的コード実行APIを制御コードが使っていないこと

## 13. 対象外

- 手動選択をページの再読み込み後も保持すること
- Cookie、`localStorage`、`sessionStorage`等への設定保存
- ボタン操作で`auto`へ戻す3状態UI
- APIまたはCLIから初期テーマを固定するオプション
- 利用者が画面上でテーマ色を編集する機能
- Markdownに含まれる画像や生HTML自体の色調整
- テーマ切替UIの複数言語向け文言カスタマイズ

## 14. 既存仕様への影響

- 既定CSSを含む生成HTMLの文字列とDOM構造は変更される。
- 現行の`HtmlDocument.toString()`の決定性と同一インスタンスの再利用性は維持する。
- 既存のCSS適用順序は維持する。
- READMEの「JavaScriptへ依存しません」は「外部JavaScriptへ依存しません」に更新し、生成HTML内に固定のテーマ制御スクリプトを含むことを明記する。
- 新規公開API、`ConvertOptions`、チェーンメソッド、CLIオプションは追加しない。
