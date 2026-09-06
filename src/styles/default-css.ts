/**
 * Built-in article styles derived from DESIGN.md. The stylesheet is intentionally
 * self-contained: it does not load fonts, images, scripts, or remote CSS.
 *
 * Colours are defined as CSS custom properties so the light and dark themes share
 * one selector tree. Light values live on `:root`; dark values live on both
 * `html[data-md2html-theme="dark"]` (manual) and
 * `@media (prefers-color-scheme: dark) html[data-md2html-theme="auto"]` (auto).
 */
export const DEFAULT_CSS = `
:root {
  color-scheme: light;
  --md2html-canvas: #f6f5f4;
  --md2html-surface: #ffffff;
  --md2html-ink: #000000;
  --md2html-text: #31302e;
  --md2html-muted: #615d59;
  --md2html-border: #e6e6e6;
  --md2html-accent: #0075de;
  --md2html-focus: #62aef0;
  --md2html-code-surface: #f6f5f4;
  --md2html-control-surface: #ffffff;
  --md2html-control-hover: #eeecea;
  --md2html-control-text: #31302e;
  --md2html-article-shadow: 0 0.175px 1.041px rgba(0, 0, 0, 0.01), 0 0.8px 2.925px rgba(0, 0, 0, 0.02), 0 2.025px 7.847px rgba(0, 0, 0, 0.027), 0 4px 18px rgba(0, 0, 0, 0.04);
  --md2html-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

html[data-md2html-theme="dark"] {
  color-scheme: dark;
  --md2html-canvas: #171717;
  --md2html-surface: #202020;
  --md2html-ink: #f5f5f5;
  --md2html-text: #dedbd7;
  --md2html-muted: #aaa6a1;
  --md2html-border: #3b3a38;
  --md2html-accent: #62aef0;
  --md2html-focus: #62aef0;
  --md2html-code-surface: #292827;
  --md2html-control-surface: #292827;
  --md2html-control-hover: #343331;
  --md2html-control-text: #f5f5f5;
  --md2html-article-shadow: 0 0.175px 1.041px rgba(0, 0, 0, 0.08), 0 0.8px 2.925px rgba(0, 0, 0, 0.12), 0 2.025px 7.847px rgba(0, 0, 0, 0.16), 0 4px 18px rgba(0, 0, 0, 0.24);
  --md2html-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
  html[data-md2html-theme="auto"] {
    color-scheme: dark;
    --md2html-canvas: #171717;
    --md2html-surface: #202020;
    --md2html-ink: #f5f5f5;
    --md2html-text: #dedbd7;
    --md2html-muted: #aaa6a1;
    --md2html-border: #3b3a38;
    --md2html-accent: #62aef0;
    --md2html-focus: #62aef0;
    --md2html-code-surface: #292827;
    --md2html-control-surface: #292827;
    --md2html-control-hover: #343331;
    --md2html-control-text: #f5f5f5;
    --md2html-article-shadow: 0 0.175px 1.041px rgba(0, 0, 0, 0.08), 0 0.8px 2.925px rgba(0, 0, 0, 0.12), 0 2.025px 7.847px rgba(0, 0, 0, 0.16), 0 4px 18px rgba(0, 0, 0, 0.24);
    --md2html-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
}

html {
  background: var(--md2html-canvas);
  color: var(--md2html-ink);
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-feature-settings: "lnum", "locl";
  line-height: 1.5;
  overflow-wrap: anywhere;
}

body {
  box-sizing: border-box;
  margin: 0;
  padding: calc(80px + env(safe-area-inset-top, 0px)) 24px 32px;
  background: var(--md2html-canvas);
  color: var(--md2html-text);
  font-size: 16px;
}

.md2html,
.md2html * {
  box-sizing: border-box;
}

.md2html {
  width: min(100%, 800px);
  margin: 0 auto;
  padding: 32px;
  overflow-wrap: anywhere;
  background: var(--md2html-surface);
  border: 1px solid var(--md2html-border);
  border-radius: 12px;
  box-shadow: var(--md2html-article-shadow);
}

.md2html > :first-child {
  margin-top: 0;
}

.md2html > :last-child {
  margin-bottom: 0;
}

.md2html h1,
.md2html h2,
.md2html h3,
.md2html h4,
.md2html h5,
.md2html h6 {
  margin: 32px 0 16px;
  color: var(--md2html-ink);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.md2html h1 {
  font-size: clamp(2rem, 5vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.md2html h2 {
  font-size: clamp(1.5rem, 4vw, 1.625rem);
  line-height: 1.23;
  letter-spacing: -0.024em;
}

.md2html h3 {
  font-size: clamp(1.25rem, 3vw, 1.375rem);
  line-height: 1.27;
  letter-spacing: -0.012em;
}

.md2html h4,
.md2html h5,
.md2html h6 {
  font-size: 1rem;
  line-height: 1.4;
}

.md2html p,
.md2html ul,
.md2html ol,
.md2html blockquote,
.md2html pre,
.md2html figure,
.md2html hr,
.md2html .md2html-table-wrap {
  margin: 16px 0;
}

.md2html strong {
  color: var(--md2html-ink);
  font-weight: 700;
}

.md2html em {
  font-style: italic;
}

.md2html del {
  color: var(--md2html-muted);
}

.md2html small,
.md2html figcaption {
  color: var(--md2html-muted);
  font-size: 0.875rem;
}

.md2html a {
  color: var(--md2html-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;
}

.md2html a:focus-visible {
  outline: 3px solid var(--md2html-focus);
  outline-offset: 2px;
  border-radius: 4px;
}

.md2html ul,
.md2html ol {
  padding-left: 1.5rem;
}

.md2html li + li {
  margin-top: 8px;
}

.md2html input[type="checkbox"] {
  margin: 0 0.45em 0 0;
  accent-color: var(--md2html-accent);
  vertical-align: middle;
}

.md2html blockquote {
  margin-left: 0;
  padding: 4px 0 4px 16px;
  color: var(--md2html-muted);
  border-left: 4px solid var(--md2html-accent);
}

.md2html code {
  padding: 0.1em 0.35em;
  color: var(--md2html-ink);
  background: var(--md2html-code-surface);
  border: 1px solid var(--md2html-border);
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.md2html pre {
  max-width: 100%;
  padding: 16px;
  overflow-x: auto;
  color: var(--md2html-ink);
  background: var(--md2html-code-surface);
  border: 1px solid var(--md2html-border);
  border-radius: 12px;
}

.md2html pre > code {
  display: block;
  min-width: max-content;
  padding: 0;
  overflow-wrap: normal;
  background: transparent;
  border: 0;
  border-radius: 0;
}

.md2html .md2html-code-block {
  overflow-x: auto;
  background: var(--md2html-code-surface);
  border: 1px solid var(--md2html-border);
  border-radius: 12px;
}

.md2html .md2html-code-block figcaption {
  margin-top: 0;
  padding: 8px 16px;
  color: var(--md2html-text);
  font-weight: 600;
  border-bottom: 1px solid var(--md2html-border);
  overflow-wrap: break-word;
}

.md2html .md2html-code-block pre {
  margin: 0;
  border: 0;
  border-radius: 0;
}

.md2html .md2html-table-wrap {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--md2html-border);
  border-radius: 12px;
}

.md2html table {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
}

.md2html th,
.md2html td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--md2html-border);
}

.md2html thead th,
.md2html th {
  color: var(--md2html-ink);
  background: var(--md2html-code-surface);
  font-size: 0.875rem;
  font-weight: 600;
}

.md2html tbody tr:last-child td {
  border-bottom: 0;
}

.md2html img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  border: 1px solid var(--md2html-border);
  border-radius: 12px;
}

.md2html figure {
  margin-right: 0;
  margin-left: 0;
}

.md2html figcaption {
  margin-top: 8px;
}

.md2html hr {
  height: 1px;
  border: 0;
  background: var(--md2html-border);
}

.md2html-theme-toggle {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top, 0px));
  right: calc(16px + env(safe-area-inset-right, 0px));
  z-index: 10;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--md2html-border);
  border-radius: 50%;
  background: var(--md2html-control-surface);
  color: var(--md2html-control-text);
  box-shadow: var(--md2html-control-shadow);
  cursor: pointer;
}

.md2html-theme-toggle:hover,
.md2html-theme-toggle:active {
  background: var(--md2html-control-hover);
}

.md2html-theme-toggle:focus-visible {
  outline: 3px solid var(--md2html-focus);
  outline-offset: 2px;
}

.md2html-theme-toggle svg {
  display: block;
  width: 20px;
  height: 20px;
}

.md2html-theme-toggle[hidden] {
  display: none;
}

@media (max-width: 600px) {
  body {
    padding: calc(72px + env(safe-area-inset-top, 0px)) 16px 16px;
  }

  .md2html {
    padding: 24px 16px;
    border-radius: 8px;
  }

  .md2html h1 {
    font-size: 2rem;
  }

  .md2html h2 {
    font-size: 1.5rem;
  }

  .md2html h3 {
    font-size: 1.25rem;
  }

  .md2html th,
  .md2html td {
    padding: 8px 12px;
  }

  .md2html-theme-toggle {
    top: calc(12px + env(safe-area-inset-top, 0px));
    right: calc(12px + env(safe-area-inset-right, 0px));
  }
}

.md2html-index-back {
  margin: 0 0 16px;
}

.md2html-index {
  margin: 16px 0;
  padding-left: 28px;
}

.md2html-index time {
  display: block;
  color: var(--md2html-muted, #615d59);
  font-size: 0.875em;
}

.md2html-index-empty {
  color: var(--md2html-muted, #615d59);
}

@media print {
  html[data-md2html-theme] {
    color-scheme: light;
    --md2html-canvas: #f6f5f4;
    --md2html-surface: #ffffff;
    --md2html-ink: #000000;
    --md2html-text: #31302e;
    --md2html-muted: #615d59;
    --md2html-border: #e6e6e6;
    --md2html-accent: #0075de;
    --md2html-focus: #62aef0;
    --md2html-code-surface: #f6f5f4;
    --md2html-control-surface: #ffffff;
    --md2html-control-hover: #eeecea;
    --md2html-control-text: #31302e;
    --md2html-article-shadow: 0 0.175px 1.041px rgba(0, 0, 0, 0.01), 0 0.8px 2.925px rgba(0, 0, 0, 0.02), 0 2.025px 7.847px rgba(0, 0, 0, 0.027), 0 4px 18px rgba(0, 0, 0, 0.04);
    --md2html-control-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  html,
  body {
    background: #ffffff;
  }

  body {
    padding: 0;
  }

  .md2html {
    width: auto;
    max-width: none;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .md2html a {
    color: #000000;
  }

  .md2html pre,
  .md2html .md2html-table-wrap {
    overflow: visible;
  }

  .md2html-theme-toggle {
    display: none;
  }
}

.md2html-theme-toggle svg[hidden] {
  display: none;
}
`.trim();
