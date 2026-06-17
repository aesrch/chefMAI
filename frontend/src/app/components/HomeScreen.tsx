import { useState } from "react";
import {
  Star, Clock, Flame, TrendingUp, Users,
  ChevronRight, Sparkles, Heart, Bookmark, Award
} from "lucide-react";
import { RECIPES, CATEGORIES, Recipe } from "../data/recipes";
import { RecipeDetail } from "./RecipeDetail";

interface HomeScreenProps {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  recipes?: Recipe[];
}

const FEATURED_ID = 5; // Chocolate Lava Cake — highest likes

const SECTIONS = [
  {
    key: "toprated",
    label: "Top Rated",
    icon: Star,
    filter: (r: Recipe) => r.rating >= 4.8,
    sort: (a: Recipe, b: Recipe) => b.rating - a.rating,
  },
  {
    key: "quick",
    label: "Quick & Easy",
    icon: Clock,
    filter: (r: Recipe) => r.time <= 25 && r.difficulty === "Easy",
    sort: (a: Recipe, b: Recipe) => a.time - b.time,
  },
  {
    key: "community",
    label: "Community Picks",
    icon: Users,
    filter: (r: Recipe) => r.isUserSubmitted || r.reviews > 2000,
    sort: (a: Recipe, b: Recipe) => b.reviews - a.reviews,
  },
  {
    key: "trending",
    label: "Trending",
    icon: TrendingUp,
    filter: (r: Recipe) => r.likes > 5000,
    sort: (a: Recipe, b: Recipe) => b.likes - a.likes,
  },
];

