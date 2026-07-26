import { describe, expect, it, vi } from "vitest";

const mockedRenderer = vi.hoisted(() => ({ renderMarkdown: vi.fn() }));

vi.mock("../../src/core/markdown-renderer.js", () => mockedRenderer);

import { convertMarkdown } from "../../src/core/convert.js";
import { Md2HtmlError } from "../../src/core/errors.js";

const { renderMarkdown } = mockedRenderer;

describe("conversion error boundary", () => {
  it("wraps unexpected Markdown renderer failures with a stable code and cause", () => {
    const cause = new Error("parser internals");
    renderMarkdown.mockImplementation(() => { throw cause; });
    try {
      convertMarkdown("# Title", undefined, "Fallback");
      throw new Error("Expected conversion to fail");
    } catch (error) {
      expect(error).toMatchObject({ code: "MARKDOWN_PARSE_FAILED", cause });
    } finally {
      renderMarkdown.mockReset();
    }
  });

  it("preserves stable library errors raised by a renderer", () => {
    const failure = new Md2HtmlError("HTML_BUILD_FAILED", "known failure");
    renderMarkdown.mockImplementationOnce(() => { throw failure; });
    expect(() => convertMarkdown("# Title", undefined, "Fallback")).toThrow(failure);
    renderMarkdown.mockReset();
  });
});
