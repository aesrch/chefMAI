import { useState } from "react";
import { Search, Filter, Clock, Star, X } from "lucide-react";
import { Recipe, RECIPES, CATEGORIES } from "../data/recipes";
import { RecipeDetail } from "./RecipeDetail";

interface SearchScreenProps {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  recipes?: Recipe[];
}

export function SearchScreen({ favorites, onToggleFavorite, recipes = [] }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [maxTime, setMaxTime] = useState(60);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const activeRecipes = recipes.length > 0 ? recipes : RECIPES;

  const filtered = activeRecipes.filter(r => {
    const matchQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(query.toLowerCase())) ||
      r.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchCat = selectedCategory === "All" || r.category === selectedCategory;
    const matchDiff = selectedDifficulty === "All" || r.difficulty === selectedDifficulty;
    const matchTime = r.time <= maxTime;
    return matchQuery && matchCat && matchDiff && matchTime;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Search header */}
      <div className="px-5 pt-5 pb-3 space-y-3">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>Find Recipes</h2>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <Search size={18} style={{ color: "var(--muted-foreground)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search recipes or ingredients..."
              className="flex-1 outline-none"
              style={{ background: "transparent", color: "var(--foreground)", fontSize: "0.9rem" }}
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all"
            style={{
              borderColor: showFilters ? "var(--primary)" : "var(--border)",
              background: showFilters ? "rgba(212,98,42,0.08)" : "var(--card)",
              color: showFilters ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-4 rounded-2xl space-y-4" style={{ background: "var(--muted)" }}>
            {/* Category pills */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: selectedCategory === cat ? "var(--primary)" : "var(--card)",
                      color: selectedCategory === cat ? "white" : "var(--foreground)",
                      fontSize: "0.78rem",
                      fontWeight: selectedCategory === cat ? 600 : 400,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>Difficulty</p>
              <div className="flex gap-2">
                {["All", "Easy", "Medium", "Hard"].map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className="px-4 py-1.5 rounded-full transition-all"
                    style={{
                      background: selectedDifficulty === d ? "var(--primary)" : "var(--card)",
                      color: selectedDifficulty === d ? "white" : "var(--foreground)",
                      fontSize: "0.78rem",
                      fontWeight: selectedDifficulty === d ? 600 : 400,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Max time */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                Max Time: {maxTime === 60 ? "Any" : `${maxTime}m`}
              </p>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={maxTime}
                onChange={e => setMaxTime(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--primary)" }}
              />
              <div className="flex justify-between">
                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>10m</span>
                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>60m+</span>
              </div>
            </div>
          </div>
        )}

        {/* Category scroll */}
        {!showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full flex-shrink-0 transition-all"
                style={{
                  background: selectedCategory === cat ? "var(--primary)" : "var(--muted)",
                  color: selectedCategory === cat ? "white" : "var(--foreground)",
                  fontSize: "0.8rem",
                  fontWeight: selectedCategory === cat ? 600 : 400,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-4xl">🔍</div>
            <p style={{ color: "var(--muted-foreground)", textAlign: "center" }}>No recipes match your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorited={favorites.includes(recipe.id)}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFavorited={favorites.includes(selectedRecipe.id)}
          onToggleFavorite={() => onToggleFavorite(selectedRecipe.id)}
        />
      )}
    </div>
  );
}

function RecipeCard({ recipe, isFavorited, onClick }: { recipe: Recipe; isFavorited: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex gap-4 p-3 rounded-2xl border text-left transition-all hover:opacity-90 hover:shadow-md"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <img src={recipe.image} alt={recipe.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--foreground)", fontWeight: 400, lineHeight: 1.3 }}>{recipe.title}</h3>
          {isFavorited && <Star size={14} fill="var(--accent)" stroke="none" className="flex-shrink-0 mt-0.5" />}
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>{recipe.author}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Clock size={12} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{recipe.time}m</span>
          </div>
          <span className="px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", fontSize: "0.7rem", color: "var(--foreground)" }}>{recipe.difficulty}</span>
          <div className="flex items-center gap-1">
            <Star size={11} fill="var(--accent)" stroke="none" />
            <span style={{ fontSize: "0.75rem", color: "var(--foreground)", fontWeight: 500 }}>{recipe.rating}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
