import type { Token, TokenizerAndRendererExtension, Tokens } from "marked";

interface FootnoteDefinitionRecord {
  content: Token[];
  label: string;
  number: number | undefined;
  refs: number;
}

interface FootnoteDocumentState {
  definitions: Map<string, FootnoteDefinitionRecord>;
  referencedCount: number;
}

/** A footnote extension that keeps every label out of the HTML output. */
export interface FootnoteExtension {
  extensions: TokenizerAndRendererExtension<string, string>[];
  /** Appends the footnotes section token once all references are numbered. */
  finalizeTokens: (tokens: Token[]) => void;
}

const DEFINITION_PATTERN = /^\[\^([^\]\s]+)\]:[ \t]*(.*)\n?((?:[ \t]{4,}[^\n]*\n?)*)/u;
const REFERENCE_PATTERN = /^\[\^([^\]\s]+)\]/u;

/** @internal Creates self-contained GFM-style footnote extensions using numeric ids only. */
export function createFootnoteExtension(): FootnoteExtension {
  const state: FootnoteDocumentState = { definitions: new Map(), referencedCount: 0 };

  const definitionExtension: TokenizerAndRendererExtension<string, string> = {
    name: "footnoteDefinition",
    level: "block",
    tokenizer(this, src): Tokens.Generic | undefined {
      const match = DEFINITION_PATTERN.exec(src);
      if (match === null) {
        return undefined;
      }
      const label = match[1] ?? "";
      const continuation = (match[3] ?? "").replace(/^(?: {4}|\t)/gmu, "");
      const body = `${match[2] ?? ""}${continuation === "" ? "" : `\n${continuation}`}`.trim();
      let definition = state.definitions.get(label);
      if (definition === undefined) {
        definition = { content: [], label, number: undefined, refs: 0 };
        state.definitions.set(label, definition);
      }
      if (definition.content.length === 0) {
        definition.content = this.lexer.blockTokens(body);
      }
      return { type: "footnoteDefinition", raw: match[0] };
    },
    renderer: () => ""
  };

  const referenceExtension: TokenizerAndRendererExtension<string, string> = {
    name: "footnoteRef",
    level: "inline",
    tokenizer(this, src): Tokens.Generic | undefined {
      const match = REFERENCE_PATTERN.exec(src);
      if (match === null) {
        return undefined;
      }
      const definition = state.definitions.get(match[1] ?? "");
      if (definition === undefined) {
        return undefined;
      }
      if (definition.number === undefined) {
        state.referencedCount += 1;
        definition.number = state.referencedCount;
      }
      definition.refs += 1;
      return { type: "footnoteRef", raw: match[0], number: definition.number, occurrence: definition.refs };
    },
    renderer(token: Tokens.Generic): string {
      const number = token.number as number;
      const occurrence = token.occurrence as number;
      const refId = occurrence === 1 ? `fnref-${number}` : `fnref-${number}-${occurrence}`;
      return `<sup class="md2html-footnote-ref" id="${refId}">` +
        `<a href="#fn-${number}" aria-describedby="fn-${number}">[${number}]</a></sup>`;
    }
  };

  const sectionRenderer: TokenizerAndRendererExtension<string, string> = {
    name: "footnotes",
    renderer(this, token: Tokens.Generic): string {
      const items = token.items as FootnoteDefinitionRecord[];
      const listItems = items
        .map((item) => {
          const number = item.number ?? 0;
          const content = this.parser.parse(item.content).trimEnd();
          const backref =
            ` <a class="md2html-footnote-backref" href="#fnref-${number}" aria-label="脚注${number}の参照へ戻る">↩</a>`;
          const body = content.endsWith("</p>")
            ? `${content.slice(0, -"</p>".length)}${backref}</p>`
            : content.length === 0
              ? backref.trimStart()
              : `${content}${backref}`;
          return `<li id="fn-${number}">\n${body}\n</li>\n`;
        })
        .join("");
      return `<section class="md2html-footnotes" data-footnotes aria-label="脚注">\n<ol>\n${listItems}</ol>\n</section>\n`;
    }
  };

  return {
    extensions: [definitionExtension, referenceExtension, sectionRenderer],
    finalizeTokens(tokens: Token[]): void {
      const referenced = [...state.definitions.values()]
        .filter((definition): definition is FootnoteDefinitionRecord & { number: number } =>
          definition.number !== undefined)
        .sort((first, second) => first.number - second.number);
      if (referenced.length === 0) {
        return;
      }
      tokens.push({ type: "footnotes", raw: "", items: referenced });
    }
  };
}
