import "../styles/fonts.css";
import { useState } from "react";
import { Landing } from "./components/Landing";
import { AuthPage } from "./components/AuthPage";
import { UserPortal } from "./components/UserPortal";
import { AdminPortal } from "./components/AdminPortal";

type AppScreen = "landing" | "auth-user" | "auth-admin" | "user" | "admin";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("landing");

  return (
    <div className="size-full" style={{ fontFamily: "var(--font-body)" }}>
      {screen === "landing" && (
        <Landing
          onGetStarted={() => setScreen("auth-user")}
          onAdminLogin={() => setScreen("auth-admin")}
        />
      )}

      {screen === "auth-user" && (
        <AuthPage
          defaultMode="user"
          onUserLogin={() => setScreen("user")}
          onAdminLogin={() => setScreen("admin")}
          onBack={() => setScreen("landing")}
        />
      )}

      {screen === "auth-admin" && (
        <AuthPage
          defaultMode="admin"
          onUserLogin={() => setScreen("user")}
          onAdminLogin={() => setScreen("admin")}
          onBack={() => setScreen("landing")}
        />
      )}

      {screen === "user" && (
        <UserPortal onLogout={() => setScreen("landing")} />
      )}

      {screen === "admin" && (
        <AdminPortal onLogout={() => setScreen("landing")} />
      )}
    </div>
  );
}
