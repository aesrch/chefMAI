import { useState, useRef } from "react";
import {
  Camera, Plus, X, Search, Clock, Users, Flame, Star, Heart,
  Bookmark, Sparkles, CheckCircle, AlertCircle, ArrowLeft, Scan,
  ChefHat, ThumbsUp, Upload, Filter, SlidersHorizontal,
} from "lucide-react";
import { RECIPES, Recipe } from "../data/recipes";

type Phase = "input" | "scanning" | "results" | "cooking";

interface MatchedRecipe extends Recipe {
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

interface KitchenScreenProps {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

// Simulated camera-detected ingredients for the photo scan
const SCAN_DETECTED = ["garlic", "butter", "lemon", "eggs", "flour", "pasta", "parmesan"];

// Smart pantry substitution formulas
const PANTRY_SUBS: Record<string, { formula: string; needs: string[] }> = {
  "Buttermilk":      { formula: "Milk + Lemon Juice (1 cup + 1 tbsp)", needs: ["milk", "lemon"] },
  "Heavy cream":     { formula: "Butter + Milk (⅓ cup + ¾ cup)", needs: ["butter", "milk"] },
  "Sour cream":      { formula: "Greek Yogurt 1:1", needs: ["yogurt"] },
  "Breadcrumbs":     { formula: "Toasted bread, blended", needs: ["bread"] },
  "Cake flour":      { formula: "All-purpose flour – 2 tbsp cornstarch", needs: ["flour"] },
  "Egg":             { formula: "3 tbsp aquafaba or flax egg", needs: [] },
};

const INGREDIENT_EMOJI: Record<string, string> = {
  garlic: "🧄", onion: "🧅", "olive oil": "🫒", butter: "🧈", eggs: "🥚",
  chicken: "🍗", pasta: "🍝", rice: "🍚", lemon: "🍋", tomatoes: "🍅",
  cheese: "🧀", flour: "🌾", parmesan: "🧀", milk: "🥛", sugar: "🍬",
  salt: "🧂", pepper: "🌶️", basil: "🌿", bread: "🍞", avocado: "🥑",
};

function getEmoji(ing: string) {
  const key = Object.keys(INGREDIENT_EMOJI).find(k => ing.toLowerCase().includes(k));
  return key ? INGREDIENT_EMOJI[key] : "🥘";
}

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

function getPantrySwap(missingName: string, userIngredients: string[]): string | null {
  for (const [subName, sub] of Object.entries(PANTRY_SUBS)) {
    if (missingName.toLowerCase().includes(subName.toLowerCase()) || subName.toLowerCase().includes(missingName.toLowerCase().split(" ")[0])) {
      if (sub.needs.length === 0) return sub.formula;
      if (sub.needs.every(n => userIngredients.some(ui => ui.toLowerCase().includes(n)))) return sub.formula;
    }
  }
  return null;
}

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

export function KitchenScreen({ favorites, onToggleFavorite }: KitchenScreenProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState("");
  const [results, setResults] = useState<MatchedRecipe[]>([]);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [thumbsUp, setThumbsUp] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [activeRecipe, setActiveRecipe] = useState<MatchedRecipe | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filterUnder30, setFilterUnder30] = useState(false);
  const [filterLowCal, setFilterLowCal] = useState(false);
  const [filterZeroMissing, setFilterZeroMissing] = useState(false);
  const [filterNoPrep, setFilterNoPrep] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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
    matched.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (DIFFICULTY_ORDER[a.difficulty] !== DIFFICULTY_ORDER[b.difficulty])
        return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      return b.rating - a.rating;
    });
    setResults(matched);
    setDismissed(new Set());
    setLiked(new Set());
    setThumbsUp(new Set());
    setActiveRecipe(null);
    setPhase("results");
  }

  // ─── SCANNING PHASE ───────────────────────────────────────────────────────
  if (phase === "scanning") {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 gap-6" style={{ fontFamily: "var(--font-body)" }}>
        <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-2" style={{ borderColor: "var(--primary)", background: "#0a0604" }}>
          <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop&auto=format" alt="Scanning" className="w-full h-full object-cover opacity-60" />
          <div className="absolute left-0 right-0 h-0.5" style={{ background: "var(--primary)", top: `${scanProgress}%`, boxShadow: "0 0 12px var(--primary)", transition: "top 0.45s ease" }} />
          {[["top-2 left-2", "border-t-2 border-l-2"], ["top-2 right-2", "border-t-2 border-r-2"], ["bottom-2 left-2", "border-b-2 border-l-2"], ["bottom-2 right-2", "border-b-2 border-r-2"]].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 ${border}`} style={{ borderColor: "var(--primary)" }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Scan size={36} style={{ color: "var(--primary)", opacity: 0.8 }} />
          </div>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{scanStage}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--primary)" }}>{scanProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${scanProgress}%`, background: "var(--primary)" }} />
          </div>
        </div>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)" }}>Scanning Ingredients</p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.3rem" }}>AI is identifying what's in your kitchen</p>
        </div>
      </div>
    );
  }

  // ─── COOKING PHASE ────────────────────────────────────────────────────────
  if (phase === "cooking" && activeRecipe) {
    return <CookingView recipe={activeRecipe} userIngredients={ingredients} onBack={() => setPhase("results")} onFavorite={() => onToggleFavorite(activeRecipe.id)} isFavorited={favorites.includes(activeRecipe.id)} />;
  }

  // ─── RESULTS PHASE ────────────────────────────────────────────────────────
  if (phase === "results") {
    const topPick = results[0] ?? null;
    const gridRecipes = results.filter(r => !dismissed.has(r.id));
    const filteredGrid = gridRecipes.filter(r => {
      if (filterUnder30 && r.time > 30) return false;
      if (filterLowCal && r.calories > 450) return false;
      if (filterZeroMissing && r.missingIngredients.length > 0) return false;
      if (filterNoPrep && r.prereqNote) return false;
      return true;
    });

    return (
      <div className="flex h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
        {/* Left sidebar filters */}
        <div className="w-52 flex-shrink-0 border-r overflow-y-auto py-5 px-4 space-y-5 hidden md:block" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground)" }}>Filters</span>
          </div>

          {[
            { label: "Under 30 Mins", sub: "Quick meals", value: filterUnder30, set: setFilterUnder30 },
            { label: "Low Calorie", sub: "≤ 450 cal", value: filterLowCal, set: setFilterLowCal },
            { label: "Zero Missing", sub: "Full pantry match", value: filterZeroMissing, set: setFilterZeroMissing },
            { label: "No Pre-cooking", sub: "No prereq steps", value: filterNoPrep, set: setFilterNoPrep },
          ].map(({ label, sub, value, set }) => (
            <label key={label} className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => set(!value)}
                className="w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: value ? "var(--primary)" : "var(--muted)", border: `1.5px solid ${value ? "var(--primary)" : "var(--border)"}` }}
              >
                {value && <span style={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
              </div>
              <div onClick={() => set(!value)}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>{label}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{sub}</p>
              </div>
            </label>
          ))}

          <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Your Ingredients</p>
            <div className="flex flex-wrap gap-1">
              {ingredients.map((ing, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "var(--foreground)", fontSize: "0.68rem", fontWeight: 500 }}>
                  {getEmoji(ing)} {ing}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main results area */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 border-b" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
            <button onClick={() => setPhase("input")} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80" style={{ background: "var(--muted)" }}>
              <ArrowLeft size={15} style={{ color: "var(--foreground)" }} />
            </button>
            <div className="flex-1">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)", fontWeight: 400 }}>
                Recipe Matches
              </h2>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                {filteredGrid.length} result{filteredGrid.length !== 1 ? "s" : ""} · sorted by best fit
              </p>
            </div>
            <button onClick={() => setPhase("input")} style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 600 }}>
              + Add More
            </button>
          </div>

          <div className="px-5 py-5 space-y-6">
            {/* Hero top pick */}
            {topPick && !dismissed.has(topPick.id) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--primary)" }}>
                    Chef MAI Top Pick
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--primary)", boxShadow: "0 0 0 1px var(--primary)" }}>
                  <div className="relative h-52">
                    <img src={topPick.image} alt={topPick.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,10,5,0.85) 0%, transparent 55%)" }} />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full" style={{ background: "var(--primary)" }}>
                      <span style={{ color: "white", fontSize: "0.68rem", fontWeight: 700 }}>
                        ✦ {Math.round(topPick.matchScore * 100)}% Match
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "white", fontWeight: 400, lineHeight: 1.2 }}>
                        {topPick.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>by {topPick.author}</span>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>⏱ {topPick.time}m</span>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>⭐ {topPick.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amber prep note banner */}
                  {topPick.prereqNote && (
                    <div className="flex items-start gap-2.5 px-4 py-3" style={{ background: "rgba(245,166,35,0.12)", borderBottom: "1px solid rgba(245,166,35,0.25)" }}>
                      <span style={{ fontSize: "0.9rem" }}>⚠️</span>
                      <div>
                        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.1rem" }}>Prep Note</p>
                        <p style={{ fontSize: "0.75rem", color: "#8a6100", lineHeight: 1.5 }}>{topPick.prereqNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Swap badges for missing ingredients */}
                  {topPick.missingIngredients.length > 0 && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                        Missing — Smart Swaps Available
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topPick.missingIngredients.map((ing, i) => {
                          const swap = getPantrySwap(ing, ingredients);
                          return (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: swap ? "rgba(0,0,0,0.04)" : "rgba(192,57,43,0.07)", border: `1px solid ${swap ? "rgba(0,0,0,0.12)" : "rgba(192,57,43,0.2)"}` }}>
                              <AlertCircle size={11} style={{ color: swap ? "var(--foreground)" : "#C0392B" }} />
                              <span style={{ fontSize: "0.72rem", color: swap ? "var(--foreground)" : "#C0392B", fontWeight: 600 }}>{ing}</span>
                              {swap && <span style={{ fontSize: "0.65rem", color: "var(--foreground)", background: "rgba(0,0,0,0.07)", padding: "1px 6px", borderRadius: "999px", fontWeight: 600 }}>Swap</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => { setActiveRecipe(topPick); setPhase("cooking"); }}
                      className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{ background: "var(--primary)", color: "white", fontWeight: 600, fontSize: "0.85rem" }}
                    >
                      <ChefHat size={15} /> Start Cooking
                    </button>
                    <button
                      onClick={() => onToggleFavorite(topPick.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                      style={{ background: favorites.includes(topPick.id) ? "rgba(245,166,35,0.15)" : "var(--muted)" }}
                    >
                      <Bookmark size={16} fill={favorites.includes(topPick.id) ? "var(--accent)" : "none"} stroke={favorites.includes(topPick.id) ? "var(--accent)" : "var(--muted-foreground)"} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recipe grid */}
            {filteredGrid.length > 1 && (
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
                  More Matches
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredGrid.slice(1).map(recipe => {
                    const matchPct = Math.round(recipe.matchScore * 100);
                    const isHovered = hoveredCard === recipe.id;
                    const hasPantrySwap = recipe.missingIngredients.some(m => getPantrySwap(m, ingredients));
                    return (
                      <div
                        key={recipe.id}
                        className="relative rounded-2xl overflow-hidden cursor-pointer"
                        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                        onMouseEnter={() => setHoveredCard(recipe.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => { setActiveRecipe(recipe); setPhase("cooking"); }}
                      >
                        <div className="relative h-36">
                          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,10,5,0.8) 0%, transparent 50%)" }} />
                          {hasPantrySwap && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(26,26,26,0.85)" }}>
                              <span style={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>Pantry Swap ✓</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.92)" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: matchPct >= 70 ? "var(--foreground)" : "var(--accent)" }}>{matchPct}%</span>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "white", lineHeight: 1.2 }}>{recipe.title}</p>
                          </div>

                          {/* Hover overlay with actions */}
                          {isHovered && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(26,26,26,0.72)", backdropFilter: "blur(2px)" }}>
                              <div className="flex gap-3">
                                <button
                                  onClick={e => { e.stopPropagation(); setLiked(prev => new Set([...prev, recipe.id])); }}
                                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                  style={{ background: liked.has(recipe.id) ? "rgba(224,106,78,0.85)" : "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
                                >
                                  <Heart size={15} fill={liked.has(recipe.id) ? "white" : "none"} stroke="white" />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); setThumbsUp(prev => new Set([...prev, recipe.id])); }}
                                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                  style={{ background: thumbsUp.has(recipe.id) ? "rgba(224,106,78,0.9)" : "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
                                >
                                  <ThumbsUp size={15} stroke="white" />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); setDismissed(prev => new Set([...prev, recipe.id])); }}
                                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                  style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
                                >
                                  <X size={15} stroke="white" />
                                </button>
                              </div>
                              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Click to cook</span>
                            </div>
                          )}
                        </div>
                        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>⏱ {recipe.time}m</span>
                            <span style={{ fontSize: "0.68rem", color: recipe.difficulty === "Easy" ? "var(--foreground)" : recipe.difficulty === "Medium" ? "var(--accent)" : "var(--primary)", fontWeight: 600 }}>{recipe.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={11} fill="var(--accent)" stroke="var(--accent)" />
                            <span style={{ fontSize: "0.68rem", color: "var(--foreground)", fontWeight: 600 }}>{recipe.rating}</span>
                          </div>
                        </div>
                        {/* Action row — always visible */}
                        <div className="flex border-t mx-1 mb-1" style={{ borderColor: "var(--border)" }}>
                          <button
                            onClick={e => { e.stopPropagation(); setDismissed(prev => new Set([...prev, recipe.id])); }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 transition-all hover:opacity-70"
                            style={{ color: "var(--muted-foreground)", fontSize: "0.68rem" }}
                          >
                            <X size={12} /> Skip
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setLiked(prev => { const n = new Set(prev); n.has(recipe.id) ? n.delete(recipe.id) : n.add(recipe.id); return n; }); }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 transition-all hover:opacity-80 border-l border-r"
                            style={{ borderColor: "var(--border)", color: liked.has(recipe.id) ? "var(--primary)" : "var(--muted-foreground)", fontSize: "0.68rem", fontWeight: liked.has(recipe.id) ? 600 : 400 }}
                          >
                            <Heart size={12} fill={liked.has(recipe.id) ? "var(--primary)" : "none"} stroke="currentColor" />
                            {liked.has(recipe.id) ? "Liked" : "Like"}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onToggleFavorite(recipe.id); }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 transition-all hover:opacity-80"
                            style={{ color: favorites.includes(recipe.id) ? "var(--accent)" : "var(--muted-foreground)", fontSize: "0.68rem", fontWeight: favorites.includes(recipe.id) ? 600 : 400 }}
                          >
                            <Bookmark size={12} fill={favorites.includes(recipe.id) ? "var(--accent)" : "none"} stroke="currentColor" />
                            {favorites.includes(recipe.id) ? "Saved" : "Save"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredGrid.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Filter size={36} style={{ color: "var(--muted-foreground)" }} />
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--foreground)" }}>No results for these filters</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Try removing some filters or adding more ingredients.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── INPUT PHASE (desktop split-screen) ──────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Left panel: drag-drop + camera + search */}
      <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 gap-5" style={{ scrollbarWidth: "none" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>
            What's in your <em style={{ color: "var(--primary)" }}>kitchen?</em>
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
            Upload a photo, scan your fridge, or type ingredients below
          </p>
        </div>

        {/* Drag-drop zone */}
        <div
          className="relative flex flex-col items-center justify-center gap-3 rounded-2xl transition-all"
          style={{
            border: `2px dashed ${isDragOver ? "var(--primary)" : "var(--border)"}`,
            background: isDragOver ? "rgba(224,106,78,0.04)" : "var(--card)",
            padding: "2.5rem 1.5rem",
            cursor: "pointer",
          }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); startScan(); }}
          onClick={startScan}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(224,106,78,0.1)" }}>
            <Upload size={24} style={{ color: "var(--primary)" }} />
          </div>
          <div className="text-center">
            <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9rem" }}>Drop a photo here</p>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>or click to upload — AI will detect your ingredients</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", padding: "3px 10px", borderRadius: "999px", background: "var(--muted)" }}>JPG</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", padding: "3px 10px", borderRadius: "999px", background: "var(--muted)" }}>PNG</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", padding: "3px 10px", borderRadius: "999px", background: "var(--muted)" }}>HEIC</span>
          </div>
        </div>

        {/* Camera scan button */}
        <button
          onClick={startScan}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(224,106,78,0.1)" }}>
            <Camera size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div className="text-left">
            <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.85rem" }}>Use Camera</p>
            <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Scan your fridge or pantry in real-time</p>
          </div>
          <Scan size={16} style={{ color: "var(--muted-foreground)", marginLeft: "auto" }} />
        </button>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <Search size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an ingredient, press Enter or comma..."
              className="flex-1 outline-none"
              style={{ background: "transparent", color: "var(--foreground)", fontSize: "0.88rem" }}
            />
          </div>
          <button
            onClick={() => addIngredient(inputValue)}
            disabled={!inputValue.trim()}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={18} color="white" />
          </button>
        </div>

        {/* Quick add */}
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "0.6rem" }}>
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {["garlic", "onion", "olive oil", "butter", "eggs", "chicken", "pasta", "rice", "lemon", "tomatoes", "cheese", "flour"].map(s => {
              const added = ingredients.some(i => i.toLowerCase() === s);
              return (
                <button
                  key={s}
                  onClick={() => addIngredient(s)}
                  disabled={added}
                  className="px-3 py-1.5 rounded-full transition-all hover:opacity-80 disabled:opacity-40"
                  style={{ background: added ? "rgba(0,0,0,0.05)" : "var(--card)", border: `1px solid ${added ? "rgba(0,0,0,0.12)" : "var(--border)"}`, color: "var(--foreground)", fontSize: "0.78rem" }}
                >
                  {getEmoji(s)} {added ? "✓ " : ""}{s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: virtual pantry + CTA */}
      <div className="w-64 flex-shrink-0 flex flex-col border-l py-6 px-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground)" }}>
            Virtual Pantry
          </p>
          {ingredients.length > 0 && (
            <button onClick={() => setIngredients([])} style={{ fontSize: "0.68rem", color: "var(--primary)" }}>Clear all</button>
          )}
        </div>

        {ingredients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--muted)" }}>
              <ChefHat size={20} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
              Add ingredients using the panel on the left
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: "none" }}>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl group" style={{ background: "var(--muted)" }}>
                <span style={{ fontSize: "1rem" }}>{getEmoji(ing)}</span>
                <span style={{ flex: 1, fontSize: "0.82rem", color: "var(--foreground)", fontWeight: 500 }}>{ing}</span>
                <button onClick={() => removeIngredient(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ingredient count summary */}
        {ingredients.length > 0 && (
          <div className="mt-3 mb-3 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)" }}>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} style={{ color: "var(--foreground)" }} />
              <p style={{ fontSize: "0.75rem", color: "var(--foreground)", fontWeight: 600 }}>{ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} ready</p>
            </div>
            <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
              Matching against {RECIPES.length} recipes
            </p>
          </div>
        )}

        <button
          onClick={findRecipes}
          disabled={ingredients.length === 0}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--primary)", color: "white", fontWeight: 600, fontSize: "0.9rem" }}
        >
          <Sparkles size={16} />
          Find Recipes
        </button>
      </div>
    </div>
  );
}

