import { useState, useRef } from "react";
import { Heart, X, Star, Clock, ChefHat, Camera, Flame } from "lucide-react";
import { Recipe, RECIPES } from "../data/recipes";
import { RecipeDetail } from "./RecipeDetail";

interface SwipeScreenProps {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

type SwipeDir = "left" | "right" | "up" | null;

export function SwipeScreen({ favorites, onToggleFavorite }: SwipeScreenProps) {
  const [deck, setDeck] = useState<Recipe[]>(RECIPES);
  const [gone, setGone] = useState<Set<number>>(new Set());
  const [swipeDir, setSwipeDir] = useState<SwipeDir>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const activeCards = deck.filter(r => !gone.has(r.id));
  const topCard = activeCards[0];

  function dismiss(dir: SwipeDir) {
    if (!topCard) return;
    if (dir === "up") onToggleFavorite(topCard.id);
    setGone(prev => new Set([...prev, topCard.id]));
    setSwipeDir(null);
    setDragOffset({ x: 0, y: 0 });
  }

  function onMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setDragOffset({ x: dx, y: dy });
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeDir(dx > 30 ? "right" : dx < -30 ? "left" : null);
    } else {
      setSwipeDir(dy < -40 ? "up" : null);
    }
  }

  function onMouseUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (swipeDir) dismiss(swipeDir);
    else setDragOffset({ x: 0, y: 0 });
    setSwipeDir(null);
  }

  const rotation = dragOffset.x * 0.08;
  const opacity = Math.max(0, 1 - Math.abs(dragOffset.x) / 300);

  const showLike = swipeDir === "right";
  const showPass = swipeDir === "left";
  const showFav = swipeDir === "up";

  if (cameraMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <div className="w-full max-w-sm">
          <div
            className="aspect-square rounded-3xl flex flex-col items-center justify-center border-2 border-dashed"
            style={{ borderColor: "var(--primary)", background: "var(--muted)" }}
          >
            <Camera size={48} style={{ color: "var(--primary)" }} />
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--foreground)", marginTop: "1rem" }}>
              Snap Your Ingredients
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", textAlign: "center", marginTop: "0.5rem", maxWidth: "240px" }}>
              Take a photo and we'll suggest recipes based on what's in your kitchen
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              className="py-3 rounded-2xl"
              style={{ background: "var(--primary)", color: "white", fontWeight: 600 }}
            >
              Take Photo
            </button>
            <button
              onClick={() => setCameraMode(false)}
              className="py-3 rounded-2xl border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--muted)" }}>
          <ChefHat size={36} style={{ color: "var(--primary)" }} />
        </div>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)" }}>You've seen them all!</p>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Check your favorites or reset the deck.</p>
        </div>
        <button
          onClick={() => { setGone(new Set()); setDeck(RECIPES); }}
          className="px-8 py-3 rounded-2xl"
          style={{ background: "var(--primary)", color: "white", fontWeight: 600 }}
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full select-none" style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--foreground)", fontWeight: 400 }}>Discover</h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{activeCards.length} recipes left</p>
        </div>
        <button
          onClick={() => setCameraMode(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <Camera size={18} style={{ color: "var(--primary)" }} />
        </button>
      </div>

      {/* Swipe hints */}
      <div className="flex justify-center gap-6 py-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(192,57,43,0.1)" }}>
            <X size={12} style={{ color: "#C0392B" }} />
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Pass</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)" }}>
            <Heart size={12} style={{ color: "var(--primary)" }} />
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Like</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(242,166,59,0.15)" }}>
            <Star size={12} style={{ color: "var(--accent)" }} />
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Favorite</span>
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 flex items-center justify-center relative px-5 pb-4">
        {/* Background cards */}
        {activeCards.slice(1, 3).map((card, idx) => (
          <div
            key={card.id}
            className="absolute w-full max-w-xs rounded-3xl overflow-hidden"
            style={{
              transform: `scale(${1 - (idx + 1) * 0.04}) translateY(${(idx + 1) * 12}px)`,
              zIndex: 10 - idx,
              boxShadow: "0 4px 20px rgba(28,16,9,0.08)",
            }}
          >
            <img src={card.image} alt={card.title} className="w-full h-96 object-cover" />
          </div>
        ))}

        {/* Top card */}
        {topCard && (
          <div
            className="absolute w-full max-w-xs rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
              zIndex: 20,
              boxShadow: "0 8px 40px rgba(28,16,9,0.15)",
              transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Swipe indicators */}
            {showLike && (
              <div className="absolute top-8 left-6 z-30 px-4 py-2 rounded-xl border-2 rotate-[-15deg]" style={{ borderColor: "var(--primary)", background: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.1rem" }}>LIKE ♥</span>
              </div>
            )}
            {showPass && (
              <div className="absolute top-8 right-6 z-30 px-4 py-2 rounded-xl border-2 rotate-[15deg]" style={{ borderColor: "#C0392B", background: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "#C0392B", fontWeight: 700, fontSize: "1.1rem" }}>PASS ✕</span>
              </div>
            )}
            {showFav && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl border-2" style={{ borderColor: "var(--accent)", background: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.1rem" }}>FAVORITE ★</span>
              </div>
            )}

            <img src={topCard.image} alt={topCard.title} className="w-full h-96 object-cover" style={{ opacity }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.85) 0%, transparent 55%)" }} />

            {/* Card info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                  {topCard.category}
                </span>
                {topCard.isUserSubmitted && (
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(242,166,59,0.7)", color: "white" }}>Community</span>
                )}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "white", fontWeight: 400, marginBottom: "0.5rem" }}>{topCard.title}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock size={13} color="rgba(255,255,255,0.7)" />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>{topCard.time}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={13} color="rgba(255,255,255,0.7)" />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>{topCard.difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={13} fill="var(--accent)" stroke="none" />
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>{topCard.rating}</span>
                </div>
              </div>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setSelectedRecipe(topCard)}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(4px)" }}
              >
                View Full Recipe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-5 pb-6">
        <button
          onClick={() => dismiss("left")}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: "white", border: "2px solid rgba(192,57,43,0.2)" }}
        >
          <X size={22} style={{ color: "#C0392B" }} />
        </button>
        <button
          onClick={() => dismiss("up")}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{ background: "var(--accent)" }}
        >
          <Star size={26} color="white" fill="white" />
        </button>
        <button
          onClick={() => dismiss("right")}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: "white", border: "2px solid rgba(0,0,0,0.08)" }}
        >
          <Heart size={22} style={{ color: "var(--primary)" }} />
        </button>
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
