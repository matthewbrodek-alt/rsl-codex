import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#champions", icon: "fa-users", label: "Чемпионы" },
    { href: "#factions",  icon: "fa-shield-halved", label: "Фракции" },
    { href: "#calculator",icon: "fa-calculator", label: "Калькулятор" },
  ];

  return (
    <nav className={`topnav${scrolled ? " scrolled" : ""}`} id="topnav">
      <a href="/" className="nav-brand">
        <div className="brand-icon">
          <i className="fa-solid fa-dragon" />
        </div>
        <span className="brand-name">
          RSL<span className="brand-accent">Codex</span>
        </span>
      </a>

      <div className={`nav-links${menuOpen ? " open" : ""}`} id="navLinks">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <i className={`fa-solid ${l.icon}`} />
            {l.label}
          </a>
        ))}
      </div>

      <div className="nav-controls">
        <button
          className="burger"
          id="burger"
          aria-label="Меню"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            style={menuOpen ? { transform: "translateY(7px) rotate(45deg)" } : {}}
          />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span
            style={menuOpen ? { transform: "translateY(-7px) rotate(-45deg)" } : {}}
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