// ─── COOKING VIEW ─────────────────────────────────────────────────────────

interface CookingViewProps {
  recipe: MatchedRecipe;
  userIngredients: string[];
  onBack: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
}

function CookingView({ recipe, userIngredients, onBack, onFavorite, isFavorited }: CookingViewProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(0);

  function toggleIngredient(i: number) {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Left sticky checklist */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        {/* Recipe thumbnail header */}
        <div className="relative h-32 flex-shrink-0">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,10,5,0.85) 0%, transparent 40%)" }} />
          <div className="absolute bottom-2 left-3 right-3">
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "white", lineHeight: 1.2 }}>{recipe.title}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4" style={{ scrollbarWidth: "none" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
            Ingredients Checklist
          </p>

          <div className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => {
              const isChecked = checkedIngredients.has(i);
              const userHas = userIngredients.some(ui => ing.name.toLowerCase().includes(ui.toLowerCase()) || ui.toLowerCase().includes(ing.name.toLowerCase().split(" ")[0]));
              const pantrySwap = !userHas && ing.substitute ? getPantrySwap(ing.name, userIngredients) : null;
              const fromPantry = pantrySwap !== null;

              return (
                <div key={i}>
                  <button
                    onClick={() => toggleIngredient(i)}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-all hover:opacity-80"
                    style={{ background: isChecked ? "rgba(0,0,0,0.04)" : "transparent" }}
                  >
                    <div className="w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-all" style={{ background: isChecked ? "var(--primary)" : "var(--muted)", border: `1.5px solid ${isChecked ? "var(--primary)" : "var(--border)"}` }}>
                      {isChecked && <span style={{ color: "white", fontSize: "0.55rem" }}>✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "0.78rem", color: isChecked ? "var(--muted-foreground)" : "var(--foreground)", fontWeight: 500, textDecoration: isChecked ? "line-through" : "none", lineHeight: 1.3 }}>
                        {ing.name}
                      </p>
                      <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>{ing.amount}</p>
                    </div>
                    {userHas && <CheckCircle size={11} style={{ color: "var(--foreground)", flexShrink: 0, marginTop: "3px" }} />}
                  </button>

                  {/* Dashed "From Your Pantry" swap box */}
                  {fromPantry && (
                    <div className="ml-7 mt-1 mb-1.5 px-2.5 py-2 rounded-xl" style={{ border: "1.5px dashed rgba(0,0,0,0.15)", background: "rgba(0,0,0,0.02)" }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--foreground)", marginBottom: "0.15rem" }}>
                        From Your Pantry
                      </p>
                      <p style={{ fontSize: "0.68rem", color: "#4a7a4c", lineHeight: 1.4 }}>
                        {pantrySwap}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t px-4 py-3 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", textAlign: "center" }}>
            {checkedIngredients.size}/{recipe.ingredients.length} gathered
          </p>
          <div className="w-full h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(checkedIngredients.size / recipe.ingredients.length) * 100}%`, background: "var(--muted)" }} />
          </div>
        </div>
      </div>

      {/* Main: step-by-step instructions */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
          <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-all" style={{ background: "var(--muted)" }}>
            <ArrowLeft size={15} style={{ color: "var(--foreground)" }} />
          </button>
          <div className="flex-1">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--foreground)", fontWeight: 400 }}>Cooking Mode</h2>
            <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>Step {activeStep + 1} of {recipe.steps.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>⏱ {recipe.time}m</span>
            <button onClick={onFavorite} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-all" style={{ background: isFavorited ? "rgba(245,166,35,0.15)" : "var(--muted)" }}>
              <Bookmark size={14} fill={isFavorited ? "var(--accent)" : "none"} stroke={isFavorited ? "var(--accent)" : "var(--muted-foreground)"} />
            </button>
          </div>
        </div>

        {/* Prep note */}
        {recipe.prereqNote && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 px-4 py-3 rounded-2xl flex-shrink-0" style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)" }}>
            <span style={{ fontSize: "1rem" }}>⚠️</span>
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.15rem" }}>Before You Begin</p>
              <p style={{ fontSize: "0.78rem", color: "#8a6100", lineHeight: 1.5 }}>{recipe.prereqNote}</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            {recipe.steps.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className="flex-1 h-1.5 rounded-full cursor-pointer transition-all"
                style={{ background: i <= activeStep ? "var(--primary)" : "var(--muted)" }}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3" style={{ scrollbarWidth: "none" }}>
          {recipe.steps.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: isActive ? "rgba(245,166,35,0.08)" : isDone ? "rgba(0,0,0,0.02)" : "var(--card)",
                  border: `1.5px solid ${isActive ? "rgba(245,166,35,0.4)" : isDone ? "rgba(0,0,0,0.1)" : "var(--border)"}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: isActive ? "var(--accent)" : isDone ? "var(--primary)" : "var(--muted)",
                    color: isActive || isDone ? "white" : "var(--muted-foreground)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  {isActive && (
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "0.3rem" }}>
                      Current Step
                    </p>
                  )}
                  <p style={{ fontSize: isActive ? "0.9rem" : "0.82rem", color: isDone ? "var(--muted-foreground)" : "var(--foreground)", lineHeight: 1.65, fontWeight: isActive ? 500 : 400 }}>
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="flex-1 py-3 rounded-2xl transition-all hover:opacity-80 disabled:opacity-30"
            style={{ background: "var(--muted)", color: "var(--foreground)", fontWeight: 600, fontSize: "0.85rem" }}
          >
            ← Previous
          </button>
          {activeStep < recipe.steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="flex-1 py-3 rounded-2xl transition-all hover:opacity-90"
              style={{ background: "var(--primary)", color: "white", fontWeight: 600, fontSize: "0.85rem" }}
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-2xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "var(--muted)", color: "white", fontWeight: 600, fontSize: "0.85rem" }}
            >
              <ChefHat size={15} /> Finished! 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
