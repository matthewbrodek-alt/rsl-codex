import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Champion, RARITY_ORDER } from "@/lib/champions";
import { ChampionCard } from "@/components/ChampionCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FACTIONS = ["Banner Lords","Sacred Order","High Elves","Knight Revenant","Dark Elves","Demonspawn","Lizardmen","Undead Hordes","Ogryn Tribes","Barbarians","Dwarves","Orcs","Shadowkin"];
const AFFINITIES = ["Magic","Force","Spirit","Void"];
const RARITIES = ["Legendary","Epic","Rare"];
const ROLES = ["Attack","Defense","Support","HP"];

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "border-primary bg-primary/15 text-primary"
        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const Champions = () => {
  const [list, setList] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [faction, setFaction] = useState<string | null>(null);
  const [aff, setAff] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("champions").select("*");
      if (error) console.error(error);
      setList((data ?? []) as Champion[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().trim();
    const query = norm(q);
    return list
      .filter((c) => !query || norm(c.name_ru).includes(query) || norm(c.name_en).includes(query))
      .filter((c) => !faction || c.faction === faction)
      .filter((c) => !aff || c.affinity === aff)
      .filter((c) => !rarity || c.rarity === rarity)
      .filter((c) => !role || c.role === role)
      .sort((a, b) => (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0) || a.name_ru.localeCompare(b.name_ru));
  }, [list, q, faction, aff, rarity, role]);

  return (
    <main className="container py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-gold">База чемпионов</h1>
        <p className="mt-2 text-muted-foreground">{list.length} героев в базе · показано: {filtered.length}</p>
      </header>

      <div className="glass-card mb-8 p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени (рус/англ)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 bg-background/40"
          />
        </div>

        <div className="space-y-2">
          <FilterRow label="Стихия" options={AFFINITIES} value={aff} onChange={setAff} />
          <FilterRow label="Редкость" options={RARITIES} value={rarity} onChange={setRarity} />
          <FilterRow label="Роль" options={ROLES} value={role} onChange={setRole} />
          <FilterRow label="Фракция" options={FACTIONS} value={faction} onChange={setFaction} />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Ничего не найдено. Попробуйте изменить фильтры.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => <ChampionCard key={c.id} c={c} />)}
        </div>
      )}
    </main>
  );
};

const FilterRow = ({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="w-20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    <Chip active={value === null} onClick={() => onChange(null)}>Все</Chip>
    {options.map((o) => (
      <Chip key={o} active={value === o} onClick={() => onChange(o)}>{o}</Chip>
    ))}
  </div>
);

export default Champions;
