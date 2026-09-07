# Graph Report - md2html  (2026-09-07)

## Corpus Check
- 55 files · ~28,965 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 452 nodes · 744 edges · 29 communities (23 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e7b7e3e8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- run.ts
- index-page.ts
- package.json
- convert-file.ts
- markdown-renderer.ts
- Implementation Review Guide
- API generateIndex(folderPath, options) -> GenerateIndexResult
- compilerOptions
- devDependencies
- config.ts
- Component Library
- coverage-summary.mjs
- Theme Toggle Button (#md2html-theme-toggle, fixed top-right)
- writeFileAtomically
- theme-control.test.ts
- project overview - Markdown to HTML library and CLI
- FR-10 Back Link (目次へ戻る on converted HTML)
- Coverage Job
- codecov coverage configuration
- Always Excluded Paths (.claude/, .github/, graphify-out/)
- CI Workflow
- graphify path Command
- convertMdToHtml(markdown, options)
- PR Review Skill (pr-100-files)
- graphify update Command
- これはH1です（このファイルのH1はHTMLのtitleにも使われます）

## God Nodes (most connected - your core abstractions)
1. `runCli()` - 19 edges
2. `これはH1です（このファイルのH1はHTMLのtitleにも使われます）` - 17 edges
3. `Md2HtmlError` - 15 edges
4. `Implementation Review Guide` - 15 edges
5. `HtmlDocument` - 14 edges
6. `compilerOptions` - 14 edges
7. `scripts` - 12 edges
8. `convertMarkdownFile()` - 12 edges
9. `generateIndex()` - 12 edges
10. `renderMarkdown()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `File Selection Algorithm (git ls-tree + priority filtering)` --semantically_similar_to--> `collectIndexEntries(folderPath) (readdir withFileTypes, .html filter)`  [INFERRED] [semantically similar]
  .agent/skills/pr-100-files/SKILL.md → docs/INDEX_DESIGN.md
- `Cherry-pick Fixes Workflow` --semantically_similar_to--> `Version Bump (npm version --no-git-tag-version)`  [INFERRED] [semantically similar]
  .agent/skills/pr-100-files/SKILL.md → .github/workflows/release.yml
- `Recommended Verification Commands` --references--> `Test Fixture Article`  [INFERRED]
  docs/REVIEW_GUIDE.md → test/fixtures/article.md
- `generateIndex(folderPath, options)` --references--> `API generateIndex(folderPath, options) -> GenerateIndexResult`  [INFERRED]
  README.md → docs/INDEX_DESIGN.md
- `Md2HtmlError + Error Codes (INVALID_ARGUMENT, FILE_READ_FAILED, etc.)` --conceptually_related_to--> `API generateIndex(folderPath, options) -> GenerateIndexResult`  [INFERRED]
  README.md → docs/INDEX_DESIGN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Index Generation Flow (collect → build → atomic write → API)** — docs_index_design_collectindexentries, docs_index_design_buildindexpagehtml, docs_index_design_atomic_write, docs_index_design_generateindex_api, docs_index_design_indexpageentry [EXTRACTED 1.00]
- **Project Core Requirements** — docs_requirements_overview, docs_requirements_library_usage, docs_requirements_cli_usage, docs_requirements_css_rules, docs_requirements_theme_switching, docs_requirements_tech_stack [EXTRACTED 1.00]
- **Review Guide Review Steps R-01 through R-08** — docs_review_guide_r01_scope_diff, docs_review_guide_r02_public_api, docs_review_guide_r03_html_conversion, docs_review_guide_r04_security, docs_review_guide_r05_cli_file_protection, docs_review_guide_r06_package_type_resolution, docs_review_guide_r07_css_accessibility, docs_review_guide_r07a_theme_switching, docs_review_guide_r08_test_quality [EXTRACTED 1.00]
- **Theme Switching System (mode, effective theme, toggle, cascade, tokens, DOM hooks)** — docs_theme_switching_requirements_selection_mode, docs_theme_switching_requirements_effective_theme, docs_theme_switching_requirements_toggle_button, docs_theme_switching_requirements_css_cascade, docs_theme_switching_requirements_color_tokens, docs_theme_switching_requirements_data_attr [EXTRACTED 1.00]
- **CI/CD Quality Gate (quality, coverage, codecov, release validations)** — _github_workflows_ci_quality_job, _github_workflows_ci_coverage_job, _github_workflows_ci_codecov_upload, _github_workflows_release_release_workflow, _github_workflows_release_npm_trusted_publishing [INFERRED 0.85]
- **Notion Design System Core** — design_md_notion_blue, design_md_canvas_soft, design_md_notioninter, design_md_sticker_palette [INFERRED 0.85]

## Communities (29 total, 6 thin omitted)

### Community 0 - "run.ts"
Cohesion: 0.08
Nodes (35): booleanOverride(), CliRunArguments, errorMessage(), helpText(), OPTION_CONFIG, optionalString(), optionalStringArray(), parseCliArguments() (+27 more)

### Community 1 - "index-page.ts"
Cohesion: 0.16
Nodes (17): buildHtmlDocument(), HtmlTemplateInput, buildIndexPageHtml(), collectIndexEntries(), formatLocalTimestamp(), indexBodyHtml(), pad(), readCreationTime() (+9 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (42): marked, author, bin, md2html, dependencies, marked, description, devEngines (+34 more)

### Community 3 - "convert-file.ts"
Cohesion: 0.07
Nodes (41): convertMarkdown(), convertMdToHtml(), Md2HtmlError, HtmlDocument, HtmlDocumentInitialState, convertMarkdownFile(), ValidatedFileOptions, validateFileOptions() (+33 more)

### Community 4 - "markdown-renderer.ts"
Cohesion: 0.15
Nodes (21): createFootnoteExtension(), FootnoteDefinitionRecord, FootnoteDocumentState, FootnoteExtension, MarkdownRenderResult, parseCodeInfo(), plainTextFromTokens(), renderMarkdown() (+13 more)

### Community 5 - "Implementation Review Guide"
Cohesion: 0.09
Nodes (23): Implementation Review Guide, Final Review Output Structure, Finding Format, R-01 Scope and Diff, R-02 Public API, R-03 HTML Conversion and Determinism, R-04 Security, R-05 CLI and File Protection (+15 more)

### Community 6 - "API generateIndex(folderPath, options) -> GenerateIndexResult"
Cohesion: 0.09
Nodes (22): Branch ai-code-review (review PR branch), Branch ai-code-review-fixes (main merge fixes branch), Cherry-pick Fixes Workflow, File Selection Algorithm (git ls-tree + priority filtering), Branch review-base (empty history base), GitHub Release (gh release create --verify-tag --generate-notes), npm Trusted Publishing (npm 11.5.1+), Version Bump (npm version --no-git-tag-version) (+14 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, ES2022, node, src/**/*.ts, test/**/*.ts, *.ts, compilerOptions, exactOptionalPropertyTypes (+13 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): @arethetypeswrong/core, eslint, @eslint/js, devDependencies, @arethetypeswrong/core, eslint, @eslint/js, publint (+13 more)

### Community 9 - "config.ts"
Cohesion: 0.24
Nodes (19): CONFIG_FILE_NAMES, CONFIG_KEYS, isNodeErrorWithCode(), isRecord(), LoadedCliConfig, loadedConfig(), loadExplicitConfig(), loadPackageConfig() (+11 more)

### Community 10 - "Component Library"
Cohesion: 0.13
Nodes (19): Primary Button (Pill CTA), Secondary Button, Warm Paper Canvas (#f6f5f4), Color System, Component Library, Display 1 (64px, 700, -2.125px tracking), Design Do's and Don'ts, Elevation System (+11 more)

### Community 11 - "coverage-summary.mjs"
Cohesion: 0.13
Nodes (11): formatMetric(), header, ignoredDirectories, markdown, metricNames, overallMetrics, reports, rootDirectory (+3 more)

### Community 12 - "Theme Toggle Button (#md2html-theme-toggle, fixed top-right)"
Cohesion: 0.15
Nodes (14): Color Tokens ( --md2html-* 14 variables light/dark), CSS Cascade Order (:root light → dark attribute → auto media → print), DOM Hook data-md2html-theme (html attribute), Effective Theme (light | dark actually rendered), Selection Mode (auto | light | dark via data-md2html-theme), Self-Contained Constraint (no external CSS/JS, no storage), Theme Toggle Button (#md2html-theme-toggle, fixed top-right), Accessibility Verification (Tab, 44px, aria-pressed, focus-visible) (+6 more)

### Community 13 - "writeFileAtomically"
Cohesion: 0.29
Nodes (5): AtomicWriteOperations, AtomicWriteRequest, fileExists(), isNodeErrorWithCode(), writeFileAtomically()

### Community 14 - "theme-control.test.ts"
Cohesion: 0.27
Nodes (5): createButton(), createSandbox(), FakeIcon, Sandbox, SandboxOptions

### Community 15 - "project overview - Markdown to HTML library and CLI"
Cohesion: 0.25
Nodes (8): CLI usage - command line arguments and config files, CSS application rules - default and custom, index page generation feature reference, library usage - JS/TS import with method chaining, next steps - project structure and improvements, project overview - Markdown to HTML library and CLI, technology stack - TypeScript, marked, cac, tsup, Builder pattern, color theme auto-selection and manual toggle

### Community 16 - "FR-10 Back Link (目次へ戻る on converted HTML)"
Cohesion: 0.50
Nodes (4): BackLink Nav (index.html back link, html-template.ts), FR-10 Back Link (目次へ戻る on converted HTML), CLI Config Resolution (package.json > .md2htmlrc > md2html.config.json), CLI md2html (input.md | - with --output, --css, --index, --force)

### Community 17 - "Coverage Job"
Cohesion: 0.67
Nodes (3): Codecov Upload (codecov-action@v5), Coverage Job, Quality Job (Node matrix 22,24)

### Community 18 - "codecov coverage configuration"
Cohesion: 0.67
Nodes (3): codecov comment layout, codecov coverage configuration, unit test flags

### Community 28 - "これはH1です（このファイルのH1はHTMLのtitleにも使われます）"
Cohesion: 0.07
Nodes (28): Markdown記法サンプル, md2htmlで対応していない記法（参考）, これはH1です（このファイルのH1はHTMLのtitleにも使われます）, これはH2です, これはH3です, これはH4です, これはH5です, これはH6です (+20 more)

## Knowledge Gaps
- **197 isolated node(s):** `name`, `version`, `description`, `type`, `url` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HtmlDocument` connect `convert-file.ts` to `index-page.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Md2HtmlError` connect `convert-file.ts` to `run.ts`, `index-page.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `run.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07686274509803921 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `convert-file.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07163561076604555 - nodes in this community are weakly interconnected._