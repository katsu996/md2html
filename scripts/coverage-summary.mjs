import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const metricNames = ["lines", "statements", "branches", "functions"];
const rootDirectory = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "dist", ".next", ".turbo"]);

function findCoverageSummaries(directory, results = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) findCoverageSummaries(entryPath, results);
      continue;
    }
    if (entry.name === "coverage-summary.json" && dirname(entryPath).endsWith("coverage")) {
      results.push(entryPath);
    }
  }
  return results;
}

function toMetrics(summary) {
  return Object.fromEntries(metricNames.map((name) => {
    const item = summary[name] ?? {};
    const total = Math.max(0, Number(item.total ?? 0) - Number(item.skipped ?? 0));
    const covered = Math.min(total, Number(item.covered ?? 0));
    return [name, { covered, total }];
  }));
}

function combineMetrics(items) {
  return Object.fromEntries(metricNames.map((name) => [name, items.reduce(
    (accumulator, item) => ({
      covered: accumulator.covered + item[name].covered,
      total: accumulator.total + item[name].total
    }),
    { covered: 0, total: 0 }
  )]));
}

function packageLabel(summaryPath) {
  const packageDirectory = dirname(dirname(summaryPath));
  const manifestPath = join(packageDirectory, "package.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const name = typeof manifest.name === "string" ? manifest.name : relative(rootDirectory, packageDirectory) || ".";
    return `${name} (${relative(rootDirectory, packageDirectory) || "."})`;
  }
  return relative(rootDirectory, packageDirectory) || ".";
}

function formatMetric(metric) {
  if (metric.total === 0) return "—";
  return `${metric.covered}/${metric.total} (${((metric.covered / metric.total) * 100).toFixed(2)}%)`;
}

const summaries = findCoverageSummaries(rootDirectory).sort();
if (summaries.length === 0) {
  throw new Error("coverage-summary.json が見つかりません。先に pnpm run test:coverage を実行してください。");
}

const reports = [];
const uniqueFiles = new Map();
for (const summaryPath of summaries) {
  const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
  const files = Object.entries(summary).filter(([filePath]) => filePath !== "total");
  const fileMetrics = files.map(([, fileSummary]) => toMetrics(fileSummary));
  reports.push({ label: packageLabel(summaryPath), metrics: combineMetrics(fileMetrics) });
  for (const [filePath, fileSummary] of files) {
    const metrics = toMetrics(fileSummary);
    const score = metricNames.reduce((total, name) => total + metrics[name].total, 0);
    const existing = uniqueFiles.get(filePath);
    if (!existing || score > existing.score) uniqueFiles.set(filePath, { metrics, score });
  }
}

const overallMetrics = combineMetrics(Array.from(uniqueFiles.values(), (entry) => entry.metrics));
const header = ["Package / report", "Lines", "Statements", "Branches", "Functions"];
const rows = reports.map((report) => [
  report.label.replaceAll("|", "\\|"),
  ...metricNames.map((name) => formatMetric(report.metrics[name]))
]);
rows.push(["**All (weighted by executable items)**", ...metricNames.map((name) => formatMetric(overallMetrics[name]))]);
const markdown = [
  "## Coverage summary",
  "",
  `| ${header.join(" | ")} |`,
  `| ${header.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.join(" | ")} |`),
  ""
].join("\n");

mkdirSync(join(rootDirectory, "coverage"), { recursive: true });
writeFileSync(join(rootDirectory, "coverage", "summary.md"), markdown, "utf8");
process.stdout.write(markdown);
