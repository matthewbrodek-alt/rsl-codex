import { NavLink } from "react-router-dom";
import { Shield } from "lucide-react";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-primary ${
    isActive ? "text-primary" : "text-muted-foreground"
  }`;

export const SiteHeader = () => (
  <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/70">
    <div className="container flex h-16 items-center justify-between">
      <NavLink to="/" className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-display text-xl font-bold text-gold">RSL Codex</span>
      </NavLink>
      <nav className="flex items-center gap-6">
        <NavLink to="/" end className={linkCls}>Главная</NavLink>
        <NavLink to="/champions" className={linkCls}>Чемпионы</NavLink>
        <NavLink to="/speed-calculator" className={linkCls}>Скорости</NavLink>
      </nav>
    </div>
  </header>
);
