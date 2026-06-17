import { Settings, ChefHat, Star, BookOpen, Heart, LogOut, Bell, Shield, HelpCircle, ChevronRight } from "lucide-react";

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const stats = [
    { label: "Recipes Saved", value: "24" },
    { label: "Reviews", value: "8" },
    { label: "Recipes Shared", value: "3" },
  ];

  const menuSections = [
    {
      title: "Activity",
      items: [
        { icon: BookOpen, label: "My Recipes", badge: "3" },
        { icon: Heart, label: "Liked Recipes", badge: "41" },
        { icon: Star, label: "My Reviews", badge: "8" },
      ],
    },
    {
      title: "Settings",
      items: [
        { icon: Bell, label: "Notifications" },
        { icon: Shield, label: "Privacy & Security" },
        { icon: Settings, label: "Preferences" },
        { icon: HelpCircle, label: "Help & Support" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ fontFamily: "var(--font-body)", scrollbarWidth: "none" }}>
      {/* Profile header */}
      <div className="relative">
        <div className="h-32 w-full" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" }} />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 overflow-hidden" style={{ borderColor: "var(--background)" }}>
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
                <ChefHat size={12} color="white" />
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl border mt-12 transition-all hover:opacity-80" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "0.8rem", fontWeight: 500 }}>
              Edit Profile
            </button>
          </div>

          <div className="mt-3">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--foreground)", fontWeight: 400 }}>Alex Rivera</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>alex.rivera@example.com</p>
            <p className="mt-1.5" style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.5 }}>
              Home cook obsessed with Italian and Thai cuisine. Always hunting for the next great dish. 🍜
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-0 mt-5 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {stats.map(({ label, value }, i) => (
              <div
                key={label}
                className="flex flex-col items-center py-4 gap-0.5"
                style={{ borderRight: i < 2 ? `1px solid var(--border)` : "none", background: "var(--card)" }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--primary)" }}>{value}</span>
                <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 mb-5">
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Badges</p>
        <div className="flex flex-wrap gap-3">
          {[
            { emoji: "👨‍🍳", label: "Home Chef" },
            { emoji: "⭐", label: "Top Reviewer" },
            { emoji: "🌶️", label: "Spice Lover" },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl flex-1 min-w-[80px]" style={{ background: "var(--muted)" }}>
              <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
              <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      {menuSections.map(section => (
        <div key={section.title} className="px-5 mb-5">
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>{section.title}</p>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {section.items.map(({ icon: Icon, label, badge }, i) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all hover:opacity-80"
                style={{
                  background: "var(--card)",
                  borderBottom: i < section.items.length - 1 ? `1px solid var(--border)` : "none",
                }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--muted)" }}>
                  <Icon size={16} style={{ color: "var(--primary)" }} />
                </div>
                <span style={{ flex: 1, fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
                {badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>{badge}</span>
                )}
                <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="px-5 pb-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all hover:opacity-80"
          style={{ background: "rgba(192,57,43,0.08)", color: "#C0392B", fontWeight: 600 }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
