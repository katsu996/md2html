# Graph Report - md2html  (2026-08-29)

## Corpus Check
- Corpus is ~23,327 words - fits in a single context window. You may not need a graph.

## Summary
- 439 nodes · 755 edges · 23 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.85)
- Token cost: 15,000 input · 8,000 output

## Community Hubs (Navigation)
- CLI Argument Parsing
- Core Conversion API
- Package Configuration
- Index Design & Requirements
- HTML Template & Theme
- HTML Document & Default CSS
- TypeScript Configuration
- Dev Dependencies
- Notion Design System
- Coverage Summary Script
- Review Guide & Theme Req
- CI/CD Workflows
- README Documentation
- Atomic File Writing
- Theme Switching Requirements
- Theme Control Tests
- Theme Visual Verification
- CSS Accessibility & Bugs
- Test Fixtures & Verification
- Codecov Configuration

## God Nodes (most connected - your core abstractions)
1. `runCli()` - 19 edges
2. `Theme Switching Requirements` - 16 edges
3. `Md2HtmlError` - 15 edges
4. `Implementation Review Guide` - 15 edges
5. `HtmlDocument` - 14 edges
6. `compilerOptions` - 14 edges
7. `generateIndex()` - 12 edges
8. `normalizeConvertOptions()` - 12 edges
9. `convertMarkdownFile()` - 11 edges
10. `convertMarkdown()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `public API design for index page` --semantically_similar_to--> `public API design - convertMdToHtml, convertMarkdownFile, generateIndex`  [INFERRED] [semantically similar]
  docs/INDEX_DESIGN.md → /home/aspirprojects/02-public/md2html/docs/INDEX_REQUIREMENTS.md
- `generateIndex function` --semantically_similar_to--> `public API design - convertMdToHtml, convertMarkdownFile, generateIndex`  [INFERRED] [semantically similar]
  docs/INDEX_DESIGN.md → /home/aspirprojects/02-public/md2html/docs/INDEX_REQUIREMENTS.md
- `convertMarkdownFile function` --semantically_similar_to--> `public API design - convertMdToHtml, convertMarkdownFile, generateIndex`  [INFERRED] [semantically similar]
  docs/INDEX_DESIGN.md → /home/aspirprojects/02-public/md2html/docs/INDEX_REQUIREMENTS.md
- `Recommended Verification Commands` --references--> `Test Fixture Article`  [INFERRED]
  docs/REVIEW_GUIDE.md → test/fixtures/article.md
- `Target Commit and Environment` --references--> `Test Fixture Article`  [EXTRACTED]
  docs/THEME_VISUAL_VERIFICATION.md → test/fixtures/article.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI Quality Pipeline Steps** — github_workflows_ci_typecheck, github_workflows_ci_lint, github_workflows_ci_test, github_workflows_ci_build [EXTRACTED 1.00]
- **Notion Design System Core** — design_md_notion_blue, design_md_canvas_soft, design_md_notioninter, design_md_sticker_palette [INFERRED 0.85]
- **md2html Core API** — readme_md_convert_md_to_html, readme_md_html_document, readme_md_convert_markdown_file, readme_md_generate_index [INFERRED 0.85]
- **Index Page Generation Feature Design** — docs_index_design_module_structure, docs_index_design_public_api, docs_index_design_collection_rules, docs_index_design_html_structure, docs_index_design_back_link, docs_index_design_cli_options, docs_index_design_test_design [EXTRACTED 1.00]
- **Index Page Requirements** — docs_index_requirements_purpose, docs_index_requirements_basic_principles, docs_index_requirements_terminology, docs_index_requirements_scope, docs_index_requirements_functional_requirements, docs_index_requirements_cli_spec, docs_index_requirements_public_api, docs_index_requirements_acceptance_criteria [EXTRACTED 1.00]
- **Project Core Requirements** — docs_requirements_overview, docs_requirements_library_usage, docs_requirements_cli_usage, docs_requirements_css_rules, docs_requirements_theme_switching, docs_requirements_tech_stack [EXTRACTED 1.00]
- **Review Guide Review Steps R-01 through R-08** — docs_review_guide_r01_scope_diff, docs_review_guide_r02_public_api, docs_review_guide_r03_html_conversion, docs_review_guide_r04_security, docs_review_guide_r05_cli_file_protection, docs_review_guide_r06_package_type_resolution, docs_review_guide_r07_css_accessibility, docs_review_guide_r07a_theme_switching, docs_review_guide_r08_test_quality [EXTRACTED 1.00]
- **Theme Switching Functional Requirements FR-01 to FR-15** — docs_theme_switching_requirements_fr, docs_theme_switching_requirements_html_contract, docs_theme_switching_requirements_dom_hooks, docs_theme_switching_requirements_ui_accessibility, docs_theme_switching_requirements_css_cascade, docs_theme_switching_requirements_color_tokens [EXTRACTED 1.00]
- **Theme Visual Verification Matrix Results** — docs_theme_visual_verification_matrix, docs_theme_visual_verification_accessibility, docs_theme_visual_verification_layout, docs_theme_visual_verification_bugs_fixed, docs_theme_visual_verification_unrun, docs_theme_visual_verification_judgment [EXTRACTED 1.00]

## Communities (23 total, 0 thin omitted)

### Community 0 - "CLI Argument Parsing"
Cohesion: 0.06
Nodes (53): booleanOverride(), CliRunArguments, errorMessage(), helpText(), OPTION_CONFIG, optionalString(), optionalStringArray(), parseCliArguments() (+45 more)

### Community 1 - "Core Conversion API"
Cohesion: 0.09
Nodes (44): convertMarkdown(), convertMdToHtml(), convertMarkdownFile(), ValidatedFileOptions, validateFileOptions(), Md2HtmlError, buildIndexPageHtml(), collectIndexEntries() (+36 more)

### Community 2 - "Package Configuration"
Cohesion: 0.05
Nodes (40): marked, author, bin, md2html, dependencies, marked, description, devEngines (+32 more)

### Community 3 - "Index Design & Requirements"
Cohesion: 0.07
Nodes (36): back link (目次へ戻る) implementation, CLI options --index and --site-title, index collection rules, convertMarkdownFile function, ConvertMarkdownFileOptions type, ConvertMarkdownFileResult type, createdAt and createdAtText handling, Md2HtmlErrorCode extensions (+28 more)

### Community 4 - "HTML Template & Theme"
Cohesion: 0.15
Nodes (22): buildHtmlDocument(), HtmlTemplateInput, MarkdownRenderResult, plainTextFromTokens(), renderMarkdown(), THEME_CONTROL_SCRIPT, THEME_TOGGLE_HTML, NormalizedConvertOptions (+14 more)

### Community 5 - "HTML Document & Default CSS"
Cohesion: 0.11
Nodes (8): HtmlDocument, HtmlDocumentInitialState, validateDefaultCssEnabled(), validateDocumentCss(), validateDocumentTitle(), DEFAULT_CSS, memoryIo(), tempDirectories

### Community 6 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (21): DOM, ES2022, node, src/**/*.ts, test/**/*.ts, *.ts, compilerOptions, exactOptionalPropertyTypes (+13 more)

### Community 7 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): @arethetypeswrong/core, eslint, @eslint/js, devDependencies, @arethetypeswrong/core, eslint, @eslint/js, publint (+13 more)

### Community 8 - "Notion Design System"
Cohesion: 0.13
Nodes (19): Primary Button (Pill CTA), Secondary Button, Warm Paper Canvas (#f6f5f4), Color System, Component Library, Display 1 (64px, 700, -2.125px tracking), Design Do's and Don'ts, Elevation System (+11 more)

### Community 9 - "Coverage Summary Script"
Cohesion: 0.13
Nodes (11): formatMetric(), header, ignoredDirectories, markdown, metricNames, overallMetrics, reports, rootDirectory (+3 more)

### Community 10 - "Review Guide & Theme Req"
Cohesion: 0.14
Nodes (15): Implementation Review Guide, Final Review Output Structure, Finding Format, R-01 Scope and Diff, R-02 Public API, R-03 HTML Conversion and Determinism, R-04 Security, R-05 CLI and File Protection (+7 more)

### Community 11 - "CI/CD Workflows"
Cohesion: 0.22
Nodes (13): Build Step, CI Workflow, Codecov Upload, Coverage Job, Lint Step, pnpm Setup, Quality Job, Test Step (+5 more)

### Community 12 - "README Documentation"
Cohesion: 0.25
Nodes (11): CLI Tool, CLI Config File, convertMarkdownFile Function, convertMdToHtml Function, Default CSS, generateIndex Function, GFM Support, HtmlDocument Class (+3 more)

### Community 13 - "Atomic File Writing"
Cohesion: 0.29
Nodes (5): AtomicWriteOperations, AtomicWriteRequest, fileExists(), isNodeErrorWithCode(), writeFileAtomically()

### Community 14 - "Theme Switching Requirements"
Cohesion: 0.20
Nodes (10): Theme Switching Requirements, Color Tokens (CSS Custom Properties), Default CSS Disabled Behavior, Impact on Existing Specifications, Functional Requirements FR-01 to FR-15, Out of Scope Items, Theme Switching Purpose, Scope: Default CSS Enabled HTML (+2 more)

### Community 15 - "Theme Control Tests"
Cohesion: 0.27
Nodes (5): createButton(), createSandbox(), FakeIcon, Sandbox, SandboxOptions

### Community 16 - "Theme Visual Verification"
Cohesion: 0.22
Nodes (9): Acceptance Criteria, CSS Cascade Order, Verification Policy, Theme Visual Verification Record, Overall Judgment: Pass, Initial Display and Layout Confirmations, Required Matrix 12 Rows Results, Target Commit and Environment (+1 more)

### Community 17 - "CSS Accessibility & Bugs"
Cohesion: 0.25
Nodes (8): R-07 CSS and Accessibility, Public DOM Hooks, Generated HTML Contract, UI/Accessibility Requirements UI-01 to UI-09, Accessibility Confirmations, Bug: Dark Icon Not Hidden in Light Mode, Bug: Icon Not Syncing After Manual Switch, Bugs Found and Fixed During Verification

### Community 18 - "Test Fixtures & Verification"
Cohesion: 0.25
Nodes (8): Recommended Verification Commands, Test Fixture Article, Long Code Line in Code Block, Example Image Reference, Long Title with Unbroken Word, Exceptionally Long URL, Table with Long Cell Content, Task List with Checked/Unchecked Items

### Community 19 - "Codecov Configuration"
Cohesion: 0.67
Nodes (3): codecov comment layout, codecov coverage configuration, unit test flags

## Knowledge Gaps
- **166 isolated node(s):** `name`, `version`, `description`, `type`, `url` (+161 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HtmlDocument` connect `HTML Document & Default CSS` to `Core Conversion API`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Md2HtmlError` connect `Core Conversion API` to `CLI Argument Parsing`, `HTML Template & Theme`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Configuration`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _166 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CLI Argument Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.06095481670929241 - nodes in this community are weakly interconnected._
- **Should `Core Conversion API` be split into smaller, more focused modules?**
  _Cohesion score 0.0898995240613432 - nodes in this community are weakly interconnected._
- **Should `Package Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._