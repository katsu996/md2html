const URL_SCHEME = /^([A-Za-z][A-Za-z0-9+.-]*):/u;

const LINK_SCHEMES = new Set(["http", "https", "mailto", "tel"]);
const IMAGE_SCHEMES = new Set(["http", "https"]);

/** Returns whether a Markdown link target may be emitted as an href. */
export function isAllowedLinkUrl(url: string): boolean {
  return isAllowedUrl(url, LINK_SCHEMES);
}

/** Returns whether a Markdown image target may be emitted as a src. */
export function isAllowedImageUrl(url: string): boolean {
  return isAllowedUrl(url, IMAGE_SCHEMES);
}

function isAllowedUrl(url: string, allowedSchemes: ReadonlySet<string>): boolean {
  if (url.length === 0 || containsWhitespaceOrControl(url)) {
    return false;
  }

  const probe = normalizeUrlForSchemeCheck(url);
  const match = URL_SCHEME.exec(probe);
  if (match === null) {
    return true;
  }

  const scheme = match[1]?.toLowerCase();
  return scheme !== undefined && allowedSchemes.has(scheme);
}

function normalizeUrlForSchemeCheck(value: string): string {
  let decoded = value;
  for (let index = 0; index < 4; index += 1) {
    const entityDecoded = decodeHtmlEntities(decoded);
    const percentDecoded = decodePercentEncoded(entityDecoded);
    if (percentDecoded === decoded) {
      break;
    }
    decoded = percentDecoded;
  }
  return [...decodeHtmlEntities(decoded)].filter((character) => !isWhitespaceOrControl(character)).join("");
}

function decodePercentEncoded(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/giu, (_, hexadecimal: string) =>
      String.fromCodePoint(Number.parseInt(hexadecimal, 16))
    )
    .replace(/&#([0-9]+);?/gu, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/&(colon|tab|newline|newlin);?/giu, (_, name: string) => {
      switch (name.toLowerCase()) {
        case "colon":
          return ":";
        case "tab":
          return "\t";
        default:
          return "\n";
      }
    });
}

function containsWhitespaceOrControl(value: string): boolean {
  return [...value].some(isWhitespaceOrControl);
}

function isWhitespaceOrControl(character: string): boolean {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && (codePoint <= 0x20 || codePoint >= 0x7f && codePoint <= 0x9f || character.trim().length === 0);
}
