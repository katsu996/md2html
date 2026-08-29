# Graph Report - md2html  (2026-08-29)

## Corpus Check
- Corpus is ~23,327 words - fits in a single context window. You may not need a graph.

## Summary
- 438 nodes · 751 edges · 23 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core Conversion
- CLI Interface
- Package Metadata
- Design Documentation
- HTML Template & Markdown Rendering
- TypeScript Config & References
- Dev Dependencies & Tooling
- CLI Config Loading
- Design System Components
- Coverage Scripts
- Review Guide Documentation
- CI/CD Workflows
- README Documentation
- Atomic Write Utilities
- Theme Switching Requirements
- Theme Control Tests
- Theme Visual Verification
- Theme Accessibility & Bugs
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
- `Recommended Verification Commands` --references--> `Test Fixture Article`  [INFERRED]
  docs/REVIEW_GUIDE.md → test/fixtures/article.md
- `Target Commit and Environment` --references--> `Test Fixture Article`  [EXTRACTED]
  docs/THEME_VISUAL_VERIFICATION.md → test/fixtures/article.md
- `runCli()` --calls--> `runCli()`  [EXTRACTED]
  test/integration/cli.test.ts → src/cli/run.ts
- `Typecheck Step` --conceptually_related_to--> `Release Workflow`  [INFERRED]
  .github/workflows/ci.yml → .github/workflows/release.yml
- `Lint Step` --conceptually_related_to--> `Release Workflow`  [INFERRED]
  .github/workflows/ci.yml → .github/workflows/release.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI Quality Pipeline Steps** — github_workflows_ci_typecheck, github_workflows_ci_lint, github_workflows_ci_test, github_workflows_ci_build [EXTRACTED 1.00]
- **Notion Design System Core** — design_md_notion_blue, design_md_canvas_soft, design_md_notioninter, design_md_sticker_palette [INFERRED 0.85]
- **md2html Core API** — readme_md_convert_md_to_html, readme_md_html_document, readme_md_convert_markdown_file, readme_md_generate_index [INFERRED 0.85]
- **Index Page Generation Feature Design** — docs_index_design_module_structure, docs_index_design_public_api, docs_index_design_collection_rules, docs_index_design_html_structure, docs_index_design_back_link, docs_index_design_cli_options, docs_index_design_test_design [EXTRACTED 1.00]
- **Project Core Requirements** — docs_requirements_overview, docs_requirements_library_usage, docs_requirements_cli_usage, docs_requirements_css_rules, docs_requirements_theme_switching, docs_requirements_tech_stack [EXTRACTED 1.00]
- **Review Guide Review Steps R-01 through R-08** — docs_review_guide_r01_scope_diff, docs_review_guide_r02_public_api, docs_review_guide_r03_html_conversion, docs_review_guide_r04_security, docs_review_guide_r05_cli_file_protection, docs_review_guide_r06_package_type_resolution, docs_review_guide_r07_css_accessibility, docs_review_guide_r07a_theme_switching, docs_review_guide_r08_test_quality [EXTRACTED 1.00]
- **Theme Switching Functional Requirements FR-01 to FR-15** — docs_theme_switching_requirements_fr, docs_theme_switching_requirements_html_contract, docs_theme_switching_requirements_dom_hooks, docs_theme_switching_requirements_ui_accessibility, docs_theme_switching_requirements_css_cascade, docs_theme_switching_requirements_color_tokens [EXTRACTED 1.00]
- **Theme Visual Verification Matrix Results** — docs_theme_visual_verification_matrix, docs_theme_visual_verification_accessibility, docs_theme_visual_verification_layout, docs_theme_visual_verification_bugs_fixed, docs_theme_visual_verification_unrun, docs_theme_visual_verification_judgment [EXTRACTED 1.00]

## Communities (23 total, 0 thin omitted)

### Community 0 - "Core Conversion"
Cohesion: 0.07
Nodes (47): convertMarkdown(), convertMdToHtml(), convertMarkdownFile(), ValidatedFileOptions, validateFileOptions(), Md2HtmlError, HtmlDocument, HtmlDocumentInitialState (+39 more)

### Community 1 - "CLI Interface"
Cohesion: 0.07
Nodes (38): booleanOverride(), CliRunArguments, errorMessage(), helpText(), OPTION_CONFIG, optionalString(), optionalStringArray(), parseCliArguments() (+30 more)

### Community 2 - "Package Metadata"
Cohesion: 0.05
Nodes (40): marked, author, bin, md2html, dependencies, marked, description, devEngines (+32 more)