export function HomeScreen({ favorites, onToggleFavorite, recipes = [] }: HomeScreenProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const activeRecipes = recipes.length > 0 ? recipes : RECIPES;

  const featured = activeRecipes.find(r => r.id === FEATURED_ID) ?? activeRecipes[0];

  function toggleLike(id: number) {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const categoryFiltered = activeCategory === "All"
    ? activeRecipes
    : activeRecipes.filter(r => r.category === activeCategory);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none", fontFamily: "var(--font-body)" }}>

      {/* Greeting banner */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Good morning
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400, lineHeight: 1.15 }}>
          What are we<br /><em style={{ color: "var(--primary)" }}>cooking today?</em>
        </h2>
      </div>

      {/* ── Featured Recipe ───────────────────────────────────── */}
      <div className="px-5 mb-5 flex-shrink-0">
        <div
          onClick={() => setSelectedRecipe(featured)}
          className="w-full relative rounded-3xl overflow-hidden cursor-pointer"
          style={{ height: "clamp(180px, 45vw, 260px)" }}
        >
          <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.88) 0%, rgba(28,16,9,0.2) 60%, transparent 100%)" }} />

          {/* Featured badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "var(--primary)" }}>
            <Award size={12} color="white" />
            <span style={{ color: "white", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Featured
            </span>
          </div>

          {/* Bookmark */}
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(featured.id); }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
          >
            <Bookmark
              size={16}
              fill={favorites.includes(featured.id) ? "var(--accent)" : "none"}
              stroke={favorites.includes(featured.id) ? "var(--accent)" : "white"}
            />
          </button>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)", color: "white", fontSize: "0.65rem", fontWeight: 600 }}>
                {featured.category}
              </span>
              <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)", color: "white", fontSize: "0.65rem" }}>
                {featured.difficulty}
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "white", fontWeight: 400, lineHeight: 1.1 }}>
              {featured.title}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star size={13} fill="var(--accent)" stroke="none" />
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", fontWeight: 600 }}>{featured.rating}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>({featured.reviews.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>{featured.time}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>Serves {featured.servings}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>{featured.calories} cal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category scroll ───────────────────────────────────── */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex gap-2 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full flex-shrink-0 transition-all"
              style={{
                background: activeCategory === cat ? "var(--primary)" : "var(--card)",
                color: activeCategory === cat ? "white" : "var(--foreground)",
                border: `1px solid ${activeCategory === cat ? "var(--primary)" : "var(--border)"}`,
                fontSize: "0.78rem",
                fontWeight: activeCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category-filtered grid ────────────────────────────── */}
      {activeCategory !== "All" && (
        <div className="px-5 mb-6 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryFiltered.map(recipe => (
              <CompactCard
                key={recipe.id}
                recipe={recipe}
                isLiked={likedIds.has(recipe.id)}
                isFavorited={favorites.includes(recipe.id)}
                onOpen={() => setSelectedRecipe(recipe)}
                onLike={() => toggleLike(recipe.id)}
                onFavorite={() => onToggleFavorite(recipe.id)}
              />
            ))}
          </div>
          {categoryFiltered.length === 0 && (
            <div className="text-center py-10">
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No recipes in this category yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Themed sections (shown when "All" is active) ─────── */}
      {activeCategory === "All" && SECTIONS.map(section => {
        const sectionRecipes = activeRecipes.filter(section.filter).sort(section.sort);
        if (sectionRecipes.length === 0) return null;
        const Icon = section.icon;

        return (
          <div key={section.key} className="mb-6 flex-shrink-0">
            {/* Section header */}
            <div className="flex items-center justify-between px-5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
                  <Icon size={13} style={{ color: "var(--primary)" }} />
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>{section.label}</span>
              </div>
              <button className="flex items-center gap-0.5" style={{ color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600 }}>
                See all <ChevronRight size={14} />
              </button>
            </div>

            {/* Horizontal scroll */}
            <div className="flex gap-3 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {sectionRecipes.map(recipe => (
                <HorizontalCard
                  key={recipe.id}
                  recipe={recipe}
                  isLiked={likedIds.has(recipe.id)}
                  isFavorited={favorites.includes(recipe.id)}
                  onOpen={() => setSelectedRecipe(recipe)}
                  onLike={() => toggleLike(recipe.id)}
                  onFavorite={() => onToggleFavorite(recipe.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── AI Recommendation strip ───────────────────────────── */}
      {activeCategory === "All" && (
        <div className="mx-5 mb-6 p-4 rounded-2xl flex items-center gap-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #8B3A18 100%)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Sparkles size={22} color="white" />
          </div>
          <div className="flex-1">
            <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>Chef MAI AI Recommendations</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
              Add your ingredients to get personalized matches
            </p>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
        </div>
      )}

      {/* ── All Recipes list ──────────────────────────────────── */}
      {activeCategory === "All" && (
        <div className="px-5 mb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>All Recipes</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{activeRecipes.length} total</span>
          </div>
          <div className="space-y-3">
            {[...activeRecipes].sort((a, b) => b.rating - a.rating).map(recipe => (
              <ListCard
                key={recipe.id}
                recipe={recipe}
                isLiked={likedIds.has(recipe.id)}
                isFavorited={favorites.includes(recipe.id)}
                onOpen={() => setSelectedRecipe(recipe)}
                onLike={() => toggleLike(recipe.id)}
                onFavorite={() => onToggleFavorite(recipe.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recipe detail modal */}
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

// ─── HORIZONTAL SCROLL CARD ──────────────────────────────────────────────────

function HorizontalCard({ recipe, isLiked, isFavorited, onOpen, onLike, onFavorite }: {
  recipe: Recipe; isLiked: boolean; isFavorited: boolean;
  onOpen: () => void; onLike: () => void; onFavorite: () => void;
}) {
  const diffColor = { Easy: "var(--foreground)", Medium: "var(--accent)", Hard: "var(--primary)" }[recipe.difficulty];

  return (
    <div className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div onClick={onOpen} className="w-full text-left cursor-pointer">
        <div className="relative">
          <img src={recipe.image} alt={recipe.title} className="w-full h-32 object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.5) 0%, transparent 60%)" }} />
          <div className="absolute top-2 left-2">
            <span className="px-1.5 py-0.5 rounded-full" style={{ background: diffColor, color: "white", fontSize: "0.6rem", fontWeight: 700 }}>
              {recipe.difficulty}
            </span>
          </div>
          {recipe.isUserSubmitted && (
            <div className="absolute top-2 right-2">
              <span className="px-1.5 py-0.5 rounded-full" style={{ background: "rgba(242,166,59,0.85)", color: "white", fontSize: "0.6rem", fontWeight: 600 }}>
                Community
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.2, fontWeight: 400 }}>
            {recipe.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={11} fill="var(--accent)" stroke="none" />
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--foreground)" }}>{recipe.rating}</span>
            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>·</span>
            <Clock size={10} style={{ color: "var(--muted-foreground)" }} />
            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{recipe.time}m</span>
          </div>
          {/* Calories + serves mini row */}
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>{recipe.calories} cal</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>·</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>Serves {recipe.servings}</span>
          </div>
        </div>
      </div>
      {/* Action row */}
      <div className="flex border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={onLike}
          className="flex-1 flex items-center justify-center py-2 transition-all hover:opacity-80"
        >
          <Heart size={14} fill={isLiked ? "#C0392B" : "none"} stroke={isLiked ? "#C0392B" : "var(--muted-foreground)"} />
        </button>
        <button
          onClick={onFavorite}
          className="flex-1 flex items-center justify-center py-2 border-l transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)" }}
        >
          <Bookmark size={14} fill={isFavorited ? "var(--accent)" : "none"} stroke={isFavorited ? "var(--accent)" : "var(--muted-foreground)"} />
        </button>
      </div>
    </div>
  );
}

// ─── 2-COLUMN COMPACT CARD ───────────────────────────────────────────────────

function CompactCard({ recipe, isLiked, isFavorited, onOpen, onLike, onFavorite }: {
  recipe: Recipe; isLiked: boolean; isFavorited: boolean;
  onOpen: () => void; onLike: () => void; onFavorite: () => void;
}) {
  const diffColor = { Easy: "var(--foreground)", Medium: "var(--accent)", Hard: "var(--primary)" }[recipe.difficulty];

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div onClick={onOpen} className="w-full text-left cursor-pointer">
        <div className="relative">
          <img src={recipe.image} alt={recipe.title} className="w-full h-32 object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.5) 0%, transparent 60%)" }} />
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full" style={{ background: diffColor, color: "white", fontSize: "0.6rem", fontWeight: 700 }}>
            {recipe.difficulty}
          </span>
        </div>
        <div className="p-3">
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", color: "var(--foreground)", lineHeight: 1.2, fontWeight: 400 }}>
            {recipe.title}
          </h4>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1">
              <Star size={11} fill="var(--accent)" stroke="none" />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--foreground)" }}>{recipe.rating}</span>
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>{recipe.time}m · {recipe.calories} cal</span>
          </div>
          {/* Serves row */}
          <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
            {recipe.reviews.toLocaleString()} reviews · Serves {recipe.servings}
          </p>
        </div>
      </div>
      <div className="flex border-t" style={{ borderColor: "var(--border)" }}>
        <button onClick={onLike} className="flex-1 flex items-center justify-center py-2">
          <Heart size={13} fill={isLiked ? "#C0392B" : "none"} stroke={isLiked ? "#C0392B" : "var(--muted-foreground)"} />
        </button>
        <button onClick={onFavorite} className="flex-1 flex items-center justify-center py-2 border-l" style={{ borderColor: "var(--border)" }}>
          <Bookmark size={13} fill={isFavorited ? "var(--accent)" : "none"} stroke={isFavorited ? "var(--accent)" : "var(--muted-foreground)"} />
        </button>
      </div>
    </div>
  );
}

// ─── LIST CARD ───────────────────────────────────────────────────────────────

function ListCard({ recipe, isLiked, isFavorited, onOpen, onLike, onFavorite }: {
  recipe: Recipe; isLiked: boolean; isFavorited: boolean;
  onOpen: () => void; onLike: () => void; onFavorite: () => void;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div onClick={onOpen} className="flex gap-3 flex-1 text-left min-w-0 cursor-pointer">
        <img src={recipe.image} alt={recipe.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-1.5 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: "0.6rem", fontWeight: 600 }}>
              {recipe.category}
            </span>
            {recipe.isUserSubmitted && (
              <span className="px-1.5 py-0.5 rounded-full" style={{ background: "rgba(242,166,59,0.15)", color: "var(--accent)", fontSize: "0.6rem", fontWeight: 600 }}>
                Community
              </span>
            )}
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--foreground)", fontWeight: 400, lineHeight: 1.2 }}>
            {recipe.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={11} fill="var(--accent)" stroke="none" />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--foreground)" }}>{recipe.rating}</span>
              <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>({recipe.reviews.toLocaleString()})</span>
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>·</span>
            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{recipe.time}m</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>·</span>
            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{recipe.calories} cal</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>·</span>
            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>Serves {recipe.servings}</span>
          </div>
          {/* Difficulty pill */}
          <div className="mt-1.5">
            <span className="px-2 py-0.5 rounded-full" style={{
              background: { Easy: "rgba(0,0,0,0.04)", Medium: "rgba(242,166,59,0.1)", Hard: "rgba(212,98,42,0.1)" }[recipe.difficulty],
              color: { Easy: "var(--foreground)", Medium: "var(--accent)", Hard: "var(--primary)" }[recipe.difficulty],
              fontSize: "0.65rem",
              fontWeight: 600,
            }}>
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={onLike}
          className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all hover:opacity-80"
          style={{ borderColor: isLiked ? "rgba(192,57,43,0.3)" : "var(--border)", background: isLiked ? "rgba(192,57,43,0.06)" : "var(--background)" }}
        >
          <Heart size={14} fill={isLiked ? "#C0392B" : "none"} stroke={isLiked ? "#C0392B" : "var(--muted-foreground)"} />
        </button>
        <button
          onClick={onFavorite}
          className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all hover:opacity-80"
          style={{ borderColor: isFavorited ? "rgba(242,166,59,0.3)" : "var(--border)", background: isFavorited ? "rgba(242,166,59,0.06)" : "var(--background)" }}
        >
          <Bookmark size={14} fill={isFavorited ? "var(--accent)" : "none"} stroke={isFavorited ? "var(--accent)" : "var(--muted-foreground)"} />
        </button>
      </div>
    </div>
  );
}
