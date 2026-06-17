import { useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, LogOut,
  TrendingUp, ShieldCheck, AlertTriangle, CheckCircle,
  MoreVertical, Search, Flag, Trash2, Eye, ChevronDown, Star,
  UserCheck, UserX, Filter, Target, Crosshair, Activity, BarChart2, BarChart3
} from "lucide-react";
import { MetricsDashboard } from "./MetricsDashboard";

type AdminTab = "dashboard" | "users" | "reviews" | "metrics";

interface AdminPortalProps {
  onLogout: () => void;
}

const mlMetricsHistory = [
  { week: "W1", accuracy: 81, precision: 78, recall: 74, f1: 76 },
  { week: "W2", accuracy: 83, precision: 80, recall: 77, f1: 78 },
  { week: "W3", accuracy: 85, precision: 82, recall: 79, f1: 80 },
  { week: "W4", accuracy: 84, precision: 83, recall: 81, f1: 82 },
  { week: "W5", accuracy: 87, precision: 85, recall: 83, f1: 84 },
  { week: "W6", accuracy: 89, precision: 87, recall: 86, f1: 86 },
  { week: "W7", accuracy: 91, precision: 89, recall: 88, f1: 88 },
];

const radarData = [
  { metric: "Accuracy", value: 91 },
  { metric: "Precision", value: 89 },
  { metric: "Recall", value: 88 },
  { metric: "F1 Score", value: 88.3 },
];

const MOCK_USERS = [
  { id: 1, name: "Sofia Romano", email: "sofia@email.com", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b9bc?w=80&h=80&fit=crop", recipes: 12, reviews: 34, status: "active", joined: "Jan 12, 2025" },
  { id: 2, name: "Carlos Mendez", email: "carlos@email.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", recipes: 7, reviews: 18, status: "active", joined: "Mar 5, 2025" },
  { id: 3, name: "Hana Kimura", email: "hana@email.com", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop", recipes: 3, reviews: 9, status: "suspended", joined: "Feb 20, 2025" },
  { id: 4, name: "Marcus Lee", email: "marcus@email.com", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", recipes: 5, reviews: 22, status: "active", joined: "Apr 1, 2025" },
  { id: 5, name: "Priya Sharma", email: "priya@email.com", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop", recipes: 18, reviews: 67, status: "active", joined: "Dec 8, 2024" },
];

const MOCK_REVIEWS = [
  { id: 1, user: "Guest123", recipe: "Pasta al Limone", text: "Absolutely terrible, do not try!", rating: 1, status: "flagged", date: "2 hours ago" },
  { id: 2, user: "FoodLover99", recipe: "Thai Green Curry", text: "Best curry recipe I've found online. Tried it 3 times now!", rating: 5, status: "approved", date: "5 hours ago" },
  { id: 3, user: "CookMaster", recipe: "Beef Tacos", text: "This recipe has an error in step 3, the temperature is wrong", rating: 2, status: "flagged", date: "1 day ago" },
  { id: 4, user: "HomeChef", recipe: "Avocado Toast", text: "Classic and delicious, exactly how a brunch should be.", rating: 4, status: "approved", date: "2 days ago" },
];

function MLRadarChart({ data }: { data: { metric: string; value: number }[] }) {
  const cx = 100, cy = 100, r = 72;
  const n = data.length;
  const angles = data.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
  const rings = [0.25, 0.5, 0.75, 1];
  const min = 80, max = 100;
  const norm = (v: number) => (v - min) / (max - min);

  const pts = (scale: number) =>
    angles.map(a => [cx + r * scale * Math.cos(a), cy + r * scale * Math.sin(a)] as [number, number]);

  const toPath = (points: [number, number][]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";

  const dataPoints = data.map((d, i) => [
    cx + r * norm(d.value) * Math.cos(angles[i]),
    cy + r * norm(d.value) * Math.sin(angles[i]),
  ] as [number, number]);

  return (
    <svg viewBox="0 0 200 200" width="100%" height="200">
      {rings.map((s, i) => (
        <path key={i} d={toPath(pts(s))} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="var(--border)" strokeWidth="1" />
      ))}
      <path d={toPath(dataPoints)} fill="var(--primary)" fillOpacity={0.18} stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--primary)" />
      ))}
      {data.map((d, i) => {
        const a = angles[i];
        const lx = cx + (r + 18) * Math.cos(a);
        const ly = cy + (r + 18) * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="var(--muted-foreground)">
            {d.metric} {d.value}%
          </text>
        );
      })}
    </svg>
  );
}

