import { Star } from "lucide-react";

export const StarRating = ({ value, max = 5 }: { value: number | null; max?: number }) => {
  const v = value ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= Math.floor(v);
        const half = !filled && i + 0.5 < v + 0.5 && i < v;
        return (
          <Star
            key={i}
            size={14}
            className={
              filled
                ? "fill-rarity-legendary text-rarity-legendary"
                : half
                ? "fill-rarity-legendary/50 text-rarity-legendary"
                : "text-muted-foreground/30"
            }
          />
        );
      })}
      <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{v.toFixed(1)}</span>
    </div>
  );
};
