import { Flame, Star, Camera } from "lucide-react";

interface LandingProps {
  onGetStarted: () => void;
  onAdminLogin: () => void;
}

export function Landing({ onGetStarted, onAdminLogin }: LandingProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <div className="flex flex-col md:grid min-h-screen" style={{ gridTemplateColumns: "1fr 1fr" }}>

        {/* Left editorial panel */}
        <div className="relative flex flex-col justify-between px-6 py-8 md:p-12 z-10 order-2 md:order-1">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--foreground)" }}>Chef MAI</span>
            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", alignSelf: "flex-end", marginBottom: "3px" }}>The MiniChef AI</span>
          </div>

          {/* Hero text */}
          <div className="space-y-5 md:space-y-8 mt-6 md:mt-0">
            <div>
              <p className="uppercase tracking-widest mb-3" style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", letterSpacing: "0.2em" }}>
                The MiniChef AI · Smart Recipe Recommendations
              </p>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 8vw, 5rem)",
                lineHeight: 1.05,
                color: "var(--foreground)",
                fontWeight: 400,
              }}>
                Every meal<br />
                tells a<br />
                <em style={{ color: "var(--primary)" }}>story.</em>
              </h1>
            </div>

            <p style={{ fontSize: "clamp(0.88rem, 2vw, 1.05rem)", color: "var(--muted-foreground)", maxWidth: "380px", lineHeight: 1.7 }}>
              Snap your ingredients, let our AI match recipes using Bayesian learning, and cook something great — with what you already have.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Camera, label: "Snap Ingredients" },
                { icon: Flame, label: "Swipe to Discover" },
                { icon: Star, label: "Save Favorites" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--foreground)" }}>
                  <Icon size={13} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-1">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] text-center"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 600, fontSize: "1rem" }}
              >
                Start Cooking
              </button>
              <button
                onClick={onAdminLogin}
                className="px-6 py-4 rounded-2xl transition-all duration-200 hover:opacity-80 text-center"
                style={{ color: "var(--muted-foreground)", fontWeight: 500, fontSize: "0.9rem" }}
              >
                Admin Portal →
              </button>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8 mt-8 md:mt-0">
            {[
              { value: "12K+", label: "Recipes" },
              { value: "48K", label: "Home Cooks" },
              { value: "4.9★", label: "Rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "var(--foreground)" }}>{value}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right photo panel */}
        <div className="relative overflow-hidden order-1 md:order-2" style={{ minHeight: "240px" }}>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=1100&fit=crop&auto=format"
            alt="Beautifully plated food"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(253,246,238,0.3) 0%, transparent 60%)" }} />

          {/* Floating recipe card — desktop only */}
          <div className="absolute bottom-8 md:bottom-16 left-5 right-5 md:left-8 md:right-8 p-4 md:p-5 rounded-2xl backdrop-blur-md border" style={{ background: "rgba(255,250,244,0.88)", borderColor: "rgba(255,255,255,0.5)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="uppercase tracking-widest mb-1" style={{ fontSize: "0.62rem", color: "var(--muted-foreground)" }}>Today's Pick</p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--foreground)" }}>
                  Pasta al Limone
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
                  25 min · Easy · Italian
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <Star size={13} fill="var(--accent)" stroke="none" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>4.8</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>2.1k reviews</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
