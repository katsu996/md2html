# テーマ切替 実ブラウザ視覚検証記録

Issue: #14（親設計 #9）

## 1. 対象 commit・環境・コマンド

| 項目 | 値 |
| --- | --- |
| 対象 commit | `58a61f0a82b9564bdb72dba1b01332b745fbd80e`（作業ブランチ作業ツリー。#10/#11/#12/#13 の変更を含む） |
| パッケージ version | 1.0.0 |
| ブラウザ | Chromium `151.0.7922.137`（headless、Puppeteer/CDP 制御） |
| User-Agent | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36` |
| OS | Linux 6.18.33.2-microsoft-standard-WSL2 (x64) / Windows Terminal |
| 実施日 | 2026-08-26 |

生成コマンド:

```bash
pnpm run build
node dist/bin/md2html.js test/fixtures/article.md --output <tmp>/final.html
node dist/bin/md2html.js test/fixtures/article.md --output <tmp>/nodcss.html --no-default-css
```

検証方法: Puppeteer から `page.emulateMediaFeatures`（`prefers-color-scheme` の light/dark 切替）、`page.emulateMediaType('print')`、`page.setJavaScriptEnabled(false)`、`page.setViewport` を使用し、各状態で `getComputedStyle` と DOM 属性を読み取った。数値はすべて実測値。

## 2. 必須マトリクス 12 行の結果

| 番号 | 端末設定 | 選択モード | 画面または媒体 | 必須確認 | 結果 | 根拠（実測値） |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ライト | 自動 | 1280×800 | 初回からライト、右上ボタン、本文非重複 | 合格 | 読み込み直後: mode=`auto`, body bg=`rgb(246,245,244)`, article bg=`rgb(255,255,255)`。ボタン rect `x=1220, y=16, w=44, h=44`（右端 1220+44=1264 ≤ 1280）、body 上 padding `80px` で本文と非重複。`aria-pressed=false`, title=`ダークモードに切り替える`, ライトアイコンのみ表示 |
| 2 | ダーク | 自動 | 1280×800 | 初回からダーク、全既定要素、画像非加工 | 合格 | dark エミュレーション下で読み込み: body bg=`rgb(23,23,23)`, article bg=`rgb(32,32,32)`, h 色=`rgb(245,245,245)`, link=`rgb(98,174,240)`。img の computed `filter=none, opacity=1, mix-blend-mode=normal`（非加工）。ダークアイコンのみ表示 |
| 3 | ライト | 自動 | 320×568 | ボタンが画面内、44×44、本文非重複、横 overflow なし | 合格 | ボタン 44×44 画面内。body 上 padding=`72px`（600px 以下規則）。`scrollWidth=320 = clientWidth`、横スクロールなし |
| 4 | ダーク | 自動 | 320×568 | ダーク配色、ボタン、長文・表・code の可読性 | 合格 | body bg=`rgb(23,23,23)`。pre code: 文字 `rgb(245,245,245)` / 背景 `rgb(41,40,39)`、th 背景 `rgb(41,40,39)`（dark トークンどおり）。ボタン 44×44 画面内 |
| 5 | ライト→ダーク | 自動 | 1280×800 | 再読込なしで端末設定変更へ追従 | 合格 | light 読み込み後、エミュレーションを dark へ切替のみで: body bg→`rgb(23,23,23)`, `aria-pressed=true`, title=`ライトモードに切り替える`, dark アイコンのみ表示。mode は `auto` のまま |
| 6 | ダーク→ライト | 自動 | 1280×800 | 再読込なしで端末設定変更へ追従 | 合格 | 逆方向も同様に body bg→`rgb(246,245,244)`, `aria-pressed=false`, ライトアイコンへ復帰。mode=`auto` |
| 7 | 任意 | 手動 | 1280×800 | 最初の click で反対、連続 click で交互切替 | 合格 | auto(light) で click → mode=`dark`, bg=`rgb(23,23,23)`。次 click → mode=`light`。キーボード Enter → `dark`、Space → `light` も確認 |
| 8 | 任意 | 手動 | 1280×800 | 手動後の端末設定変更を無視 | 合格 | 手動 `dark` のままエミュレーションを light/dark 両方へ切替 → mode=`dark`, bg=`rgb(23,23,23)` 不変 |
| 9 | 任意 | 手動後に再読込 | 1280×800 | 保存値を読まず自動へ復帰 | 合格 | 再読込後: mode=`auto`（dark 端末なので有効テーマは dark、`aria-pressed=true` は自動判定結果として正しい） |
| 10 | ライト／ダーク | 自動 | JavaScript 無効 | 本文は端末設定へ追従、ボタンは非表示 | 合格 | `setJavaScriptEnabled(false)`: dark で body bg=`rgb(23,23,23)`、light への切替で `rgb(246,245,244)` へ CSS のみで追従。ボタン `display:none` のまま |
| 11 | ダーク | 自動または手動 | 印刷 | ライト系印刷、ボタン非表示、overflow 規則 | 合格 | 手動 `dark` 状態で print メディアをエミュレート: `--md2html-canvas=#f6f5f4` へ強制、`color-scheme=light`、body bg=`rgb(255,255,255)`、ボタン `display:none` |
| 12 | 任意 | 該当なし | no-default-css 版 | theme 属性、meta、button、script がない | 合格 | DOM 確認: `data-md2html-theme` なし / `meta[name=color-scheme]` なし / `#md2html-theme-toggle` なし / `#md2html-theme-script` なし / `.md2html-theme-toggle` なし。加えて生成 HTML への grep でも全 marker 0 件 |

