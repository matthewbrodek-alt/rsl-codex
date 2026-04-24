import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Champion, Skill, AFFINITY_RU, RARITY_RU, ROLE_RU, affinityClass, rarityClass } from "@/lib/champions";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

const ChampionDetail = () => {
  const { slug } = useParams();
  const [c, setC] = useState<Champion | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: champ } = await supabase.from("champions").select("*").eq("slug", slug).maybeSingle();
      if (champ) {
        setC(champ as Champion);
        const { data: sk } = await supabase.from("skills").select("*").eq("champion_id", champ.id).order("ord");
        setSkills((sk ?? []) as Skill[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <main className="container py-10 text-muted-foreground">Загрузка…</main>;
  if (!c) return (
    <main className="container py-10">
      <p className="text-muted-foreground">Чемпион не найден.</p>
      <Button asChild variant="link"><Link to="/champions">← Вернуться к списку</Link></Button>
    </main>
  );

  const ratings = [
    { label: "Клан-Босс", v: c.rating_cb },
    { label: "Арена", v: c.rating_arena },
    { label: "Война Фракций", v: c.rating_fw },
    { label: "Подземелья", v: c.rating_dungeons },
  ];

  return (
    <main className="container py-10">
      <Link to="/champions" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> К списку чемпионов
      </Link>

      <header className="glass-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${affinityClass(c.affinity)}`}>
                {AFFINITY_RU[c.affinity]}
              </span>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${rarityClass(c.rarity)}`}>
                {RARITY_RU[c.rarity]}
              </span>
              <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                {c.faction}
              </span>
              <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                {ROLE_RU[c.role] ?? c.role}
              </span>
            </div>
            <h1 className={`mt-3 font-display text-5xl font-bold ${rarityClass(c.rarity).split(" ")[0]}`}>
              {c.name_ru}
            </h1>
            <p className="mt-1 text-muted-foreground">{c.name_en}</p>
          </div>

          {c.hellhades_url && (
            <Button asChild variant="outline">
              <a href={c.hellhades_url} target="_blank" rel="noopener noreferrer">
                Открыть на HellHades <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>

        {c.description_ru && (
          <p className="mt-6 max-w-3xl leading-relaxed text-foreground/90">{c.description_ru}</p>
        )}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Ratings */}
        <section className="glass-card p-6 lg:col-span-1">
          <h2 className="font-display text-xl font-semibold text-gold">Оценки</h2>
          <div className="mt-4 space-y-3">
            {ratings.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <StarRating value={r.v} />
              </div>
            ))}
          </div>
        </section>

        {/* Build */}
        <section className="glass-card p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold text-gold">Рекомендуемый билд</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Сеты</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {(c.recommended_sets ?? []).map((s) => (
                  <li key={s} className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Приоритет статов</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {(c.stat_priority ?? []).map((s) => (
                  <li key={s} className="rounded-md border border-border bg-secondary/40 px-3 py-1 text-xs">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Skills */}
      <section className="mt-8 glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-gold">Навыки</h2>
        {skills.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Описание навыков будет добавлено позже.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {skills.map((s) => (
              <div key={s.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    <span className="mr-2 text-primary">A{s.ord}.</span>{s.name_ru}
                  </h3>
                  {s.cooldown ? (
                    <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Откат: {s.cooldown}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{s.description_ru}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default ChampionDetail;
