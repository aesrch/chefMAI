import { useState } from "react";
import { ChefHat, Eye, EyeOff, ArrowLeft, ShieldCheck, User } from "lucide-react";

type AuthMode = "user-login" | "user-register" | "admin-login";

interface AuthPageProps {
  defaultMode?: "user" | "admin";
  onUserLogin: () => void;
  onAdminLogin: () => void;
  onBack: () => void;
}

export function AuthPage({ defaultMode = "user", onUserLogin, onAdminLogin, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode === "admin" ? "admin-login" : "user-login");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const isAdmin = mode === "admin-login";
  const isRegister = mode === "user-register";

  const API_BASE = "http://localhost:8080";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isRegister) {
      try {
        const res = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accName: name || "Cook",
            accUserName: email,
            accPass: password,
            accPresentation: "Home Cook",
            accLink: "",
            imgID: null
          })
        });

        if (res.ok) {
          alert("Registration successful! Please sign in with your credentials.");
          setMode("user-login");
        } else {
          const text = await res.text();
          alert(`Registration failed: ${text}`);
        }
      } catch (err) {
        console.error(err);
        alert("Could not connect to the backend server.");
      }
    } else {
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accUserName: email,
            accPass: password
          })
        });

        if (res.ok) {
          if (isAdmin) {
            onAdminLogin();
          } else {
            onUserLogin();
          }
        } else {
          const text = await res.text();
          alert(`Login failed: ${text}`);
        }
      } catch (err) {
        console.error(err);
        alert("Could not connect to the backend server.");
      }
    }
  }

  async function handleSocialLogin() {
    const socialEmail = "testuser@chefmai.app";
    const socialPass = "testpassword123";

    try {
      let res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accUserName: socialEmail,
          accPass: socialPass
        })
      });

      if (res.ok) {
        onUserLogin();
        return;
      }

      // If test account doesn't exist, sign up and try again
      res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accName: "Test User",
          accUserName: socialEmail,
          accPass: socialPass,
          accPresentation: "Social Login Test User",
          accLink: "",
          imgID: null
        })
      });

      res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accUserName: socialEmail,
          accPass: socialPass
        })
      });

      if (res.ok) {
        onUserLogin();
      } else {
        alert("Failed to log in with test user credentials.");
      }
    } catch (err) {
      console.error("Social login mapping error:", err);
      onUserLogin();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}>

      {/* Left: decorative panel */}
      <div className="hidden md:flex md:w-2/5 relative flex-col overflow-hidden" style={{ background: isAdmin ? "#1C1009" : "var(--primary)" }}>
        <img
          src={isAdmin
            ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&h=900&fit=crop&auto=format"
            : "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700&h=900&fit=crop&auto=format"}
          alt="Kitchen"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.25 }}
        />
        <div className="relative z-10 flex flex-col h-full p-12">
          <button onClick={onBack} className="flex items-center gap-2 mb-auto" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.15)" }}>
              {isAdmin ? <ShieldCheck size={28} color="white" /> : <ChefHat size={28} color="white" />}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "white", lineHeight: 1.1, fontWeight: 400 }}>
              {isAdmin ? "Administrator\nPortal" : "Welcome\nBack, Chef."}
            </h2>
            <p className="mt-4" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {isAdmin
                ? "Manage users, moderate content, and keep the community thriving."
                : "Chef MAI learns your taste profile to recommend recipes from the ingredients you already have."}
            </p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile back */}
        <div className="md:hidden p-6">
          <button onClick={onBack} className="flex items-center gap-2" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Portal toggle */}
        <div className="flex justify-center pt-12 pb-2">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--muted)" }}>
            <button
              onClick={() => setMode("user-login")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
              style={{
                background: !isAdmin ? "var(--card)" : "transparent",
                color: !isAdmin ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: !isAdmin ? 600 : 400,
                fontSize: "0.875rem",
                boxShadow: !isAdmin ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <User size={15} /> User
            </button>
            <button
              onClick={() => setMode("admin-login")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
              style={{
                background: isAdmin ? "var(--card)" : "transparent",
                color: isAdmin ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: isAdmin ? 600 : 400,
                fontSize: "0.875rem",
                boxShadow: isAdmin ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <ShieldCheck size={15} /> Admin
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-md space-y-8">

            {/* Header */}
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "var(--foreground)", fontWeight: 400 }}>
                {isAdmin ? "Admin Sign In" : isRegister ? "Create Account" : "Sign In"}
              </h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                {isAdmin ? "Restricted access — admins only." : isRegister ? "Join thousands of home cooks." : "Good to have you back."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <Field label="Full Name" value={name} onChange={setName} placeholder="Julia Child" />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder={isAdmin ? "admin@chefmai.app" : "you@example.com"} />
              <div className="space-y-1.5">
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{
                      background: "var(--input-background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.95rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isRegister && !isAdmin && (
                <div className="flex justify-end">
                  <button type="button" style={{ fontSize: "0.8rem", color: "var(--primary)" }}>Forgot password?</button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: isAdmin ? "#1C1009" : "var(--primary)", color: "white", fontWeight: 600, fontSize: "1rem", marginTop: "0.5rem" }}
              >
                {isAdmin ? "Access Admin Portal" : isRegister ? "Create Account" : "Sign In"}
              </button>
            </form>

            {/* Toggle register */}
            {!isAdmin && (
              <p className="text-center" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setMode(isRegister ? "user-login" : "user-register")}
                  style={{ color: "var(--primary)", fontWeight: 600 }}
                >
                  {isRegister ? "Sign In" : "Register Free"}
                </button>
              </p>
            )}

            {/* Social */}
            {!isAdmin && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>or continue with</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Google", "Apple"].map(provider => (
                    <button
                      key={provider}
                      onClick={handleSocialLogin}
                      className="py-3 rounded-xl border transition-all hover:opacity-80"
                      style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text"
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2"
        style={{
          background: "var(--input-background)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
          fontSize: "0.95rem",
        }}
      />
    </div>
  );
}
