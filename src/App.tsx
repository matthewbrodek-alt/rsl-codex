import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";          // ← не трогаем
import Navbar from "./components/Navbar";
import ChampionCard from "./components/ChampionCard";
import ChampionPage from "./pages/ChampionPage";       // ← существующая страница
import "./index.css";

// ─── типы ──────────────────────────────────────────────────────────
interface Champion {
  id: string | number;
  name: string;
  slug?: string;
  faction?: string;
  rarity?: string;
  element?: string;
  type?: string;
  image_url?: string;
  avatar_url?: string;
  thumbnail?: string;
}

// ─── вспомогалки ───────────────────────────────────────────────────
const RARITIES = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];
const ELEMENTS = ["Magic", "Force", "Spirit", "Void"];

const CALCULATOR_ITEMS = [
  { icon: "fa-gauge-high",       title: "Speed Tuning",        desc: "Настрой скорости команды для CB / Арены" },
  { icon: "fa-shield-virus",     title: "EHP Calculator",      desc: "Эффективные HP с учётом защиты" },
  { icon: "fa-chart-bar",        title: "Damage Efficiency",   desc: "Оптимальное ATK / CRIT DMG / CRIT Rate" },
  { icon: "fa-skull",            title: "CB Chest Simulator",  desc: "Прогноз наград Клан-Босса" },
  { icon: "fa-users-between-lines", title: "Clan vs Clan",     desc: "Калькулятор очков CvC события" },
  { icon: "fa-box-open",         title: "Pack Offer Value",    desc: "Реальная ценность платных предложений" },
];

const FACTIONS = [
  "Banner Lords","High Elves","Sacred Order","Barbarians",
  "Ogryn Tribes","Lizardmen","Skinwalkers","Orcs",
  "Demonspawn","Undead Hordes","Dark Elves","Knights Revenant",
  "Dwarves","Shadowkin","Sylvan Watchers","Argonites",
];

// ─── RuneCanvas ────────────────────────────────────────────────────
function RuneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const RUNES = ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ","ᛇ","ᛈ","ᛉ","ᛊ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛜ","ᛞ","ᛟ"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rune: RUNES[Math.floor(Math.random() * RUNES.length)],
      speed: 0.15 + Math.random() * 0.25,
      size: 14 + Math.random() * 16,
      alpha: 0.2 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));
    let raf: number;
    const animate = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#c8922a";
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(t * 0.001 + p.phase) * 0.2;
        if (p.y < -30) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; p.rune = RUNES[Math.floor(Math.random() * RUNES.length)]; }
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(t * 0.002 + p.phase) * 0.5);
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.rune, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} id="runeCanvas" />;
}

// ─── ScrollProgress ────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
}

