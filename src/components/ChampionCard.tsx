import { Link } from "react-router-dom";
import { Champion, AFFINITY_RU, RARITY_RU, ROLE_RU, affinityClass, rarityClass } from "@/lib/champions";
import { StarRating } from "./StarRating";

export const ChampionCard = ({ c }: { c: Champion }) => {
  const ratingAvg =
    [c.rating_cb, c.rating_arena, c.rating_fw, c.rating_dungeons]
      .filter((x): x is number => typeof x === "number")
      .reduce((a, b, _, arr) => a + b / arr.length, 0) || 0;

  const rarityRing =
    c.rarity === "Legendary"
      ? "ring-rarity-legendary"
      : c.rarity === "Epic"
      ? "ring-rarity-epic"
      : c.rarity === "Rare"
      ? "ring-rarity-rare"
      : "";

  return (
    <Link
      to={`/champions/${c.slug}`}
      className={`glass-card group p-5 transition-all hover:-translate-y-1 hover:scale-[1.02] ${rarityRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-display text-lg font-bold leading-tight ${rarityClass(c.rarity).split(" ")[0]}`}>
            {c.name_ru}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{c.name_en}</p>
        </div>
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${affinityClass(c.affinity)}`}>
          {AFFINITY_RU[c.affinity]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
        <span className="rounded bg-secondary/60 px-2 py-0.5 text-secondary-foreground">{c.faction}</span>
        <span className="rounded bg-secondary/60 px-2 py-0.5 text-secondary-foreground">{ROLE_RU[c.role] ?? c.role}</span>
        <span className={`rounded border px-2 py-0.5 ${rarityClass(c.rarity)}`}>{RARITY_RU[c.rarity]}</span>
      </div>

      <div className="mt-4 border-t border-border/40 pt-3">
        <StarRating value={ratingAvg} />
      </div>
    </Link>
  );
};
