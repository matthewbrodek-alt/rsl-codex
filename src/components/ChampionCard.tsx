import { Link } from "react-router-dom";
import { Champion, AFFINITY_RU, RARITY_RU, ROLE_RU } from "@/lib/champions";
import { StarRating } from "./StarRating";

// Словарь иконок стихий. 
// Убедись, что эти файлы лежат по пути: public/assets/icons/elements/
const AFFINITY_ICONS: Record<string, string> = {
  Magic: "/assets/icons/elements/magic.webp",
  Force: "/assets/icons/elements/force.webp",
  Spirit: "/assets/icons/elements/spirit.webp",
  Void: "/assets/icons/elements/void.webp",
};

export const ChampionCard = ({ c }: { c: Champion }) => {
  // Расчет среднего рейтинга на основе всех оценок
  const ratings = [c.rating_cb, c.rating_arena, c.rating_fw, c.rating_dungeons];
  const validRatings = ratings.filter((x): x is number => x !== null);
  const ratingAvg = validRatings.length > 0 
    ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length 
    : 0;

  const rarityLow = c.rarity?.toLowerCase() || "common";
  const affinityLow = c.affinity?.toLowerCase() || "";

  return (
    <Link
      to={`/champions/${c.slug}`}
      className={`champion-card group ${rarityLow}`}
    >
      <div className="champion-card-img-wrap relative aspect-square overflow-hidden bg-[#0d0d0f]">
        {/* Картинка героя с плавным зумом при наведении */}
        {c.image_url || c.avatar_url ? (
          <img
            src={c.image_url || c.avatar_url || ""}
            alt={c.name_ru}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
            ⚔
          </div>
        )}

        {/* Слой затемнения для контраста бейджей */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40"></div>

        {/* Бейдж стихии (Affinity) */}
        <div 
          className={`element-badge ${affinityLow} absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 p-1`} 
          title={AFFINITY_RU[c.affinity]}
        >
          {AFFINITY_ICONS[c.affinity] ? (
            <img 
              src={AFFINITY_ICONS[c.affinity]} 
              alt={c.affinity} 
              className="w-full h-full object-contain" 
            />
          ) : (
            <span className="text-[10px] font-bold text-white/50">{AFFINITY_RU[c.affinity]?.charAt(0)}</span>
          )}
        </div>

        {/* Бейдж редкости (текстовый, как в доноре) */}
        <div className={`rarity-badge ${rarityLow} absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-sm border border-white/10`}>
          {RARITY_RU[c.rarity]}
        </div>
      </div>

      <div className="champion-card-body p-4 bg-[#141418]">
        {/* Имя героя — подсвечивается золотым при наведении на карточку */}
        <div className="champion-name text-lg font-bold italic text-white group-hover:text-gold transition-colors duration-300 truncate">
          {c.name_ru}
        </div>
        
        <div className="champion-meta flex justify-between items-center mt-1">
          <span className="champion-faction text-[11px] uppercase tracking-tighter text-gold/80 font-semibold">
            {c.faction}
          </span>
          <span className="champion-type text-[11px] text-gray-500 uppercase tracking-tighter">
            {ROLE_RU[c.role] ?? c.role}
          </span>
        </div>
        
        {/* Блок с рейтингом */}
        <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
          <StarRating value={ratingAvg} />
          <span className="text-[10px] text-gray-600 font-mono italic">
            {ratingAvg > 0 ? ratingAvg.toFixed(1) : ""}
          </span>
        </div>
      </div>

      {/* Декоративное свечение из твоего CSS */}
      <div className="card-glow absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </Link>
  );
};