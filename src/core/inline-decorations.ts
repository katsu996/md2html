import type { TokenizerAndRendererExtension, Tokens } from "marked";

interface DecorationRule {
  name: "mark" | "ins" | "sup" | "sub";
  tag: "mark" | "ins" | "sup" | "sub";
  pattern: RegExp;
}

const SINGLE_TILDE_PATTERN = /(?<!~)~(?!~)/u;

const RULES: DecorationRule[] = [
  { name: "mark", tag: "mark", pattern: /^==([^=\n]+?)==/u },
  { name: "ins", tag: "ins", pattern: /^\+\+([^+\n]+?)\+\+/u },
  { name: "sup", tag: "sup", pattern: /^\^([^^\n]+?)\^/u },
  // Single-tilde subscript must yield to GFM strikethrough (`~~`), which the
  // built-in `del` tokenizer handles after extensions decline.
  { name: "sub", tag: "sub", pattern: /^~([^~\n]+?)~/u }
];

/**
 * Finds the next position where `rule` may start inside already-skipped text.
 *
 * Inline extensions run before the built-in `inlineText` tokenizer, but plain
 * text does not stop at `=`/`+`/`^`/`~`. Without this hint the text tokenizer
 * would swallow later decorations in the same line, so every rule reports its
 * next candidate for `startInline` truncation.
 */
function findStart(rule: DecorationRule, src: string): number | undefined {
  if (rule.name === "sub") {
    const index = SINGLE_TILDE_PATTERN.exec(src)?.index;
    return index === undefined ? undefined : index;
  }
  const needle = rule.name === "mark" ? "==" : rule.name === "ins" ? "++" : "^";
  const index = src.indexOf(needle);
  return index < 0 ? undefined : index;
}

function createDecorationExtension(rule: DecorationRule): TokenizerAndRendererExtension {
  return {
    name: rule.name,
    level: "inline",
    start(src: string): number | undefined {
      return findStart(rule, src);
    },
    tokenizer(this, src: string): Tokens.Generic | undefined {
      if (rule.name === "sub" && src.startsWith("~~")) {
        return undefined;
      }
      const match = rule.pattern.exec(src);
      if (match === null || (match[1] ?? "").length === 0) {
        return undefined;
      }
      return { type: rule.name, raw: match[0], tokens: this.lexer.inlineTokens(match[1] ?? "") };
    },
    renderer(this, token: Tokens.Generic): string | undefined {
      const inner = (token as Tokens.Generic & { tokens?: Tokens.Generic[] }).tokens;
      if (inner === undefined) {
        return undefined;
      }
      return `<${rule.tag}>${this.parser.parseInline(inner)}</${rule.tag}>`;
    }
  };
}

/**
 * Inline extensions for highlight (`==mark==`), insertion (`++ins++`),
 * superscript (`^sup^`), and subscript (`~sub~`).
 *
 * Each renders a single static tag without attributes, so the default
 * raw-HTML escaping policy is unaffected. Contents are parsed as inline
 * Markdown. Later-registered extensions run first, therefore these yield to
 * nothing built-in except GFM strikethrough for the `~~` overlap.
 */
export const inlineDecorationExtensions: TokenizerAndRendererExtension[] =
  RULES.map(createDecorationExtension);
