import type { Token, TokenizerAndRendererExtension, Tokens } from "marked";

/** One parsed `Term` + `: definition` line pair. */
export interface DefinitionListEntry {
  term: Token[];
  definitions: Token[][];
}

const DEFINITION_LIST_PATTERN = /^([^\n]+)\n((?:[ \t]{0,3}:(?:[ \t][^\n]*)?(?:\n|$))+)/u;
const DEFINITION_MARKER_PATTERN = /^[ \t]{0,3}:(?:[ \t]|$)/u;
// A term line must not be another block construct; the extension runs before
// every built-in block tokenizer, so anything it accepts never reaches them.
const NON_TERM_PATTERN = /^(?:#{1,6}(?:\s|$)|>\s?|```|~~~|[ \t]{4}|\s{0,3}(?:[*+-]\s|\d+[.)]\s)|<|\[\^[^\]\n]+\]:|\s{0,3}:(?:\s|$)|[ \t]*$)/u;

/**
 * Block extension for definition lists (`Term` followed by `: definition` lines).
 *
 * Renders only static `<dl>`/`<dt>`/`<dd>` tags without attributes, so the
 * default raw-HTML escaping policy is unaffected. Term and definition bodies
 * are parsed as inline Markdown. A definition list never interrupts a
 * paragraph: the term line must start a fresh block (blank line or document
 * start before it), otherwise the lines stay a plain paragraph.
 */
export const definitionListExtension: TokenizerAndRendererExtension = {
  name: "definitionList",
  level: "block",
  tokenizer(this, src: string): Tokens.Generic | undefined {
    const match = DEFINITION_LIST_PATTERN.exec(src);
    if (match === null) {
      return undefined;
    }
    const termText = (match[1] ?? "").trim();
    if (termText === "" || NON_TERM_PATTERN.test(match[1] ?? "")) {
      return undefined;
    }
    const definitionTexts = (match[2] ?? "")
      .split("\n")
      .filter((line) => DEFINITION_MARKER_PATTERN.test(line))
      .map((line) => line.replace(/^[ \t]{0,3}:[ \t]?/u, "").trim());
    if (definitionTexts.length === 0) {
      return undefined;
    }
    const entry: DefinitionListEntry = {
      term: this.lexer.inlineTokens(termText),
      definitions: definitionTexts.map((definition) => this.lexer.inlineTokens(definition))
    };
    return { type: "definitionList", raw: match[0], entry };
  },
  renderer(this, token: Tokens.Generic): string | undefined {
    const entry = (token as Tokens.Generic & { entry?: DefinitionListEntry }).entry;
    if (entry === undefined) {
      return undefined;
    }
    const term = `<dt>${this.parser.parseInline(entry.term)}</dt>`;
    const definitions = entry.definitions
      .map((definition) => `<dd>${this.parser.parseInline(definition)}</dd>`)
      .join("\n");
    return `<dl>\n${term}\n${definitions}\n</dl>\n`;
  }
};