### Community 3 - "Design Documentation"
Cohesion: 0.06
Nodes (35): back link (目次へ戻る) implementation, CLI options --index and --site-title, index collection rules, convertMarkdownFile function, ConvertMarkdownFileOptions type, ConvertMarkdownFileResult type, createdAt and createdAtText handling, Md2HtmlErrorCode extensions (+27 more)

### Community 4 - "HTML Template & Markdown Rendering"
Cohesion: 0.14
Nodes (23): buildHtmlDocument(), HtmlTemplateInput, indexBodyHtml(), MarkdownRenderResult, plainTextFromTokens(), renderMarkdown(), THEME_CONTROL_SCRIPT, THEME_TOGGLE_HTML (+15 more)

### Community 5 - "TypeScript Config & References"
Cohesion: 0.09
Nodes (21): DOM, ES2022, node, src/**/*.ts, test/**/*.ts, *.ts, compilerOptions, exactOptionalPropertyTypes (+13 more)

### Community 6 - "Dev Dependencies & Tooling"
Cohesion: 0.10
Nodes (21): @arethetypeswrong/core, eslint, @eslint/js, devDependencies, @arethetypeswrong/core, eslint, @eslint/js, publint (+13 more)

### Community 7 - "CLI Config Loading"
Cohesion: 0.24
Nodes (19): CONFIG_FILE_NAMES, CONFIG_KEYS, isNodeErrorWithCode(), isRecord(), LoadedCliConfig, loadedConfig(), loadExplicitConfig(), loadPackageConfig() (+11 more)

### Community 8 - "Design System Components"
Cohesion: 0.13
Nodes (19): Primary Button (Pill CTA), Secondary Button, Warm Paper Canvas (#f6f5f4), Color System, Component Library, Display 1 (64px, 700, -2.125px tracking), Design Do's and Don'ts, Elevation System (+11 more)

### Community 9 - "Coverage Scripts"
Cohesion: 0.13
Nodes (11): formatMetric(), header, ignoredDirectories, markdown, metricNames, overallMetrics, reports, rootDirectory (+3 more)

### Community 10 - "Review Guide Documentation"
Cohesion: 0.14
Nodes (15): Implementation Review Guide, Final Review Output Structure, Finding Format, R-01 Scope and Diff, R-02 Public API, R-03 HTML Conversion and Determinism, R-04 Security, R-05 CLI and File Protection (+7 more)

### Community 11 - "CI/CD Workflows"
Cohesion: 0.22
Nodes (13): Build Step, CI Workflow, Codecov Upload, Coverage Job, Lint Step, pnpm Setup, Quality Job, Test Step (+5 more)

### Community 12 - "README Documentation"
Cohesion: 0.25
Nodes (11): CLI Tool, CLI Config File, convertMarkdownFile Function, convertMdToHtml Function, Default CSS, generateIndex Function, GFM Support, HtmlDocument Class (+3 more)

### Community 13 - "Atomic Write Utilities"
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

### Community 17 - "Theme Accessibility & Bugs"
Cohesion: 0.25
Nodes (8): R-07 CSS and Accessibility, Public DOM Hooks, Generated HTML Contract, UI/Accessibility Requirements UI-01 to UI-09, Accessibility Confirmations, Bug: Dark Icon Not Hidden in Light Mode, Bug: Icon Not Syncing After Manual Switch, Bugs Found and Fixed During Verification

### Community 18 - "Test Fixtures & Verification"
Cohesion: 0.25
Nodes (8): Recommended Verification Commands, Test Fixture Article, Long Code Line in Code Block, Example Image Reference, Long Title with Unbroken Word, Exceptionally Long URL, Table with Long Cell Content, Task List with Checked/Unchecked Items

### Community 19 - "Codecov Configuration"
Cohesion: 0.67
Nodes (3): codecov comment layout, codecov coverage configuration, unit test flags

## Knowledge Gaps
- **168 isolated node(s):** `name`, `version`, `description`, `type`, `url` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Md2HtmlError` connect `Core Conversion` to `CLI Interface`, `HTML Template & Markdown Rendering`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies & Tooling` to `Package Metadata`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Conversion` be split into smaller, more focused modules?**
  _Cohesion score 0.07087719298245614 - nodes in this community are weakly interconnected._
- **Should `CLI Interface` be split into smaller, more focused modules?**
  _Cohesion score 0.06578947368421052 - nodes in this community are weakly interconnected._
- **Should `Package Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `Design Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.06218487394957983 - nodes in this community are weakly interconnected._