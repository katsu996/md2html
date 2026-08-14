/**
 * Built-in article styles derived from DESIGN.md. The stylesheet is intentionally
 * self-contained: it does not load fonts, images, scripts, or remote CSS.
 */
export const DEFAULT_CSS = `
html {
  background: #f6f5f4;
  color: #000000;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-feature-settings: "lnum", "locl";
  line-height: 1.5;
  overflow-wrap: anywhere;
}

body {
  box-sizing: border-box;
  margin: 0;
  padding: 32px 24px;
  background: #f6f5f4;
  color: #31302e;
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
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  box-shadow: 0 0.175px 1.041px rgba(0, 0, 0, 0.01), 0 0.8px 2.925px rgba(0, 0, 0, 0.02), 0 2.025px 7.847px rgba(0, 0, 0, 0.027), 0 4px 18px rgba(0, 0, 0, 0.04);
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
  color: #000000;
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
  color: #000000;
  font-weight: 700;
}

.md2html em {
  font-style: italic;
}

.md2html del {
  color: #615d59;
}

.md2html small,
.md2html figcaption {
  color: #615d59;
  font-size: 0.875rem;
}

.md2html a {
  color: #0075de;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;
}

.md2html a:focus-visible {
  outline: 3px solid #62aef0;
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
  accent-color: #0075de;
  vertical-align: middle;
}

.md2html blockquote {
  margin-left: 0;
  padding: 4px 0 4px 16px;
  color: #615d59;
  border-left: 4px solid #0075de;
}

.md2html code {
  padding: 0.1em 0.35em;
  color: #000000;
  background: #f6f5f4;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.md2html pre {
  max-width: 100%;
  padding: 16px;
  overflow-x: auto;
  color: #000000;
  background: #f6f5f4;
  border: 1px solid #e6e6e6;
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

.md2html .md2html-table-wrap {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid #e6e6e6;
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
  border-bottom: 1px solid #e6e6e6;
}

.md2html thead th,
.md2html th {
  color: #000000;
  background: #f6f5f4;
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
  border: 1px solid #e6e6e6;
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
  background: #e6e6e6;
}

@media (max-width: 600px) {
  body {
    padding: 16px;
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
}

@media print {
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
}
`.trim();
