# Graph Report - md2html  (2026-09-02)

## Corpus Check
- 21 files · ~23,891 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 413 nodes · 684 edges · 28 communities (22 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.8)
- Token cost: 18,240 input · 8,720 output

## Community Hubs (Navigation)
- CLI Argument Parsing
- Core Conversion
- Package Metadata
- HTML Document Model
- HTML Template & Rendering
- Review Guide Documentation
- PR Review Workflow
- TypeScript Configuration
- Dev Dependencies
- CLI Config Loading
- Design System Components
- Coverage Scripts
- Theme Switching System
- Atomic Write Utilities
- Theme Control Tests
- Project Documentation
- Index Navigation
- CI Quality Jobs
- Codecov Setup
- Exclusion Rules
- CI/CD Workflows
- Graphify Commands
- Public API
- PR Review Skill
- Graph Update

## God Nodes (most connected - your core abstractions)
1. `Md2HtmlError` - 15 edges
2. `Implementation Review Guide` - 15 edges
3. `HtmlDocument` - 14 edges
4. `compilerOptions` - 14 edges
5. `runCli()` - 14 edges
6. `normalizeConvertOptions()` - 11 edges
7. `generateIndex()` - 11 edges
8. `scripts` - 10 edges
9. `writeFileAtomically()` - 10 edges
10. `convertMarkdown()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `File Selection Algorithm (git ls-tree + priority filtering)` --semantically_similar_to--> `collectIndexEntries(folderPath) (readdir withFileTypes, .html filter)`  [INFERRED] [semantically similar]
  .agent/skills/pr-100-files/SKILL.md → docs/INDEX_DESIGN.md
- `Cherry-pick Fixes Workflow` --semantically_similar_to--> `Version Bump (npm version --no-git-tag-version)`  [INFERRED] [semantically similar]
  .agent/skills/pr-100-files/SKILL.md → .github/workflows/release.yml
- `Recommended Verification Commands` --references--> `Test Fixture Article`  [INFERRED]
  docs/REVIEW_GUIDE.md → test/fixtures/article.md
- `Md2HtmlError + Error Codes (INVALID_ARGUMENT, FILE_READ_FAILED, etc.)` --conceptually_related_to--> `API generateIndex(folderPath, options) -> GenerateIndexResult`  [INFERRED]
  README.md → docs/INDEX_DESIGN.md
- `generateIndex(folderPath, options)` --references--> `API generateIndex(folderPath, options) -> GenerateIndexResult`  [INFERRED]
  README.md → docs/INDEX_DESIGN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Index Generation Flow (collect → build → atomic write → API)** — docs_index_design_collectindexentries, docs_index_design_buildindexpagehtml, docs_index_design_atomic_write, docs_index_design_generateindex_api, docs_index_design_indexpageentry [EXTRACTED 1.00]
- **Theme Switching System (mode, effective theme, toggle, cascade, tokens, DOM hooks)** — docs_theme_switching_requirements_selection_mode, docs_theme_switching_requirements_effective_theme, docs_theme_switching_requirements_toggle_button, docs_theme_switching_requirements_css_cascade, docs_theme_switching_requirements_color_tokens, docs_theme_switching_requirements_data_attr [EXTRACTED 1.00]
- **CI/CD Quality Gate (quality, coverage, codecov, release validations)** — _github_workflows_ci_quality_job, _github_workflows_ci_coverage_job, _github_workflows_ci_codecov_upload, _github_workflows_release_release_workflow, _github_workflows_release_npm_trusted_publishing [INFERRED 0.85]
- **Project Core Requirements** — docs_requirements_overview, docs_requirements_library_usage, docs_requirements_cli_usage, docs_requirements_css_rules, docs_requirements_theme_switching, docs_requirements_tech_stack [EXTRACTED 1.00]
- **Review Guide Review Steps R-01 through R-08** — docs_review_guide_r01_scope_diff, docs_review_guide_r02_public_api, docs_review_guide_r03_html_conversion, docs_review_guide_r04_security, docs_review_guide_r05_cli_file_protection, docs_review_guide_r06_package_type_resolution, docs_review_guide_r07_css_accessibility, docs_review_guide_r07a_theme_switching, docs_review_guide_r08_test_quality [EXTRACTED 1.00]
- **Notion Design System Core** — design_md_notion_blue, design_md_canvas_soft, design_md_notioninter, design_md_sticker_palette [INFERRED 0.85]

## Communities (28 total, 6 thin omitted)

### Community 0 - "CLI Argument Parsing"
Cohesion: 0.07
Nodes (36): booleanOverride(), CliRunArguments, errorMessage(), helpText(), OPTION_CONFIG, optionalString(), optionalStringArray(), parseCliArguments() (+28 more)

### Community 1 - "Core Conversion"
Cohesion: 0.10
Nodes (32): convertMarkdown(), convertMdToHtml(), convertMarkdownFile(), ValidatedFileOptions, validateFileOptions(), Md2HtmlError, buildIndexPageHtml(), collectIndexEntries() (+24 more)

### Community 2 - "Package Metadata"
Cohesion: 0.05
Nodes (40): marked, author, bin, md2html, dependencies, marked, description, devEngines (+32 more)

### Community 3 - "HTML Document Model"
Cohesion: 0.10
Nodes (19): HtmlDocument, HtmlDocumentInitialState, defaultOptions(), LEADING_MARKDOWN_NOISE, normalizeConvertOptions(), normalizeIndexPageOptions(), validateCustomCss(), validateDefaultCssEnabled() (+11 more)

### Community 4 - "HTML Template & Rendering"
Cohesion: 0.16
Nodes (21): buildHtmlDocument(), HtmlTemplateInput, MarkdownRenderResult, plainTextFromTokens(), renderMarkdown(), THEME_CONTROL_SCRIPT, THEME_TOGGLE_HTML, escapeHtmlAttribute() (+13 more)

### Community 5 - "Review Guide Documentation"
Cohesion: 0.09
Nodes (23): Implementation Review Guide, Final Review Output Structure, Finding Format, R-01 Scope and Diff, R-02 Public API, R-03 HTML Conversion and Determinism, R-04 Security, R-05 CLI and File Protection (+15 more)

### Community 6 - "PR Review Workflow"
Cohesion: 0.09
Nodes (22): Branch ai-code-review (review PR branch), Branch ai-code-review-fixes (main merge fixes branch), Cherry-pick Fixes Workflow, File Selection Algorithm (git ls-tree + priority filtering), Branch review-base (empty history base), GitHub Release (gh release create --verify-tag --generate-notes), npm Trusted Publishing (npm 11.5.1+), Version Bump (npm version --no-git-tag-version) (+14 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (21): DOM, ES2022, node, src/**/*.ts, test/**/*.ts, *.ts, compilerOptions, exactOptionalPropertyTypes (+13 more)

### Community 8 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): @arethetypeswrong/core, eslint, @eslint/js, devDependencies, @arethetypeswrong/core, eslint, @eslint/js, publint (+13 more)

### Community 9 - "CLI Config Loading"
Cohesion: 0.24
Nodes (19): CONFIG_FILE_NAMES, CONFIG_KEYS, isNodeErrorWithCode(), isRecord(), LoadedCliConfig, loadedConfig(), loadExplicitConfig(), loadPackageConfig() (+11 more)

### Community 10 - "Design System Components"
Cohesion: 0.13
Nodes (19): Primary Button (Pill CTA), Secondary Button, Warm Paper Canvas (#f6f5f4), Color System, Component Library, Display 1 (64px, 700, -2.125px tracking), Design Do's and Don'ts, Elevation System (+11 more)

### Community 11 - "Coverage Scripts"
Cohesion: 0.13
Nodes (11): formatMetric(), header, ignoredDirectories, markdown, metricNames, overallMetrics, reports, rootDirectory (+3 more)

### Community 12 - "Theme Switching System"
Cohesion: 0.15
Nodes (14): Color Tokens ( --md2html-* 14 variables light/dark), CSS Cascade Order (:root light → dark attribute → auto media → print), DOM Hook data-md2html-theme (html attribute), Effective Theme (light | dark actually rendered), Selection Mode (auto | light | dark via data-md2html-theme), Self-Contained Constraint (no external CSS/JS, no storage), Theme Toggle Button (#md2html-theme-toggle, fixed top-right), Accessibility Verification (Tab, 44px, aria-pressed, focus-visible) (+6 more)

### Community 13 - "Atomic Write Utilities"
Cohesion: 0.29
Nodes (5): AtomicWriteOperations, AtomicWriteRequest, fileExists(), isNodeErrorWithCode(), writeFileAtomically()

### Community 14 - "Theme Control Tests"
Cohesion: 0.27
Nodes (5): createButton(), createSandbox(), FakeIcon, Sandbox, SandboxOptions

### Community 15 - "Project Documentation"
Cohesion: 0.25
Nodes (8): CLI usage - command line arguments and config files, CSS application rules - default and custom, index page generation feature reference, library usage - JS/TS import with method chaining, next steps - project structure and improvements, project overview - Markdown to HTML library and CLI, technology stack - TypeScript, marked, cac, tsup, Builder pattern, color theme auto-selection and manual toggle

### Community 16 - "Index Navigation"
Cohesion: 0.50
Nodes (4): BackLink Nav (index.html back link, html-template.ts), FR-10 Back Link (目次へ戻る on converted HTML), CLI Config Resolution (package.json > .md2htmlrc > md2html.config.json), CLI md2html (input.md | - with --output, --css, --index, --force)

### Community 17 - "CI Quality Jobs"
Cohesion: 0.67
Nodes (3): Codecov Upload (codecov-action@v5), Coverage Job, Quality Job (Node matrix 22,24)

### Community 18 - "Codecov Setup"
Cohesion: 0.67
Nodes (3): codecov comment layout, codecov coverage configuration, unit test flags

## Knowledge Gaps
- **171 isolated node(s):** `HtmlDocumentInitialState`, `ParsedCliArguments`, `PathPlan`, `HtmlTemplateInput`, `MarkdownRenderResult` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HtmlDocument` connect `HTML Document Model` to `Core Conversion`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Md2HtmlError` connect `Core Conversion` to `CLI Argument Parsing`, `HTML Document Model`, `HTML Template & Rendering`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `HtmlDocumentInitialState`, `ParsedCliArguments`, `PathPlan` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CLI Argument Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.07239819004524888 - nodes in this community are weakly interconnected._
- **Should `Core Conversion` be split into smaller, more focused modules?**
  _Cohesion score 0.10040816326530612 - nodes in this community are weakly interconnected._
- **Should `Package Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._