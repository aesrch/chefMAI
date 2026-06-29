import { Bookmark, Clock, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { RECIPES } from "../data/recipes";
import { RecipeDetail } from "./RecipeDetail";

interface FavoritesScreenProps {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  recipes?: typeof RECIPES;
}

export function FavoritesScreen({ favorites, onToggleFavorite, recipes = [] }: FavoritesScreenProps) {
  const activeRecipes = recipes.length > 0 ? recipes : RECIPES;
  const [selectedRecipe, setSelectedRecipe] = useState<typeof RECIPES[0] | null>(null);
  const savedRecipes = activeRecipes.filter(r => favorites.includes(r.id));

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>Saved Recipes</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{savedRecipes.length} bookmarked</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(242,166,59,0.1)" }}>
            <Bookmark size={18} style={{ color: "var(--accent)" }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: "none" }}>
        {savedRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--muted)" }}>
              <Bookmark size={32} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div className="text-center">
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--foreground)" }}>No saved recipes yet</p>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: "0.4rem" }}>
                Swipe up or tap the bookmark icon to save recipes
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedRecipes.map(recipe => (
              <div
                key={recipe.id}
                className="rounded-2xl overflow-hidden border relative"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <button onClick={() => setSelectedRecipe(recipe)} className="w-full text-left">
                  <div className="relative">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-36 object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.5) 0%, transparent 60%)" }} />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.85)", color: "var(--foreground)", fontWeight: 500 }}>
                        {recipe.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--foreground)", lineHeight: 1.3 }}>{recipe.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock size={11} style={{ color: "var(--primary)" }} />
                      <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{recipe.time}m</span>
                      <Star size={11} fill="var(--accent)" stroke="none" />
                      <span style={{ fontSize: "0.72rem", color: "var(--foreground)", fontWeight: 500 }}>{recipe.rating}</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onToggleFavorite(recipe.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  <Trash2 size={13} style={{ color: "#C0392B" }} />
                </button>
              </div>
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
