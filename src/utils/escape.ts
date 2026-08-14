/** Escapes untrusted text placed between HTML tags. */
export function escapeHtmlText(value: string): string {
  return value.replace(/[&<>]/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      default:
        return "&gt;";
    }
  });
}

/** Escapes an untrusted value placed in a quoted HTML attribute. */
export function escapeHtmlAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/** Prevents CSS from terminating the style raw-text element that contains it. */
export function escapeStyleRawText(value: string): string {
  return value.replace(/<\/style/gi, "<\\/style");
}
