
CREATE TABLE public.champions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_ru text NOT NULL,
  faction text NOT NULL,
  affinity text NOT NULL,
  rarity text NOT NULL,
  role text NOT NULL,
  description_ru text,
  hellhades_url text,
  rating_cb numeric,
  rating_arena numeric,
  rating_fw numeric,
  rating_dungeons numeric,
  recommended_sets text[],
  stat_priority text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  champion_id uuid NOT NULL REFERENCES public.champions(id) ON DELETE CASCADE,
  ord int NOT NULL,
  name_ru text NOT NULL,
  description_ru text NOT NULL,
  cooldown int
);

CREATE INDEX idx_skills_champion ON public.skills(champion_id);
CREATE INDEX idx_champions_faction ON public.champions(faction);
CREATE INDEX idx_champions_affinity ON public.champions(affinity);
CREATE INDEX idx_champions_rarity ON public.champions(rarity);
CREATE INDEX idx_champions_role ON public.champions(role);

ALTER TABLE public.champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Champions are publicly readable"
  ON public.champions FOR SELECT
  USING (true);

CREATE POLICY "Skills are publicly readable"
  ON public.skills FOR SELECT
  USING (true);
