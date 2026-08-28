/**
 * Internal theme-control fragments. Consumed by `buildHtmlDocument` and NOT
 * re-exported from the public entry point (`src/index.ts`).
 *
 * Both constants are fixed strings: no timestamp, randomness, nonce, or
 * user-supplied value, so the generated document stays deterministic.
 */

/** Fixed theme-toggle button markup, indented for `<body>` placement. */
export const THEME_TOGGLE_HTML = [
  '  <button id="md2html-theme-toggle" class="md2html-theme-toggle" type="button" hidden aria-label="ダークモード" aria-pressed="false">',
  '    <svg data-md2html-theme-icon="light" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">',
  '      <circle cx="12" cy="12" r="4"></circle>',
  '      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>',
  '    </svg>',
  '    <svg data-md2html-theme-icon="dark" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" hidden>',
  '      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
  '    </svg>',
  '  </button>'
].join("\n");

/** Fixed inline control script (IIFE). Never interpolates user input. */
export const THEME_CONTROL_SCRIPT = [
  "(() => {",
  "  const root = document.documentElement;",
  '  const button = document.getElementById("md2html-theme-toggle");',
  "  if (!root || !button) return;",
  '  const lightIcon = button.querySelector(\'[data-md2html-theme-icon="light"]\');',
  '  const darkIcon = button.querySelector(\'[data-md2html-theme-icon="dark"]\');',
  "  if (!lightIcon || !darkIcon) return;",
  "  let media = null;",
  '  if (typeof window.matchMedia === "function") {',
  '    media = window.matchMedia("(prefers-color-scheme: dark)");',
  "  }",
  '  const mode = () => {',
  "    const value = root.dataset.md2htmlTheme;",
  '    return value === "light" || value === "dark" ? value : "auto";',
  "  };",
  "  const systemDark = () => !!media && media.matches === true;",
  "  const effectiveDark = () => {",
  "    const current = mode();",
  '    if (current === "dark") return true;',
  '    if (current === "light") return false;',
  "    return systemDark();",
  "  };",
  "  const sync = () => {",
  "    const dark = effectiveDark();",
  '    button.setAttribute("aria-pressed", dark ? "true" : "false");',
  '    button.title = dark ? "ライトモードに切り替える" : "ダークモードに切り替える";',
  "    lightIcon.toggleAttribute(\"hidden\", dark);",
  "    darkIcon.toggleAttribute(\"hidden\", !dark);",
  "  };",
  '  button.addEventListener("click", () => {',
  '    root.dataset.md2htmlTheme = effectiveDark() ? "light" : "dark";',
  "    sync();",
  "  });",
  '  if (media && typeof media.addEventListener === "function") {',
  '    media.addEventListener("change", () => {',
  '      if (mode() === "auto") sync();',
  "    });",
  "  }",
  "  sync();",
  "  button.hidden = false;",
  "})();"
].join("\n");
