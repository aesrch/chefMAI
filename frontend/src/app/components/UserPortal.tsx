import { useState, useEffect } from "react";
import { Home, Search, UtensilsCrossed, Bookmark, User } from "lucide-react";
import { HomeScreen } from "./HomeScreen";
import { SearchScreen } from "./SearchScreen";
import { KitchenScreen } from "./KitchenScreen";
import { FavoritesScreen } from "./FavoritesScreen";
import { ProfileScreen } from "./ProfileScreen";
import { Recipe } from "../data/recipes";

const API_BASE = "http://localhost:8080";

type Tab = "home" | "search" | "kitchen" | "favorites" | "profile";

interface UserPortalProps {
  onLogout: () => void;
}

export function backendToFrontendRecipe(r: any, idx: number): Recipe {
  const numericId = parseInt(r.rcpID.replace(/\D/g, ""), 10) || (idx + 100);
  return {
    id: numericId,
    title: r.name,
    author: "Chef MAI",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
    image: r.img ? (r.img.startsWith("http") ? r.img : `${API_BASE}/images/${r.img}`) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    category: r.genre || "All",
    tags: [r.genre || "General"],
    time: 30,
    difficulty: "Medium",
    rating: 4.5,
    reviews: 120,
    likes: 340,
    description: r.description || "",
    ingredients: r.ingredients.map((name: string, i: number) => ({
      name: name.trim(),
      amount: r.amount[i] ? r.amount[i].trim() : "1 unit",
    })),
    steps: r.steps.map((step: string) => step.trim()),
    calories: 450,
    servings: 2,
    isUserSubmitted: r.accID !== "admin",
  };
}

export function UserPortal({ onLogout }: UserPortalProps) {
  const [tab, setTab] = useState<Tab>("home");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await fetch(`${API_BASE}/recipes/all`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((r: any, idx: number) => backendToFrontendRecipe(r, idx));
          setRecipes(mapped);
        }
      } catch (err) {
        console.error("Failed to load recipes from database, using hardcoded fallback templates.", err);
      }
    }
    loadRecipes();
  }, []);

  function toggleFavorite(id: number) {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  const navItems: { key: Tab; icon: typeof Home; label: string }[] = [
    { key: "home",      icon: Home,            label: "Discover" },
    { key: "search",    icon: Search,          label: "Search" },
    { key: "kitchen",   icon: UtensilsCrossed, label: "Kitchen" },
    { key: "favorites", icon: Bookmark,        label: "Saved" },
    { key: "profile",   icon: User,            label: "Profile" },
  ];

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)" }}>Chef MAI</span>
          <span style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", alignSelf: "flex-end", marginBottom: "2px" }}>The MiniChef AI</span>
        </div>
        <div className="flex items-center gap-2">
          {favorites.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(242,166,59,0.15)", color: "var(--accent)" }}>
              ★ {favorites.length}
            </span>
          )}
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
            alt="Profile"
            className="w-8 h-8 rounded-xl object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "home"      && <HomeScreen    recipes={recipes} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {tab === "search"    && <SearchScreen  recipes={recipes} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {tab === "kitchen"   && <KitchenScreen favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {tab === "favorites" && <FavoritesScreen recipes={recipes} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {tab === "profile"   && <ProfileScreen onLogout={onLogout} />}
      </div>

      {/* Bottom nav */}
      <div className="border-t px-1 py-1 flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="flex">
          {navItems.map(({ key, icon: Icon, label }) => {
            const isActive = tab === key;
            const isKitchen = key === "kitchen";
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all"
                style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {isKitchen ? (
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center -mt-5 shadow-lg border-4 transition-all"
                    style={{
                      background: isActive ? "var(--primary)" : "var(--card)",
                      borderColor: "var(--background)",
                    }}
                  >
                    <Icon size={19} color={isActive ? "white" : "var(--muted-foreground)"} />
                  </div>
                ) : (
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span style={{ fontSize: "0.6rem", fontWeight: isActive ? 600 : 400, marginTop: isKitchen ? "2px" : 0 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
