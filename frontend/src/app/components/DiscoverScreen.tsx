import { useState, useRef } from "react";
import {
  Camera, Plus, X, Search, ChevronDown, ChevronUp,
  Clock, Users, Flame, Star, Heart, Bookmark, SkipForward,
  Sparkles, CheckCircle, AlertCircle, ArrowLeft, Scan, ChefHat
} from "lucide-react";
import { RECIPES, Recipe } from "../data/recipes";

type Phase = "input" | "scanning" | "results";

interface MatchedRecipe extends Recipe {
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

interface DiscoverScreenProps {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

// Simulated camera-detected ingredients for the photo scan
const SCAN_DETECTED = ["garlic", "butter", "lemon", "eggs", "flour", "pasta", "parmesan"];

function computeMatch(recipe: Recipe, userIngredients: string[]): { score: number; matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];
  for (const ri of recipe.ingredients) {
    const found = userIngredients.some(
      ui => ri.name.toLowerCase().includes(ui.toLowerCase()) || ui.toLowerCase().includes(ri.name.toLowerCase().split(" ")[0])
    );
    if (found) matched.push(ri.name);
    else missing.push(ri.name);
  }
  return { score: matched.length / recipe.ingredients.length, matched, missing };
}

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

export function DiscoverScreen({ favorites, onToggleFavorite }: DiscoverScreenProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState("");
  const [results, setResults] = useState<MatchedRecipe[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [likeAnim, setLikeAnim] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addIngredient(name: string) {
    const trimmed = name.trim();
    if (!trimmed || ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) return;
    setIngredients(prev => [...prev, trimmed]);
    setInputValue("");
    inputRef.current?.focus();
  }

  function removeIngredient(idx: number) {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(inputValue);
    }
  }

  function startScan() {
    setPhase("scanning");
    setScanProgress(0);
    setScanStage("Initializing camera...");

    const stages = [
      { pct: 15, label: "Detecting objects..." },
      { pct: 35, label: "Identifying ingredients..." },
      { pct: 55, label: "Cross-referencing pantry data..." },
      { pct: 75, label: "Running Bayesian classification..." },
      { pct: 95, label: "Finalizing ingredient list..." },
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (i < stages.length) {
        setScanProgress(stages[i].pct);
        setScanStage(stages[i].label);
        i++;
      } else {
        clearInterval(tick);
        setScanProgress(100);
        setScanStage("Scan complete!");
        setTimeout(() => {
          setIngredients(prev => {
            const merged = [...prev];
            for (const d of SCAN_DETECTED) {
              if (!merged.some(x => x.toLowerCase() === d)) merged.push(d);
            }
            return merged;
          });
          setPhase("input");
        }, 700);
      }
    }, 480);
  }