// ─── ScrollToTop ───────────────────────────────────────────────────
function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <button
      className={`scroll-top${show ? " visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Наверх"
    >
      <i className="fa-solid fa-chevron-up" />
    </button>
  );
}

// ─── SectionObserver ───────────────────────────────────────────────
function useRevealSections() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".section").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
}

// ═══════════════════════════════════════════════════════════════════
//  ГЛАВНАЯ СТРАНИЦА
// ═══════════════════════════════════════════════════════════════════
function HomePage() {
  // ── STATE ──────────────────────────────────────────────────────
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [rarityFilter, setRarity] = useState("");
  const [elemFilter, setElem]     = useState("");
  const [factionFilter, setFaction] = useState("");

  useRevealSections();

  // ── SUPABASE FETCH (не трогаем логику) ─────────────────────────
  useEffect(() => {
    const fetchChampions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("champions")
        .select("id, name, slug, faction, rarity, element, type, image_url, avatar_url, thumbnail")
        .order("name");
      if (!error && data) setChampions(data as Champion[]);
      setLoading(false);
    };
    fetchChampions();
  }, []);

  // ── ФИЛЬТРАЦИЯ ─────────────────────────────────────────────────
  const filtered = champions.filter((c) => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !(c.faction || "").toLowerCase().includes(q)) return false;
    if (rarityFilter && (c.rarity || "").toLowerCase() !== rarityFilter.toLowerCase()) return false;
    if (elemFilter   && (c.element || "").toLowerCase() !== elemFilter.toLowerCase())   return false;
    if (factionFilter && c.faction !== factionFilter)  return false;
    return true;
  });

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <>
      {/* ── HERO ── */}
      <header className="hero" id="home">
        <div className="rune-float rune-f1">ᚠ</div>
        <div className="rune-float rune-f2">ᚢ</div>
        <div className="rune-float rune-f3">ᚱ</div>
        <div className="rune-float rune-f4">ᚲ</div>

        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-fire" /> Обновлено 2026
          </div>
          <h1 className="hero-title">
            База чемпионов<br />
            <span className="hero-accent">RSL Codex</span>
          </h1>
          <p className="hero-sub">
            Полная русскоязычная база Raid: Shadow Legends — навыки, оценки, сеты, аффинити и роли всех чемпионов.
          </p>
          <div className="hero-btns">
            <a href="#champions" className="btn btn-primary">
              <i className="fa-solid fa-search" /> Найти чемпиона
            </a>
            <a href="#calculator" className="btn btn-outline">
              <i className="fa-solid fa-calculator" /> Калькулятор
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-n">{champions.length || "800"}+</span>
              <span className="stat-l">Чемпионов</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-n">16</span>
              <span className="stat-l">Фракций</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-n">4</span>
              <span className="stat-l">Стихии</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit-ring ring1" />
          <div className="orbit-ring ring2" />
          <div className="orbit-ring ring3" />
          <div className="hero-gem">
            <div className="gem-inner"><i className="fa-solid fa-gem" /></div>
            <div className="gem-glow" />
          </div>
          <div className="float-icon fi1"><i className="fa-solid fa-crown" /></div>
          <div className="float-icon fi2"><i className="fa-solid fa-khanda" /></div>
          <div className="float-icon fi3"><i className="fa-solid fa-skull-crossbones" /></div>
          <div className="float-icon fi4"><i className="fa-solid fa-fire-flame-curved" /></div>
          <div className="float-icon fi5"><i className="fa-solid fa-leaf" /></div>
          <div className="float-icon fi6"><i className="fa-solid fa-bolt" /></div>
        </div>

        <div className="scroll-hint">
          Прокрути
          <div className="scroll-hint-arrow">
            <span /><span /><span />
          </div>
        </div>
      </header>

      {/* ── PROMO STRIP ── */}
      <section className="promo-strip">
        <div className="promo-track">
          {[
            "⚔ Новая фракция: Argonites",
            "🔥 Tier-лист обновлён: апрель 2026",
            "🏆 База чемпионов RSL Codex",
            "🐉 Новые Мифические чемпионы",
            "⚡ Обновление системы Благословений",
          ].concat([
            "⚔ Новая фракция: Argonites",
            "🔥 Tier-лист обновлён: апрель 2026",
            "🏆 База чемпионов RSL Codex",
            "🐉 Новые Мифические чемпионы",
            "⚡ Обновление системы Благословений",
          ]).map((t, i) => (
            <div className="promo-item" key={i}>{t}</div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="container">

        {/* ── PARALLAX ── */}
        <div className="parallax-banner">
          <div className="parallax-runes">
            {"ᚠᚢᚦᚨᚱᚲᚷᚹ".split("").map((r, i) => <span key={i}>{r}</span>)}
          </div>
          <div className="parallax-text">
            <h2>Войди в мир теней</h2>
            <p>Более 800 чемпионов. Бесконечные стратегии.</p>
          </div>
        </div>

        {/* ══ CHAMPIONS SECTION ══ */}
        <section className="section" id="champions">
          <div className="section-header">
            <div className="section-icon"><i className="fa-solid fa-users" /></div>
            <h2>База чемпионов</h2>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <i className="fa-solid fa-search search-icon" />
            <input
              className="search-input"
              placeholder="Поиск по имени или фракции..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Rarity filter */}
          <div className="filter-bar">
            <button
              className={`filter-pill${!rarityFilter ? " active" : ""}`}
              onClick={() => setRarity("")}
            >Все</button>
            {RARITIES.map((r) => (
              <button
                key={r}
                className={`filter-pill ${r.toLowerCase()}${rarityFilter === r ? " active" : ""}`}
                onClick={() => setRarity(rarityFilter === r ? "" : r)}
              >{r}</button>
            ))}
          </div>

          {/* Element filter */}
          <div className="filter-bar" style={{ marginBottom: 24 }}>
            {ELEMENTS.map((el) => (
              <button
                key={el}
                className={`filter-pill${elemFilter === el ? " active" : ""}`}
                style={{ fontSize: 12 }}
                onClick={() => setElem(elemFilter === el ? "" : el)}
              >
                {el === "Magic" ? "💧" : el === "Force" ? "🔥" : el === "Spirit" ? "🌿" : "🌑"} {el}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">
              <i className="fa-solid fa-spinner fa-spin" />
              <p>Загружаем чемпионов...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-ghost" />
              <p>Чемпионы не найдены</p>
            </div>
          ) : (
            <div className="champions-grid">
              {filtered.map((c) => (
                <ChampionCard key={c.id} champion={c} />
              ))}
            </div>
          )}
        </section>

        {/* ══ FACTIONS SECTION ══ */}
        <section className="section" id="factions">
          <div className="section-header">
            <div className="section-icon"><i className="fa-solid fa-shield-halved" /></div>
            <h2>Фракции</h2>
          </div>
          <div className="filter-bar" style={{ flexWrap: "wrap" }}>
            <button
              className={`filter-pill${!factionFilter ? " active" : ""}`}
              onClick={() => setFaction("")}
            >Все фракции</button>
            {FACTIONS.map((f) => (
              <button
                key={f}
                className={`filter-pill${factionFilter === f ? " active" : ""}`}
                onClick={() => {
                  setFaction(factionFilter === f ? "" : f);
                  document.getElementById("champions")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >{f}</button>
            ))}
          </div>
        </section>

        {/* ══ CALCULATOR SECTION (замена «Все инструменты Raid») ══ */}
        <section className="section" id="calculator">
          <div className="section-header">
            <div className="section-icon"><i className="fa-solid fa-calculator" /></div>
            <h2>Калькулятор</h2>
          </div>
          <div className="calc-grid">
            {CALCULATOR_ITEMS.map((item) => (
              <div className="calc-card" key={item.title}>
                <div className="calc-icon"><i className={`fa-solid ${item.icon}`} /></div>
                <div className="calc-info">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="nav-brand" style={{ textDecoration: "none" }}>
            <div className="brand-icon" style={{ width: 30, height: 30, fontSize: 14, borderRadius: 8 }}>
              <i className="fa-solid fa-dragon" />
            </div>
            <span className="brand-name">RSL<span className="brand-accent">Codex</span></span>
          </div>
          <p className="footer-note">
            Неофициальный фанатский ресурс. Raid: Shadow Legends принадлежит Plarium Games.
            Все материалы носят информационный характер.
          </p>
          <div className="footer-links">
            <a href="#champions">Чемпионы</a>
            <a href="#factions">Фракции</a>
            <a href="#calculator">Калькулятор</a>
          </div>
          <p className="footer-copy">© 2026 RSLCodex — Все права защищены</p>
        </div>
      </footer>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════
function App() {
  // Preloader
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <BrowserRouter>
      {/* Фоновый canvas рун */}
      <RuneCanvas />

      {/* Прелоадер */}
      <div className={`preloader${loaded ? " hidden" : ""}`} id="preloader">
        <div className="preloader-rune">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 95,75 5,75" fill="none" stroke="var(--gold)" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="var(--gold-light)" strokeWidth="1.5" />
            <line x1="50" y1="5" x2="50" y2="30" stroke="var(--gold)" strokeWidth="1.5" />
            <line x1="95" y1="75" x2="72" y2="62" stroke="var(--gold)" strokeWidth="1.5" />
            <line x1="5" y1="75" x2="28" y2="62" stroke="var(--gold)" strokeWidth="1.5" />
          </svg>
        </div>
        <p className="preloader-text">Загрузка базы данных...</p>
      </div>

      <ScrollProgress />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Роутинг на страницу чемпиона — используем существующую логику RSL Codex */}
        <Route path="/champion/:slug" element={<ChampionPage />} />
        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>

      <ScrollToTop />
    </BrowserRouter>
  );
}

export default App;