export function AdminPortal({ onLogout }: AdminPortalProps) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [userSearch, setUserSearch] = useState("");

  const navItems: { key: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "users", icon: Users, label: "Users" },
    { key: "reviews", icon: MessageSquare, label: "Reviews" },
    { key: "metrics", icon: BarChart3, label: "Metrics" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex w-60 flex-shrink-0 flex-col border-r" style={{ background: "#1C1009", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <p style={{ color: "white", fontFamily: "var(--font-display)", fontSize: "1rem" }}>Chef MAI</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 px-3">
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", padding: "0 0.75rem", marginBottom: "0.5rem" }}>Navigation</p>
          {navItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left"
              style={{
                background: tab === key ? "rgba(212,98,42,0.2)" : "transparent",
                color: tab === key ? "var(--primary)" : "rgba(255,255,255,0.55)",
                fontWeight: tab === key ? 600 : 400,
                fontSize: "0.875rem",
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {/* Admin info */}
        <div className="px-3 pb-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <ShieldCheck size={15} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>Admin User</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem" }}>admin@chefmai.app</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div>
            {/* Mobile: show logo */}
            <div className="md:hidden">
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--foreground)" }}>Chef MAI</p>
              <p style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Console</p>
            </div>
            {/* Desktop: show tab title */}
            <div className="hidden md:block">
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--foreground)", fontWeight: 400, textTransform: "capitalize" }}>
                {tab}
              </h1>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--foreground)" }} />
              <span style={{ fontSize: "0.78rem", color: "var(--foreground)", fontWeight: 500 }}>System Online</span>
            </div>
            <button
              onClick={onLogout}
              className="md:hidden px-3 py-1.5 rounded-xl"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: "0.75rem", fontWeight: 500 }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ scrollbarWidth: "none" }}>
          {tab === "dashboard" && <DashboardTab />}
          {tab === "users" && <UsersTab search={userSearch} setSearch={setUserSearch} />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "metrics" && <MetricsDashboard />}
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex border-t flex-shrink-0" style={{ background: "#1C1009", borderColor: "rgba(255,255,255,0.1)" }}>
          {navItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
              style={{ color: tab === key ? "var(--primary)" : "rgba(255,255,255,0.45)" }}
            >
              <Icon size={19} strokeWidth={tab === key ? 2.5 : 1.8} />
              <span style={{ fontSize: "0.6rem", fontWeight: tab === key ? 700 : 400 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardTab() {
  const mlMetrics = [
    {
      label: "Accuracy",
      value: 91.4,
      prev: 89.0,
      icon: Target,
      color: "var(--primary)",
      description: "Overall correct predictions out of all predictions made",
    },
    {
      label: "Precision",
      value: 88.7,
      prev: 85.3,
      icon: Crosshair,
      color: "var(--foreground)",
      description: "Of all flagged items, how many were actually violations",
    },
    {
      label: "Recall",
      value: 87.9,
      prev: 83.1,
      icon: Activity,
      color: "#5B8BC9",
      description: "Of all actual violations, how many were correctly identified",
    },
    {
      label: "F1 Score",
      value: 88.3,
      prev: 84.2,
      icon: BarChart2,
      color: "#8B5E3C",
      description: "Harmonic mean of precision and recall — balanced performance",
    },
  ];

  return (
    <div className="space-y-6">
      {/* System KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: "48,291", change: "+12%", icon: Users, color: "var(--primary)" },
          { label: "Flagged Reviews", value: "24", change: "-3", icon: AlertTriangle, color: "var(--accent)" },
          { label: "Active Today", value: "3,412", change: "+5%", icon: TrendingUp, color: "var(--foreground)" },
        ].map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{change}</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--foreground)" }}>{value}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ML Metrics section header */}
      <div>
        <p className="uppercase tracking-widest mb-1" style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", letterSpacing: "0.18em" }}>
          Moderation Model · Last 7 weeks
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)", fontWeight: 400 }}>
          Model Performance Metrics
        </h2>
      </div>

      {/* ML Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mlMetrics.map(({ label, value, prev, icon: Icon, color, description }) => {
          const delta = (value - prev).toFixed(1);
          const isUp = value >= prev;
          return (
            <div key={label} className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: isUp ? "rgba(0,0,0,0.04)" : "rgba(192,57,43,0.1)",
                    color: isUp ? "var(--foreground)" : "#C0392B",
                  }}
                >
                  {isUp ? "▲" : "▼"} {Math.abs(Number(delta))}%
                </span>
              </div>

              {/* Gauge bar */}
              <div>
                <div className="flex items-end justify-between mb-1.5">
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--foreground)", lineHeight: 1 }}>
                    {value}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>/ 100</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${value}%`, background: color }}
                  />
                </div>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{label}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.5, marginTop: "0.2rem" }}>{description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ingredient Match Score */}
      <div className="p-5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="uppercase tracking-widest mb-1" style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", letterSpacing: "0.18em" }}>
              Recommendation Quality · Live
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--foreground)", fontWeight: 400 }}>
              Ingredient Match Score
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
              Avg. fraction of user-owned ingredients that recipes require
            </p>
          </div>
          {/* Formula badge */}
          <div className="px-4 py-2.5 rounded-xl text-center flex-shrink-0 ml-6" style={{ background: "var(--muted)", border: "1px solid var(--border)", minWidth: "200px" }}>
            <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Formula</p>
            <div style={{ borderBottom: "1.5px solid var(--muted-foreground)", paddingBottom: "4px", marginBottom: "4px" }}>
              <p style={{ fontSize: "0.72rem", color: "var(--foreground)", fontWeight: 500 }}>Available Ingredients Used</p>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--foreground)", fontWeight: 500 }}>Total Ingredients in Recipe</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Big score */}
          <div className="col-span-2 flex flex-col justify-center items-center p-6 rounded-2xl" style={{ background: "var(--muted)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", color: "var(--primary)", lineHeight: 1 }}>84.2%</p>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>Current Average</p>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--foreground)", fontWeight: 600 }}>▲ 3.1% vs last week</span>
            </div>
          </div>

          {/* Per-category breakdown */}
          <div className="col-span-3 space-y-3">
            {[
              { category: "Italian",   score: 91, count: 2140 },
              { category: "Thai",      score: 86, count: 1830 },
              { category: "Healthy",   score: 88, count: 1560 },
              { category: "Mexican",   score: 79, count: 980  },
              { category: "Dessert",   score: 74, count: 4100 },
            ].map(({ category, score, count }) => {
              const color = score >= 88 ? "var(--foreground)" : score >= 80 ? "var(--primary)" : "var(--accent)";
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>{category}</span>
                      <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{count.toLocaleString()} recipes</span>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>{score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Radar chart + trend table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="p-5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Metric Overview</p>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>Current model snapshot</p>
          <MLRadarChart data={radarData} />
        </div>

        {/* Weekly history table */}
        <div className="p-5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Weekly History</p>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>7-week performance trend</p>
          <table className="w-full min-w-[560px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Week", "Acc.", "Prec.", "Recall", "F1"].map(h => (
                  <th key={h} className="pb-2 text-left" style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mlMetricsHistory.map((row, i) => (
                <tr key={row.week} style={{ borderBottom: i < mlMetricsHistory.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="py-2.5" style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 600 }}>{row.week}</td>
                  {[row.accuracy, row.precision, row.recall, row.f1].map((val, j) => (
                    <td key={j} className="py-2.5" style={{ fontSize: "0.82rem", color: val >= 88 ? "var(--foreground)" : val >= 83 ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: val >= 88 ? 600 : 400 }}>
                      {val}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="p-5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem", fontSize: "0.9rem" }}>System Alerts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: "warning", text: "24 reviews need moderation", icon: AlertTriangle },
            { type: "danger", text: "2 users reported this week", icon: Flag },
            { type: "success", text: "Model retrained successfully", icon: CheckCircle },
            { type: "success", text: "System health: 99.9%", icon: CheckCircle },
          ].map(({ type, text, icon: Icon }) => {
            const colors: Record<string, string> = { warning: "var(--accent)", danger: "#C0392B", success: "var(--foreground)" };
            return (
              <div key={text} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: `${colors[type]}12` }}>
                <Icon size={14} style={{ color: colors[type], marginTop: "0.15rem", flexShrink: 0 }} />
                <p style={{ fontSize: "0.78rem", color: "var(--foreground)", lineHeight: 1.4 }}>{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UsersTab({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSuspend(id: number) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
    setActiveMenu(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Search size={17} style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 outline-none"
            style={{ background: "transparent", color: "var(--foreground)", fontSize: "0.9rem" }}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "0.875rem" }}>
          <Filter size={16} />
          Filter
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden overflow-x-auto" style={{ borderColor: "var(--border)" }}>
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              {["User", "Status", "Recipes", "Reviews", "Joined", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left" style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", background: "var(--card)" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>{user.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{
                    background: user.status === "active" ? "rgba(0,0,0,0.04)" : "rgba(192,57,43,0.1)",
                    color: user.status === "active" ? "var(--foreground)" : "#C0392B",
                  }}>
                    {user.status === "active" ? "● Active" : "● Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>{user.recipes}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>{user.reviews}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{user.joined}</td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                      style={{ background: "var(--muted)" }}
                    >
                      <MoreVertical size={15} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                    {activeMenu === user.id && (
                      <div
                        className="absolute right-0 top-9 z-20 py-1 rounded-xl border shadow-lg min-w-36"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                      >
                        <button className="w-full flex items-center gap-2 px-3 py-2 hover:opacity-80" style={{ fontSize: "0.8rem", color: "var(--foreground)" }}>
                          <Eye size={14} /> View Profile
                        </button>
                        <button
                          onClick={() => toggleSuspend(user.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:opacity-80"
                          style={{ fontSize: "0.8rem", color: user.status === "active" ? "var(--accent)" : "var(--foreground)" }}
                        >
                          {user.status === "active" ? <><UserX size={14} /> Suspend</> : <><UserCheck size={14} /> Restore</>}
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 hover:opacity-80" style={{ fontSize: "0.8rem", color: "#C0392B" }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{filtered.length} of {MOCK_USERS.length} users</p>
    </div>
  );
}


function ReviewsTab() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  function approve(id: number) { setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r)); }
  function remove(id: number) { setReviews(prev => prev.filter(r => r.id !== id)); }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Reviews", value: reviews.length, icon: MessageSquare, color: "var(--primary)" },
          { label: "Flagged", value: reviews.filter(r => r.status === "flagged").length, icon: Flag, color: "var(--accent)" },
          { label: "Approved", value: reviews.filter(r => r.status === "approved").length, icon: CheckCircle, color: "var(--foreground)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--foreground)" }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="p-4 rounded-2xl border" style={{ background: "var(--card)", borderColor: review.status === "flagged" ? "rgba(192,57,43,0.25)" : "var(--border)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{review.user}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>on</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 500 }}>{review.recipe}</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold" style={{
                    background: review.status === "flagged" ? "rgba(192,57,43,0.1)" : "rgba(0,0,0,0.04)",
                    color: review.status === "flagged" ? "#C0392B" : "var(--foreground)",
                  }}>
                    {review.status}
                  </span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={12} fill={s <= review.rating ? "var(--accent)" : "none"} stroke={s <= review.rating ? "var(--accent)" : "var(--muted-foreground)"} />
                  ))}
                  <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginLeft: "0.4rem" }}>{review.date}</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--foreground)", lineHeight: 1.6 }}>{review.text}</p>
              </div>
            </div>
            {review.status === "flagged" && (
              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => approve(review.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.04)", color: "var(--foreground)" }}
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => remove(review.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: "rgba(192,57,43,0.1)", color: "#C0392B" }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