  function findRecipes() {
    if (ingredients.length === 0) return;
    const matched: MatchedRecipe[] = RECIPES.map(r => {
      const { score, matched, missing } = computeMatch(r, ingredients);
      return { ...r, matchScore: score, matchedIngredients: matched, missingIngredients: missing };
    });
    // Sort: best match first, then by difficulty (easiest first), then by rating
    matched.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (DIFFICULTY_ORDER[a.difficulty] !== DIFFICULTY_ORDER[b.difficulty])
        return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      return b.rating - a.rating;
    });
    setResults(matched);
    setSkipped(new Set());
    setLiked(new Set());
    setExpanded(null);
    setPhase("results");
  }

  function handleLike(id: number) {
    setLiked(prev => new Set([...prev, id]));
    setLikeAnim(id);
    setTimeout(() => setLikeAnim(null), 800);
  }

  function handleSkip(id: number) {
    setSkipped(prev => new Set([...prev, id]));
  }

  const visibleResults = results.filter(r => !skipped.has(r.id));

  // ─── SCANNING PHASE ───────────────────────────────────────────────────────
  if (phase === "scanning") {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 gap-6" style={{ fontFamily: "var(--font-body)" }}>
        <div
          className="relative w-64 h-64 rounded-3xl overflow-hidden border-2"
          style={{ borderColor: "var(--primary)", background: "#0a0604" }}
        >
          <img
            src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop&auto=format"
            alt="Scanning"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Animated scan line */}
          <div
            className="absolute left-0 right-0 h-0.5"
            style={{
              background: "var(--primary)",
              top: `${scanProgress}%`,
              boxShadow: "0 0 12px var(--primary)",
              transition: "top 0.45s ease",
            }}
          />
          {/* Corner markers */}
          {[["top-2 left-2", "border-t-2 border-l-2"], ["top-2 right-2", "border-t-2 border-r-2"],
            ["bottom-2 left-2", "border-b-2 border-l-2"], ["bottom-2 right-2", "border-b-2 border-r-2"]
          ].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 ${border}`} style={{ borderColor: "var(--primary)" }} />
          ))}
          {/* Center target */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Scan size={36} style={{ color: "var(--primary)", opacity: 0.8 }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{scanStage}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--primary)" }}>{scanProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${scanProgress}%`, background: "var(--primary)" }}
            />
          </div>
        </div>

        <div className="text-center">
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)" }}>
            Scanning Ingredients
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.3rem" }}>
            AI is identifying what's in your kitchen
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ───────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setPhase("input")}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--muted)" }}
            >
              <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
            </button>
            <div className="flex-1">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--foreground)", fontWeight: 400 }}>
                Recommended Recipes
              </h2>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                {visibleResults.length} matches · sorted by best fit + easiest first
              </p>
            </div>
          </div>

          {/* Ingredient chips summary */}
          <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl" style={{ background: "var(--muted)" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 600, alignSelf: "center" }}>Your ingredients:</span>
            {ingredients.map((ing, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full" style={{ background: "var(--card)", color: "var(--foreground)", fontSize: "0.72rem", fontWeight: 500 }}>
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3" style={{ scrollbarWidth: "none" }}>
          {visibleResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ChefHat size={40} style={{ color: "var(--muted-foreground)" }} />
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)" }}>All recipes skipped</p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Go back and try different ingredients.</p>
              <button onClick={() => setPhase("input")} className="px-6 py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "white", fontWeight: 600 }}>
                Back to Input
              </button>
            </div>
          ) : visibleResults.map((recipe, idx) => (
            <RecipeResultCard
              key={recipe.id}
              recipe={recipe}
              rank={idx}
              isExpanded={expanded === recipe.id}
              isLiked={liked.has(recipe.id)}
              isFavorited={favorites.includes(recipe.id)}
              likeAnimating={likeAnim === recipe.id}
              onToggleExpand={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
              onLike={() => handleLike(recipe.id)}
              onSkip={() => handleSkip(recipe.id)}
              onFavorite={() => onToggleFavorite(recipe.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── INPUT PHASE ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>
              What's in your<br /><em style={{ color: "var(--primary)" }}>kitchen?</em>
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.3rem" }}>
              Add ingredients to get AI-matched recipes
            </p>
          </div>
          <button
            onClick={startScan}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border transition-all hover:opacity-80"
            style={{ borderColor: "var(--primary)", background: "rgba(212,98,42,0.06)" }}
          >
            <Camera size={22} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 600 }}>Take a Pic!</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4" style={{ scrollbarWidth: "none" }}>
        {/* Input field */}
        <div className="flex gap-2">
          <div
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <Search size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. garlic, pasta, eggs..."
              className="flex-1 outline-none"
              style={{ background: "transparent", color: "var(--foreground)", fontSize: "0.9rem" }}
            />
          </div>
          <button
            onClick={() => addIngredient(inputValue)}
            disabled={!inputValue.trim()}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={20} color="white" />
          </button>
        </div>

        <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
          Press <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", fontSize: "0.68rem" }}>Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", fontSize: "0.68rem" }}>,</kbd> to add each ingredient
        </p>

        {/* Ingredient chips */}
        {ingredients.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Added ({ingredients.length})
              </p>
              <button onClick={() => setIngredients([])} style={{ fontSize: "0.72rem", color: "var(--primary)" }}>Clear all</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  <CheckCircle size={13} style={{ color: "var(--foreground)" }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--foreground)", fontWeight: 500 }}>{ing}</span>
                  <button onClick={() => removeIngredient(i)} className="ml-0.5">
                    <X size={13} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested quick-add */}
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {["garlic", "onion", "olive oil", "butter", "eggs", "chicken", "pasta", "rice", "lemon", "tomatoes", "cheese", "flour"].map(s => (
              <button
                key={s}
                onClick={() => addIngredient(s)}
                disabled={ingredients.some(i => i.toLowerCase() === s)}
                className="px-3 py-1.5 rounded-full transition-all hover:opacity-80 disabled:opacity-30"
                style={{
                  background: ingredients.some(i => i.toLowerCase() === s) ? "var(--muted)" : "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "0.78rem",
                }}
              >
                {ingredients.some(i => i.toLowerCase() === s) ? "✓ " : "+ "}{s}
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        {ingredients.length === 0 && (
          <div className="p-4 rounded-2xl space-y-3" style={{ background: "var(--muted)" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--foreground)" }}>How Chef MAI works</p>
            {[
              { step: "1", text: "Add ingredients you have at home" },
              { step: "2", text: "AI uses Bayesian learning to match recipes" },
              { step: "3", text: "Top result = easiest with most ingredients matched" },
              { step: "4", text: "Missing ingredients shown for each recipe" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "var(--primary)", color: "white", fontSize: "0.7rem", fontWeight: 700 }}>
                  {step}
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2 flex-shrink-0">
        <button
          onClick={findRecipes}
          disabled={ingredients.length === 0}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--primary)", color: "white", fontWeight: 600, fontSize: "1rem" }}
        >
          <Sparkles size={18} />
          Find Recipes ({ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
}

// ─── RECIPE RESULT CARD ───────────────────────────────────────────────────

interface RecipeResultCardProps {
  recipe: MatchedRecipe;
  rank: number;
  isExpanded: boolean;
  isLiked: boolean;
  isFavorited: boolean;
  likeAnimating: boolean;
  onToggleExpand: () => void;
  onLike: () => void;
  onSkip: () => void;
  onFavorite: () => void;
}

function RecipeResultCard({
  recipe, rank, isExpanded, isLiked, isFavorited, likeAnimating,
  onToggleExpand, onLike, onSkip, onFavorite,
}: RecipeResultCardProps) {
  const matchPct = Math.round(recipe.matchScore * 100);
  const difficultyColor = { Easy: "var(--foreground)", Medium: "var(--accent)", Hard: "var(--primary)" }[recipe.difficulty];

  return (
    <div
      className="rounded-3xl overflow-hidden border transition-all"
      style={{
        background: "var(--card)",
        borderColor: rank === 0 ? "var(--primary)" : "var(--border)",
        boxShadow: rank === 0 ? "0 0 0 1px var(--primary)" : "none",
      }}
    >
      {/* Top pick banner */}
      {rank === 0 && (
        <div className="flex items-center gap-2 px-4 py-2" style={{ background: "var(--primary)" }}>
          <Sparkles size={13} color="white" />
          <span style={{ color: "white", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Best Match · Easiest to Cook
          </span>
        </div>
      )}

      {/* Card image + overlay */}
      <div className="relative">
        <img src={recipe.image} alt={recipe.title} className="w-full h-44 object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.75) 0%, transparent 55%)" }} />

        {/* Match badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.92)" }}>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: matchPct >= 70 ? "var(--foreground)" : matchPct >= 40 ? "var(--accent)" : "var(--primary)" }}
          />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--foreground)" }}>{matchPct}% match</span>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "white", fontWeight: 400, lineHeight: 1.2 }}>
            {recipe.title}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginTop: "0.2rem" }}>by {recipe.author}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { icon: Flame, label: recipe.difficulty, color: difficultyColor },
          { icon: Clock, label: `${recipe.time}m`, color: "var(--muted-foreground)" },
          { icon: Flame, label: `${recipe.calories} cal`, color: "var(--muted-foreground)" },
          { icon: Star, label: recipe.rating.toString(), color: "var(--accent)" },
          { icon: Users, label: `${recipe.servings} serv`, color: "var(--muted-foreground)" },
        ].map(({ icon: Icon, label, color }, i) => (
          <div key={i} className="flex flex-col items-center py-2.5 gap-0.5" style={{ borderRight: i < 4 ? "1px solid var(--border)" : "none" }}>
            <Icon size={13} style={{ color }} />
            <span style={{ fontSize: "0.68rem", color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Ingredients match status */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ingredients</p>
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
              <div className="h-full rounded-full" style={{ width: `${matchPct}%`, background: matchPct >= 70 ? "var(--foreground)" : matchPct >= 40 ? "var(--accent)" : "var(--primary)" }} />
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{recipe.matchedIngredients.length}/{recipe.ingredients.length}</span>
          </div>
        </div>

        {/* Have */}
        {recipe.matchedIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {recipe.matchedIngredients.map((ing, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.04)", fontSize: "0.7rem", color: "var(--foreground)" }}>
                <CheckCircle size={10} /> {ing}
              </span>
            ))}
          </div>
        )}

        {/* Missing */}
        {recipe.missingIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.missingIngredients.map((ing, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(192,57,43,0.08)", fontSize: "0.7rem", color: "#C0392B" }}>
                <AlertCircle size={10} /> {ing}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 transition-all hover:opacity-80"
        style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 600 }}
      >
        {isExpanded ? <><ChevronUp size={14} /> Hide Instructions</> : <><ChevronDown size={14} /> View Step-by-Step</>}
      </button>

      {/* Expanded: steps */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border)" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: "0.75rem", marginBottom: "0.75rem" }}>
            Cooking Instructions
          </p>
          <div className="space-y-3">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: "var(--primary)", color: "white", fontSize: "0.7rem", fontWeight: 700 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.65 }}>{step}</p>
              </div>
            ))}
          </div>

          {/* Smart substitution note */}
          {recipe.missingIngredients.length > 0 && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(242,166,59,0.08)", border: "1px solid rgba(242,166,59,0.25)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)", marginBottom: "0.3rem" }}>💡 Smart Substitutions</p>
              {recipe.ingredients
                .filter(ri => recipe.missingIngredients.includes(ri.name) && ri.substitute)
                .map((ri, i) => (
                  <p key={i} style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--foreground)" }}>{ri.name}</strong> → {ri.substitute}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={onSkip}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 transition-all hover:opacity-80"
          style={{ color: "var(--muted-foreground)", fontSize: "0.82rem", fontWeight: 500, borderRight: "1px solid var(--border)" }}
        >
          <SkipForward size={16} /> Skip
        </button>
        <button
          onClick={onLike}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 transition-all hover:opacity-80"
          style={{
            color: isLiked ? "var(--foreground)" : "var(--muted-foreground)",
            fontSize: "0.82rem",
            fontWeight: isLiked ? 600 : 500,
            borderRight: "1px solid var(--border)",
            transform: likeAnimating ? "scale(1.15)" : "scale(1)",
            transition: "all 0.2s ease",
          }}
        >
          <Heart size={16} fill={isLiked ? "var(--foreground)" : "none"} stroke={isLiked ? "var(--foreground)" : "currentColor"} />
          {isLiked ? "Liked!" : "Like"}
        </button>
        <button
          onClick={onFavorite}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 transition-all hover:opacity-80"
          style={{
            color: isFavorited ? "var(--accent)" : "var(--muted-foreground)",
            fontSize: "0.82rem",
            fontWeight: isFavorited ? 600 : 500,
          }}
        >
          <Bookmark size={16} fill={isFavorited ? "var(--accent)" : "none"} stroke={isFavorited ? "var(--accent)" : "currentColor"} />
          {isFavorited ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
