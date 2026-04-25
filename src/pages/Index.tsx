import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Champion } from "@/lib/champions";
import { ChampionCard } from "@/components/ChampionCard";
import { Background } from "@/components/Background"; // Создадим его ниже

const Index = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChampions = async () => {
      const { data, error } = await supabase
        .from("champions")
        .select("*")
        .order("name_ru", { ascending: true });

      if (error) console.error("Ошибка загрузки:", error);
      else setChampions((data as unknown as Champion[]) || []);
      setLoading(false);
    };

    fetchChampions();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 1. ВИЗУАЛЬНЫЙ ФОН (ВИДЕО + КАНВАС) */}
      <Background />

      {/* 2. НАВИГАЦИЯ (СТИЛЬ NEKO) */}
      <nav className="topnav fixed top-0 w-full z-50">
        <div className="nav-brand">
          <div className="brand-icon"><i className="fa-solid fa-dragon"></i></div>
          <span className="brand-name">RSL<span className="brand-accent">Codex</span></span>
        </div>
        <div className="nav-links hidden md:flex">
          <a href="#champions" className="nav-link active">ГЕРОИ</a>
          <a href="#guides" className="nav-link">ГАЙДЫ</a>
          <a href="#tools" className="nav-link">ИНСТРУМЕНТЫ</a>
        </div>
      </nav>

      {/* 3. HERO СЕКЦИЯ */}
      <header className="hero pt-32">
        <div className="rune-float rune-f1">ᚠ</div>
        <div className="rune-float rune-f2">ᚢ</div>
        <div className="rune-float rune-f3">ᚱ</div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-fire text-gold"></i> 
            <span>ОБНОВЛЕНО 2026</span>
          </div>
          <h1 className="hero-title text-5xl md:text-7xl font-black italic uppercase">
            МАСТЕРСТВО В <br />
            <span className="hero-accent">RAID: SHADOW LEGENDS</span>
          </h1>
          <p className="hero-sub text-gray-400 max-w-2xl mx-auto mt-6">
            Полная база чемпионов, оценки и лучшие сборки. 
            Всё, что нужно для доминирования в Телерии.
          </p>
          
          <div className="hero-stats flex justify-center gap-12 mt-12">
            <div className="stat text-center">
              <span className="stat-n block text-3xl font-bold text-gold">{champions.length}</span>
              <span className="stat-l text-xs uppercase tracking-widest text-gray-500">Героев</span>
            </div>
            <div className="h-12 w-[1px] bg-white/10"></div>
            <div className="stat text-center">
              <span className="stat-n block text-3xl font-bold text-gold">16</span>
              <span className="stat-l text-xs uppercase tracking-widest text-gray-500">Фракций</span>
            </div>
          </div>
        </div>

        {/* АНИМИРОВАННАЯ СФЕРА ИЗ ДОНОРА */}
        <div className="hero-visual absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="orbit-ring ring1"></div>
          <div className="orbit-ring ring2"></div>
          <div className="hero-gem">
            <div className="gem-inner"><i className="fa-solid fa-gem text-gold"></i></div>
            <div className="gem-glow"></div>
          </div>
        </div>
      </header>

      {/* 4. ОСНОВНОЙ КОНТЕНТ */}
      <main className="container mx-auto px-4 relative z-10" id="champions">
        <section className="section py-20">
          <div className="section-header flex items-center gap-4 mb-12">
            <div className="section-icon w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
              <i className="fa-solid fa-scroll text-gold"></i>
            </div>
            <h2 className="text-3xl font-bold uppercase italic tracking-tighter">Библиотека Героев</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="champions-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {champions.map((champion) => (
                <ChampionCard key={champion.id} c={champion} />
              ))}
            </div>
          )}
        </section>
      </main>
      
      {/* 5. ФУТЕР */}
      <footer className="footer py-10 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
          <div className="brand-name text-xl font-bold mb-4">RSL<span className="brand-accent">CODEX</span></div>
          <p className="text-gray-500 text-sm">© 2026 RSL Codex — Неофициальный фанатский ресурс</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;