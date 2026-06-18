import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Target, Activity, RefreshCw,
  CheckCircle, XCircle, ChefHat, Clock, Percent, FlaskConical,
  Download, Play, Loader2, AlertCircle, Table, PieChart, LineChart
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, Legend
} from "recharts";

interface MetricsSummary {
  totalRecommendations: number;
  totalAccepted: number;
  totalRejected: number;
  totalCooked: number;
  totalIgnored: number;
  precision: number;
  recall: number;
  f1Score: number;
  averageIngredientMatchScore: number;
  suitabilityRate: number;
  precisionAtK: Record<string, number>;
}

interface TopRecipeEntry {
  rcpId: string;
  recipeName: string;
  genre: string;
  avgFinalScore: number;
  avgIngredientMatch: number;
  totalRecommendations: number;
}

interface EvaluationReport {
  summary: MetricsSummary;
  precisionAtKCurve: Record<string, number>;
  feedbackDistribution: Record<string, number>;
  topRecipes: TopRecipeEntry[];
  matchScoreDistribution: Record<string, number>;
  componentWeights: Record<string, number>;
}

interface ScenarioResult {
  id: number;
  category: string;
  ingredients: string[];
  metrics: {
    precision: number;
    recall: number;
    f1: number;
    suitabilityRate: number;
    avgMatchScore: number;
    pAt5: number;
    pAt10: number;
    pAtK: Record<string, number>;
  };
}

interface EvaluationTestResult {
  scenarios: ScenarioResult[];
  summaryStats: Record<string, { mean: number; median: number; min: number; max: number; std: number }>;
  globalMetrics: MetricsSummary | null;
  precisionAtKCurve: Record<string, number>;
  timestamp: string;
}

const API_BASE = "http://localhost:8080";
const CHART_COLORS = ["#E06A4E", "#557C55", "#F5A623", "#8B5E3C", "#C0392B", "#5B8BC9"];

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function KpiCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: any; color: string; bg: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--foreground)", fontWeight: 400, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: "0.3rem" }}>{label}</p>
    </div>
  );
}

function GaugeBar({ label, value, desc }: { label: string; value: number; desc: string }) {
  const color = value >= 0.7 ? "#27ae60" : value >= 0.4 ? "var(--accent)" : "#C0392B";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>{label}</span>
          <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", marginLeft: "0.5rem" }}>{desc}</span>
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color }}>{pct(value)}</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: pct(value), background: color }} />
      </div>
    </div>
  );
}

