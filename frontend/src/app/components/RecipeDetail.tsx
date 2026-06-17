import { X, Clock, Users, Flame, Star, Heart, Bookmark, ChefHat, AlertCircle } from "lucide-react";
import { Recipe } from "../data/recipes";
import { useState } from "react";

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export function RecipeDetail({ recipe, onClose, isFavorited, onToggleFavorite }: RecipeDetailProps) {
  const [tab, setTab] = useState<"ingredients" | "steps" | "reviews">("ingredients");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const difficultyColor = {
    Easy: "var(--foreground)",
    Medium: "var(--accent)",
    Hard: "var(--primary)",
  }[recipe.difficulty];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(28,16,9,0.6)" }} onClick={onClose}>
      <div
        className="w-full md:max-w-2xl md:rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "var(--card)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-56 flex-shrink-0">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,16,9,0.7) 0%, transparent 60%)" }} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", color: "white" }}
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                {recipe.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: difficultyColor, color: "white" }}>
                {recipe.difficulty}
              </span>
              {recipe.isUserSubmitted && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(242,166,59,0.8)", color: "white" }}>
                  Community
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "white", fontWeight: 400 }}>{recipe.title}</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-0 border-b" style={{ borderColor: "var(--border)" }}>
            {[
              { icon: Clock, label: "Time", value: `${recipe.time}m` },
              { icon: Users, label: "Serves", value: recipe.servings },
              { icon: Flame, label: "Calories", value: recipe.calories },
              { icon: Star, label: "Rating", value: recipe.rating },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <Icon size={18} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--foreground)" }}>{value}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Author + actions */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <img src={recipe.authorAvatar} alt={recipe.author} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>{recipe.author}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{recipe.reviews.toLocaleString()} reviews</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onToggleFavorite}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
                style={{
                  borderColor: isFavorited ? "var(--accent)" : "var(--border)",
                  background: isFavorited ? "rgba(242,166,59,0.1)" : "var(--card)",
                }}
              >
                <Bookmark size={17} fill={isFavorited ? "var(--accent)" : "none"} stroke={isFavorited ? "var(--accent)" : "var(--muted-foreground)"} />
              </button>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: "var(--border)" }}>
                <Heart size={17} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="px-5 pt-4">
            <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>{recipe.description}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mx-5 mt-5 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
            {(["ingredients", "steps", "reviews"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg capitalize transition-all"
                style={{
                  background: tab === t ? "var(--card)" : "transparent",
                  color: tab === t ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: "0.85rem",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-5 py-4 pb-8">
            {tab === "ingredients" && (
              <div className="space-y-2.5">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--foreground)" }}>{ing.name}</p>
                      {ing.substitute && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <AlertCircle size={11} style={{ color: "var(--muted-foreground)" }} />
                          <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Sub: {ing.substitute}</p>
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-lg" style={{ background: "var(--muted)", color: "var(--foreground)", fontSize: "0.82rem", fontWeight: 500 }}>
                      {ing.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "steps" && (
              <div className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: "var(--primary)", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.65 }}>{step}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-6">
                {/* Write review */}
                <div className="p-4 rounded-2xl" style={{ background: "var(--muted)" }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.75rem" }}>Leave a Review</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(s)}
                      >
                        <Star
                          size={22}
                          fill={(hoverRating || userRating) >= s ? "var(--accent)" : "none"}
                          stroke={(hoverRating || userRating) >= s ? "var(--accent)" : "var(--muted-foreground)"}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share what you loved about this recipe..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none resize-none"
                    style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.875rem" }}
                  />
                  <button className="mt-2 px-5 py-2 rounded-xl" style={{ background: "var(--primary)", color: "white", fontSize: "0.85rem", fontWeight: 600 }}>
                    Post Review
                  </button>
                </div>

                {/* Sample reviews */}
                {[
                  { name: "Marcus L.", rating: 5, text: "Made this for a dinner party — everyone asked for the recipe!", date: "2 days ago", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
                  { name: "Hana K.", rating: 4, text: "Absolutely delicious. I added a bit more garlic and it was perfect.", date: "1 week ago", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop" },
                ].map((review, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={review.avatar} alt={review.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{review.name}</p>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 my-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} fill={s <= review.rating ? "var(--accent)" : "none"} stroke={s <= review.rating ? "var(--accent)" : "var(--muted-foreground)"} />
                        ))}
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
