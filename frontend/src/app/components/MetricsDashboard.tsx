import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Target, Activity, RefreshCw,
  CheckCircle, XCircle, ChefHat, Clock, Percent,
} from "lucide-react";

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

const API_BASE = "http://localhost:8080";

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nbStatus, setNbStatus] = useState<string>("");

  async function fetchMetrics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/metrics/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }

  async function trainNaiveBayes() {
    setNbStatus("Training...");
    try {
      const res = await fetch(`${API_BASE}/nb/train`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNbStatus("✅ Model trained successfully");
    } catch (err: any) {
      setNbStatus(`❌ Training failed: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              color: "var(--foreground)",
              fontWeight: 400,
            }}
          >
            Performance <em style={{ color: "var(--primary)" }}>Metrics</em>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
            Recommendation engine evaluation dashboard
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--primary)", color: "white", fontSize: "0.82rem", fontWeight: 600 }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
        >
          <XCircle size={16} style={{ color: "#C0392B" }} />
          <span style={{ fontSize: "0.82rem", color: "#C0392B" }}>{error}</span>
        </div>
      )}

      {metrics && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Total Recommendations",
                value: metrics.totalRecommendations.toString(),
                icon: BarChart3,
                color: "var(--primary)",
                bg: "rgba(224,106,78,0.08)",
              },
              {
                label: "Accepted / Cooked",
                value: `${metrics.totalAccepted + metrics.totalCooked}`,
                icon: CheckCircle,
                color: "#27ae60",
                bg: "rgba(39,174,96,0.08)",
              },
              {
                label: "Rejected",
                value: metrics.totalRejected.toString(),
                icon: XCircle,
                color: "#C0392B",
                bg: "rgba(192,57,43,0.08)",
              },
              {
                label: "Ignored",
                value: metrics.totalIgnored.toString(),
                icon: Clock,
                color: "var(--muted-foreground)",
                bg: "var(--muted)",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl border p-4"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    color: "var(--foreground)",
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: "0.3rem" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Classification Metrics */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                  Classification Metrics
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Precision", value: metrics.precision, desc: "TP / (TP + FP)" },
                  { label: "Recall", value: metrics.recall, desc: "TP / (TP + FN)" },
                  { label: "F1 Score", value: metrics.f1Score, desc: "Harmonic mean" },
                ].map(({ label, value, desc }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--muted-foreground)",
                            marginLeft: "0.5rem",
                          }}
                        >
                          {desc}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: value >= 0.7 ? "#27ae60" : value >= 0.4 ? "var(--accent)" : "#C0392B",
                        }}
                      >
                        {pct(value)}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--muted)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: pct(value),
                          background:
                            value >= 0.7 ? "#27ae60" : value >= 0.4 ? "var(--accent)" : "#C0392B",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Quality */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                  Recommendation Quality
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Avg Ingredient Match",
                    value: metrics.averageIngredientMatchScore,
                    desc: "Matched / Required",
                  },
                  {
                    label: "Suitability Rate",
                    value: metrics.suitabilityRate,
                    desc: "NB score > 0.5",
                  },
                ].map(({ label, value, desc }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--muted-foreground)",
                            marginLeft: "0.5rem",
                          }}
                        >
                          {desc}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
                        {pct(value)}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--muted)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: pct(value), background: "var(--primary)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Precision@K */}
              <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--muted-foreground)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Precision@K
                </p>
                <div className="flex gap-2">
                  {Object.entries(metrics.precisionAtK).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex-1 text-center py-2 rounded-xl"
                      style={{ background: "var(--muted)" }}
                    >
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {pct(v)}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>@{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* NB Model Training */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                  Naive Bayes Model
                </span>
              </div>
              <div className="flex items-center gap-3">
                {nbStatus && (
                  <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                    {nbStatus}
                  </span>
                )}
                <button
                  onClick={trainNaiveBayes}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                  style={{
                    background: "var(--muted)",
                    color: "var(--foreground)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  <TrendingUp size={13} />
                  Retrain Model
                </button>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--muted-foreground)",
                marginTop: "0.5rem",
                lineHeight: 1.5,
              }}
            >
              The Naive Bayes classifier is auto-trained on server startup using existing recipe data.
              Click "Retrain Model" to refresh the model with the latest data.
            </p>
          </div>

          {/* Formula Reference */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Percent size={16} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                Ranking Formula
              </span>
            </div>
            <div
              className="px-4 py-3 rounded-xl font-mono"
              style={{
                background: "var(--muted)",
                fontSize: "0.78rem",
                color: "var(--foreground)",
                lineHeight: 1.8,
              }}
            >
              FinalScore = (0.50 × IngredientMatchScore)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (0.30 × NaiveBayesSuitability)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (0.20 × BayesianPreferenceScore)
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--muted-foreground)",
                marginTop: "0.5rem",
              }}
            >
              IngredientMatchScore = Available Ingredients Used / Total Required
            </p>
          </div>
        </>
      )}

      {!metrics && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <BarChart3 size={40} style={{ color: "var(--muted-foreground)" }} />
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--foreground)" }}>
            No metrics data yet
          </p>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
            Metrics will appear after users start receiving recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