function downloadLiveCsv(report: EvaluationReport) {
  const m = report.summary;
  const lines = [
    "Metric,Value",
    `Total Recommendations,${m.totalRecommendations}`,
    `Accepted,${m.totalAccepted}`,
    `Rejected,${m.totalRejected}`,
    `Cooked,${m.totalCooked}`,
    `Ignored,${m.totalIgnored}`,
    `Precision,${m.precision}`,
    `Recall,${m.recall}`,
    `F1 Score,${m.f1Score}`,
    `Avg Ingredient Match,${m.averageIngredientMatchScore}`,
    `Suitability Rate,${m.suitabilityRate}`,
    ...Object.entries(m.precisionAtK).map(([k, v]) => `P@${k},${v}`),
    ...Object.entries(report.feedbackDistribution || {}).map(([k, v]) => `Feedback ${k},${v}`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "live_metrics.csv"; a.click();
  URL.revokeObjectURL(url);
}

function downloadLiveMd(report: EvaluationReport) {
  const m = report.summary;
  const pkLine = Object.entries(m.precisionAtK).map(([k, v]) => `| P@${k} | ${(v * 100).toFixed(1)}% |`).join("\n");
  const topLine = report.topRecipes.slice(0, 5).map(r => `| ${r.recipeName} | ${(r.avgFinalScore * 100).toFixed(1)}% | ${r.totalRecommendations} |`).join("\n");
  const md = `# Chef MAI Recommendation System - Live Metrics Report

## Summary
| Metric | Value |
|---|---|
| Total Recommendations | ${m.totalRecommendations} |
| Precision | ${(m.precision * 100).toFixed(2)}% |
| Recall | ${(m.recall * 100).toFixed(2)}% |
| F1 Score | ${(m.f1Score * 100).toFixed(2)}% |
| Suitability Rate | ${(m.suitabilityRate * 100).toFixed(2)}% |
| Avg Ingredient Match | ${(m.averageIngredientMatchScore * 100).toFixed(2)}% |

## Precision@K
| K | Value |
|---|---|
${pkLine}

## Top Recipes
| Recipe | Avg Score | Times Recommended |
|---|---|---|
${topLine}

## Feedback Distribution
| Feedback | Count |
|---|---|
${Object.entries(report.feedbackDistribution || {}).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## Scoring Formula
FinalScore = (0.50 × IngredientMatch) + (0.30 × NaiveBayes) + (0.20 × BayesianPreference)

_Generated on ${new Date().toLocaleString()}_
`;
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "live_metrics_report.md"; a.click();
  URL.revokeObjectURL(url);
}

function LiveMetrics({ report }: { report: EvaluationReport | null }) {
  if (!report) return <div className="flex flex-col items-center justify-center py-16 gap-3"><Loader2 size={40} className="animate-spin" style={{ color: "var(--primary)" }} /><p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--foreground)" }}>Loading metrics...</p></div>;
  const m = report.summary;

  const metricBars = [
    { name: "Precision", value: m.precision },
    { name: "Recall", value: m.recall },
    { name: "F1 Score", value: m.f1Score },
    { name: "Suitability", value: m.suitabilityRate },
    { name: "P@5", value: report.precisionAtKCurve?.["5"] ?? 0 },
    { name: "P@10", value: report.precisionAtKCurve?.["10"] ?? 0 },
  ];

  const pkCurve = Object.entries(report.precisionAtKCurve || {}).map(([k, v]) => ({ k: `K=${k}`, precision: v }));

  const feedbackPie = Object.entries(report.feedbackDistribution || {}).map(([name, value]) => ({ name, value }));

  const topRecipes = (report.topRecipes || []).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => downloadLiveCsv(report)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
          <Download size={13} /> CSV
        </button>
        <button onClick={() => downloadLiveMd(report)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
          <Download size={13} /> Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Recommendations" value={m.totalRecommendations.toString()} icon={BarChart3} color="var(--primary)" bg="rgba(224,106,78,0.08)" />
        <KpiCard label="Accepted / Cooked" value={`${m.totalAccepted + m.totalCooked}`} icon={CheckCircle} color="#27ae60" bg="rgba(39,174,96,0.08)" />
        <KpiCard label="Rejected" value={m.totalRejected.toString()} icon={XCircle} color="#C0392B" bg="rgba(192,57,43,0.08)" />
        <KpiCard label="Ignored" value={m.totalIgnored.toString()} icon={Clock} color="var(--muted-foreground)" bg="var(--muted)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Classification Metrics</span>
          </div>
          <div className="space-y-3">
            <GaugeBar label="Precision" value={m.precision} desc="TP / (TP + FP)" />
            <GaugeBar label="Recall" value={m.recall} desc="TP / (TP + FN)" />
            <GaugeBar label="F1 Score" value={m.f1Score} desc="Harmonic mean" />
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Recommendation Quality</span>
          </div>
          <div className="space-y-3">
            <GaugeBar label="Avg Ingredient Match" value={m.averageIngredientMatchScore} desc="Matched / Required" />
            <GaugeBar label="Suitability Rate" value={m.suitabilityRate} desc="NB score > 0.5" />
          </div>
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
              Precision@K
            </p>
            <div className="flex gap-2">
              {Object.entries(m.precisionAtK).map(([k, v]) => (
                <div key={k} className="flex-1 text-center py-2 rounded-xl" style={{ background: "var(--muted)" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>{pct(v)}</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>@{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Overall Metrics Mean Performance</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "Precision", v: m.precision },
              { name: "Recall", v: m.recall },
              { name: "F1 Score", v: m.f1Score },
              { name: "Suitability", v: m.suitabilityRate },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} formatter={(val: number) => pct(val)} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                <Cell fill="#E06A4E" />
                <Cell fill="#557C55" />
                <Cell fill="#5B8BC9" />
                <Cell fill="#F5A623" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <LineChart size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Precision vs Recall</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "Precision", value: m.precision },
              { name: "Recall", value: m.recall },
            ]} barSize={80}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} formatter={(val: number) => pct(val)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="#E06A4E" />
                <Cell fill="#557C55" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <LineChart size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Precision@K Curve</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={pkCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="k" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} formatter={(val: number) => pct(val)} />
              <Line type="monotone" dataKey="precision" stroke="#557C55" strokeWidth={2} dot={{ fill: "#557C55", r: 4 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        {feedbackPie.length > 0 && (
          <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={16} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Feedback Distribution</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RePieChart>
                <Pie data={feedbackPie} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {feedbackPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(() => {
          const dist = Object.entries(report.matchScoreDistribution || {}).map(([range, count]) => ({ range, count }));
          return dist.length > 0 && dist.some(d => d.count > 0) ? (
            <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Ingredient Match Score Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                  <Bar dataKey="count" fill="#8B5E3C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null;
        })()}

        {topRecipes.length > 0 && (
          <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Top 10 Performing Recipes</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRecipes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="recipeName" width={120} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} formatter={(val: number) => pct(val)} />
                <Bar dataKey="avgFinalScore" fill="#F5A623" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function EvaluationRunner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterCat, setFilterCat] = useState<string>("All");

  async function runEvaluation() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/metrics/run-evaluation`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCsv() {
    const res = await fetch(`${API_BASE}/metrics/export/csv`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "metrics.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadMd() {
    const res = await fetch(`${API_BASE}/metrics/export/md`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "evaluation_report.md"; a.click();
    URL.revokeObjectURL(url);
  }

  const categories = result ? ["All", ...new Set(result.scenarios.map(s => s.category))] : ["All"];

  let filtered = result?.scenarios || [];
  if (filterCat !== "All") filtered = filtered.filter(s => s.category === filterCat);
  filtered = [...filtered].sort((a, b) => {
    const aVal = sortField === "id" ? a.id : (a.metrics as any)[sortField] ?? 0;
    const bVal = sortField === "id" ? b.id : (b.metrics as any)[sortField] ?? 0;
    return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)", fontWeight: 400 }}>
            Evaluation <em style={{ color: "var(--primary)" }}>Test Runner</em>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
            Runs 30 test scenarios to evaluate recommendation engine performance
          </p>
        </div>
        <button
          onClick={runEvaluation}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--primary)", color: "white", fontSize: "0.82rem", fontWeight: 600 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? "Running 30 Scenarios..." : "Run Evaluation"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}>
          <AlertCircle size={16} style={{ color: "#C0392B" }} />
          <span style={{ fontSize: "0.82rem", color: "#C0392B" }}>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={40} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--foreground)" }}>Running 30 evaluation scenarios...</p>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>This may take a minute</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Filter:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filterCat === cat ? "var(--primary)" : "var(--muted)",
                  color: filterCat === cat ? "white" : "var(--foreground)"
                }}
              >
                {cat}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={downloadCsv} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
              <Download size={13} /> CSV
            </button>
            <button onClick={downloadMd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
              <Download size={13} /> Report
            </button>
          </div>

          {result.summaryStats && (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)" }}>
                Summary Statistics (over 30 scenarios)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
                      <th className="px-4 py-2.5 text-left" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Metric</th>
                      <th className="px-4 py-2.5 text-right" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mean</th>
                      <th className="px-4 py-2.5 text-right" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Median</th>
                      <th className="px-4 py-2.5 text-right" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Min</th>
                      <th className="px-4 py-2.5 text-right" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Max</th>
                      <th className="px-4 py-2.5 text-right" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Std Dev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["Precision", "Recall", "F1 Score", "Suitability Rate", "Ingredient Match Score", "Precision@5", "Precision@10"] as const).map((metric, i) => {
                      const s = result.summaryStats![metric];
                      if (!s) return null;
                      return (
                        <tr key={metric} style={{ borderBottom: i < 6 ? "1px solid var(--border)" : "none", background: "var(--card)" }}>
                          <td className="px-4 py-2.5" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)" }}>{metric}</td>
                          <td className="px-4 py-2.5 text-right font-mono" style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{(s.mean * 100).toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-right font-mono" style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{(s.median * 100).toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-right font-mono" style={{ fontSize: "0.82rem", color: "#C0392B" }}>{(s.min * 100).toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-right font-mono" style={{ fontSize: "0.82rem", color: "#27ae60" }}>{(s.max * 100).toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-right font-mono" style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{(s.std * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                    {[
                      { key: "id", label: "Scenario" },
                      { key: "category", label: "Category" },
                      { key: "precision", label: "Precision" },
                      { key: "recall", label: "Recall" },
                      { key: "f1", label: "F1" },
                      { key: "suitabilityRate", label: "Suit." },
                      { key: "avgMatchScore", label: "Avg Match" },
                      { key: "pAt5", label: "P@5" },
                      { key: "pAt10", label: "P@10" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="px-4 py-3 text-left cursor-pointer select-none"
                        style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}
                      >
                        {label} {sortField === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sc, i) => {
                    const m = sc.metrics;
                    return (
                      <tr key={sc.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", background: "var(--card)" }}>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)" }}>#{sc.id}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{
                            background: sc.category.includes("High") ? "rgba(39,174,96,0.12)" : sc.category.includes("Medium") ? "rgba(245,166,35,0.12)" : sc.category.includes("Low") ? "rgba(192,57,43,0.12)" : sc.category.includes("Missing") ? "rgba(224,106,78,0.12)" : "rgba(91,139,201,0.12)",
                            color: sc.category.includes("High") ? "#27ae60" : sc.category.includes("Medium") ? "#F5A623" : sc.category.includes("Low") ? "#C0392B" : sc.category.includes("Missing") ? "#E06A4E" : "#5B8BC9"
                          }}>{sc.category}</span>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: m.precision >= 0.5 ? "#27ae60" : m.precision >= 0.2 ? "#F5A623" : "#C0392B", fontWeight: 600 }}>{pct(m.precision)}</td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: m.recall >= 0.8 ? "#27ae60" : "#F5A623", fontWeight: 600 }}>{pct(m.recall)}</td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: m.f1 >= 0.5 ? "#27ae60" : m.f1 >= 0.2 ? "#F5A623" : "#C0392B", fontWeight: 600 }}>{pct(m.f1)}</td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{pct(m.suitabilityRate)}</td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{pct(m.avgMatchScore)}</td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{pct(m.pAt5)}</td>
                        <td className="px-4 py-3" style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>{pct(m.pAt10)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {result.globalMetrics && (
            <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Percent size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Evaluation Summary</span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
                Ran 30 scenarios — evaluated at {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </>
      )}

      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <FlaskConical size={40} style={{ color: "var(--muted-foreground)" }} />
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--foreground)" }}>No evaluation run yet</p>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
            Click "Run Evaluation" to execute the 30-scenario test suite.
          </p>
        </div>
      )}
    </div>
  );
}

interface MetricsDashboardProps {
  initialTab?: "live" | "evaluation";
}

export function MetricsDashboard({ initialTab = "live" }: MetricsDashboardProps) {
  const [tab, setTab] = useState<"live" | "evaluation">(initialTab === "evaluation" ? "evaluation" : "live");
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/metrics/report`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "live") fetchReport();
  }, [tab]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>
            Performance <em style={{ color: "var(--primary)" }}>Metrics</em>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
            {tab === "live" ? "Live recommendation engine evaluation data" : "On-demand 30-scenario evaluation test"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setTab("live")}
              className="px-4 py-2 text-xs font-semibold transition-all"
              style={{ background: tab === "live" ? "var(--primary)" : "var(--card)", color: tab === "live" ? "white" : "var(--muted-foreground)" }}
            >
              Live
            </button>
            <button
              onClick={() => setTab("evaluation")}
              className="px-4 py-2 text-xs font-semibold transition-all"
              style={{ background: tab === "evaluation" ? "var(--primary)" : "var(--card)", color: tab === "evaluation" ? "white" : "var(--muted-foreground)" }}
            >
              Evaluation
            </button>
          </div>
          {tab === "live" && (
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "white", fontSize: "0.82rem", fontWeight: 600 }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}>
          <XCircle size={16} style={{ color: "#C0392B" }} />
          <span style={{ fontSize: "0.82rem", color: "#C0392B" }}>{error}</span>
        </div>
      )}

      {tab === "live" && loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={40} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--foreground)" }}>Loading metrics...</p>
        </div>
      )}

      {tab === "live" && !loading && <LiveMetrics report={report} />}

      {tab === "evaluation" && <EvaluationRunner />}

      <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Percent size={16} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Ranking Formula</span>
        </div>
        <div className="px-4 py-3 rounded-xl font-mono" style={{ background: "var(--muted)", fontSize: "0.78rem", color: "var(--foreground)", lineHeight: 1.8 }}>
          FinalScore = (0.50 × IngredientMatchScore)
          <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (0.30 × NaiveBayesSuitability)
          <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (0.20 × BayesianPreferenceScore)
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
          IngredientMatchScore = Available Ingredients Used / Total Required
        </p>
      </div>
    </div>
  );
}
