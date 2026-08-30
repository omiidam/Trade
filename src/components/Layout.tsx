import { useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, Settings, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/utils";

const NAV_ITEMS = [
  { path: "/", icon: Home, labelKey: "nav.home" as const },
  { path: "/history", icon: Clock, labelKey: "nav.history" as const },
  { path: "/settings", icon: Settings, labelKey: "nav.settings" as const },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const labelMap = {
    "nav.home": t.nav.home,
    "nav.history": t.nav.history,
    "nav.settings": t.nav.settings,
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="safe-top flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">{t.app.name}</h1>
            <p className="text-[10px] text-muted-foreground leading-none">{t.app.tagline}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="safe-bottom border-t border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-all touch-target",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 transition-all", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium">
                  {labelMap[item.labelKey]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
