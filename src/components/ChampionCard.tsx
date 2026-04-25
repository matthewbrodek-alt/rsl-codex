import { Link } from "react-router-dom";
import { Champion, AFFINITY_RU, RARITY_RU, ROLE_RU, affinityClass, rarityClass } from "@/lib/champions";
import { StarRating } from "./StarRating";

export const ChampionCard = ({ c }: { c: Champion }) => {
  // Твоя логика расчета рейтинга — сохранена полностью
  const ratingAvg =
    [c.rating_cb, c.rating_arena, c.rating_fw, c.rating_dungeons]
      .filter((x): x is number => typeof x === "number")
      .reduce((a, b, _, arr) => a + b / arr.length, 0) || 0;

  // Твоя логика цветных колец редкости — сохранена
  const rarityRing =
    c.rarity === "Legendary"
      ? "ring-rarity-legendary shadow-[0_0_15px_rgba(255,184,0,0.1)]" // Добавил легкое свечение
      : c.rarity === "Epic"
      ? "ring-rarity-epic shadow-[0_0_15px_rgba(163,53,238,0.1)]"
      : c.rarity === "Rare"
      ? "ring-rarity-rare shadow-[0_0_15px_rgba(0,112,243,0.1)]"
      : "";

  return (
    <Link
      to={`/champions/${c.slug}`}
      /* КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ ДИЗАЙНА:
         - bg-white/[0.03] и backdrop-blur-xl (эффект стекла)
         - border-white/10 (тонкая грань)
         - Сохранение твоего rarityRing для акцента
      */
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/[0.06] ${rarityRing}`}
    >
      {/* Шапка карточки: Имя и Стихия */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-display text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-white ${rarityClass(c.rarity).split(" ")[0]}`}>
            {c.name_ru}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-white/40">{c.name_en}</p>
        </div>
        
        {/* Твоя стихия с оригинальным классом */}
        <span className={`rounded-lg border bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${affinityClass(c.affinity)}`}>
          {AFFINITY_RU[c.affinity]}
        </span>
      </div>

      {/* Контент: Фракция, Роль, Редкость */}
      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded-md border border-white/5 bg-white/5 px-2.5 py-1 font-medium text-white/70">
          {c.faction}
        </span>
        <span className="rounded-md border border-white/5 bg-white/5 px-2.5 py-1 font-medium text-white/70">
          {ROLE_RU[c.role] ?? c.role}
        </span>
        <span className={`rounded-md border px-2.5 py-1 font-bold backdrop-blur-sm ${rarityClass(c.rarity)}`}>
          {RARITY_RU[c.rarity]}
        </span>
      </div>

      {/* Футер: Рейтинг со звездами */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between">
          <StarRating value={ratingAvg} />
          {/* Маленький индикатор в стиле Neko Market */}
          <div className="text-[9px] font-bold uppercase text-white/20">Details →</div>
        </div>
      </div>

      {/* Декоративный градиент на фоне при ховере (эффект Neko) */}
      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
};