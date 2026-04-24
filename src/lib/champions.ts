export type Champion = {
  id: string;
  slug: string;
  name_en: string;
  name_ru: string;
  faction: string;
  affinity: "Magic" | "Force" | "Spirit" | "Void";
  rarity: "Legendary" | "Epic" | "Rare" | "Uncommon" | "Common";
  role: string;
  description_ru: string | null;
  hellhades_url: string | null;
  rating_cb: number | null;
  rating_arena: number | null;
  rating_fw: number | null;
  rating_dungeons: number | null;
  recommended_sets: string[] | null;
  stat_priority: string[] | null;
};

export type Skill = {
  id: string;
  champion_id: string;
  ord: number;
  name_ru: string;
  description_ru: string;
  cooldown: number | null;
};

export const RARITY_ORDER: Record<string, number> = {
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Uncommon: 1,
  Common: 0,
};

export const AFFINITY_RU: Record<string, string> = {
  Magic: "Магия",
  Force: "Сила",
  Spirit: "Дух",
  Void: "Пустота",
};

export const RARITY_RU: Record<string, string> = {
  Legendary: "Легендарный",
  Epic: "Эпический",
  Rare: "Редкий",
  Uncommon: "Необычный",
  Common: "Обычный",
};

export const ROLE_RU: Record<string, string> = {
  Attack: "Атака",
  Defense: "Защита",
  Support: "Поддержка",
  HP: "Здоровье",
};

export const rarityClass = (r: string) => {
  switch (r) {
    case "Legendary": return "text-rarity-legendary border-rarity-legendary/40";
    case "Epic": return "text-rarity-epic border-rarity-epic/40";
    case "Rare": return "text-rarity-rare border-rarity-rare/40";
    default: return "text-rarity-common border-rarity-common/40";
  }
};

export const affinityClass = (a: string) => {
  switch (a) {
    case "Magic": return "bg-affinity-magic/15 text-affinity-magic border-affinity-magic/40";
    case "Force": return "bg-affinity-force/15 text-affinity-force border-affinity-force/40";
    case "Spirit": return "bg-affinity-spirit/15 text-affinity-spirit border-affinity-spirit/40";
    case "Void": return "bg-affinity-void/15 text-affinity-void border-affinity-void/40";
    default: return "bg-muted text-muted-foreground";
  }
};