## 3. アクセシビリティ確認

| 項目 | 結果 | 根拠 |
| --- | --- | --- |
| Tab でボタンへ到達 | 合格 | 1 回の Tab で `document.activeElement` = `<button id="md2html-theme-toggle">` |
| Enter で切替 | 合格 | 押下後 mode: light → `dark` |
| Space で切替 | 合格 | 押下後 mode: dark → `light` |
| hit area 44px 以上 | 合格 | computed rect `w=44, h=44`、`border-radius:50%`、`cursor:pointer`、`z-index:10` |
| `aria-pressed` 初期値 | 合格 | 自動ライト `false`／自動ダーク `true` |
| title 表示 | 合格 | light 時「ダークモードに切り替える」／dark 時「ライトモードに切り替える」 |
| アイコン表示制御 | 合格 | 常に現在テーマ側のみ表示（属性 `hidden` + `display:none` の二重保証を確認） |
| focus-visible | 合格 | dark で outline `3px solid rgb(98,174,240)` を computed で確認（light も同トークン `--md2html-focus` を unit test で担保） |
| コントラスト | 合格 | dark: 本文 vs 表面 **11.81:1**、リンク vs 表面 **6.85:1**（親設計 #9 の基準値と一致。通常文字 4.5:1、UI 3:1 を上回る） |
| コンソールエラー | 合格 | 検証セッション全体で error 0 件 |

## 4. 初期表示・レイアウト確認

| 項目 | 結果 | 根拠 |
| --- | --- | --- |
| 初回からのテーマ適用（ちらつき防止の構造） | 合格（構造確認による） | Row 10 のとおり JavaScript 無効でも dark 端末の初回計算スタイルがダークであること＝初回描画は CSS の `@media (prefers-color-scheme: dark)` + `html[data-md2html-theme="auto"]` のみで決まる。制御スクリプトは色プロパティを一切操作しない（unit test `document.test.ts` が script 内の style 操作 API 不在を担保）。よってスクリプト起動前後で配色が変わらず、ライトの一瞬表示は発生しない構造である |
| 描画フレーム記録による直接観測 | 未実行 | headless Chromium では `requestAnimationFrame` ベースの初期フレーム記録が取得できず、目視も不可のため。上記の構造的根拠により代替確認 |
| 切替時のレイアウトシフト | 合格 | toggle 前後で article top=`80px`、button top=`16px` と不変（色変数のみ変化） |
| 320px 幅での横スクロール増加 | 合格 | Row 3 のとおり `scrollWidth == clientWidth == 320` |
| safe area の模擬 | 未実行 | headless 環境では `env(safe-area-inset-*)` を模擬できないため。CSS には `calc(16px + env(safe-area-inset-top/right, 0px))`、mobile で `calc(12px + ...)` が実装済みであることを unit test（`default-css.test.ts`）で担保 |
| 画像の computed style | 合格 | `filter:none` / `opacity:1` / `mix-blend-mode:normal` |

## 5. 検証中に発見し修正した不具合

本検証の過程で、実ブラウザでのみ顕在化する不具合を 2 件発見し、担当 Issue のファイル範囲内で修正した。

1. **ダークアイコンが非表示にならない（light 時に両アイコンが見える）** — 作者 CSS の `.md2html-theme-toggle svg { display:block }` が UA の `[hidden]` 規則より優先され、初期 HTML の `hidden` 属性が無効化されていた。
   - 修正（#10 担当ファイル）: `src/styles/default-css.ts` へ `.md2html-theme-toggle svg[hidden] { display:none; }` を追加。
   - 再現条件: light 端末で既定 CSS 付き HTML を開く。期待: dark アイコン非表示。実際（修正前）: 両方表示。
2. **手動切替後にアイコンが同期しない** — Chromium の `SVGElement` には `hidden` IDL プロパティが存在せず、スクリプトの `icon.hidden = …` が実要素に反映されず expando になっていた（aria/title は同期するのにアイコンだけ残る状態）。
   - 修正（#11 担当ファイル）: `src/core/theme-control.ts` の sync を `toggleAttribute("hidden", …)` へ変更。あわせて #13 の偽 DOM ヘルパーを属性ベース契約へ更新。
   - 再現条件: light で開いた後、端末設定を dark へ変更、または click。期待: アイコンも aria も同期。実際（修正前）: aria は同期するがアイコン表示が更新されない。

両修正とも unit test（123 tests）で回帰担保した。

## 6. 未実行項目と理由

- 初期描画のフレーム単位記録（headless で rAF 記録不可・目視不可）→ 構造的根拠で代替確認済み（§4）。
- safe area つき端末でのボタン位置（headless で `env()` 模擬不可）→ CSS 実装と unit test で担保。

## 7. 総合判定

**合格。** 必須マトリクス 12 行すべて合格、アクセシビリティ確認すべて合格、コンソールエラー 0件。未実行は上記 2 項目のみで、いずれも環境制約によるもので代替根拠を記録した。検証で発見した 2 件の不具合は担当ファイル内で修正済み。
