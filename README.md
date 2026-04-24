# RSL Codex

Русскоязычный кодекс по **Raid: Shadow Legends** — база чемпионов, поиск и фильтры
(фракция / стихия / редкость / роль), карточка героя со скиллами и оценками,
а также **калькулятор скоростей** с учётом аур, артефактов и заполнения полоски хода.

Стек: **React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase (Lovable Cloud)**.

---

## 1. Установка

```bash
# 1) зависимости (выберите ваш менеджер пакетов)
npm install        # или: bun install / pnpm install

# 2) переменные окружения
cp .env.example .env   # затем впишите ключи из Lovable Cloud / Supabase

# 3) запуск
npm run dev
```

Откройте http://localhost:8080.

### Переменные окружения (`.env`)

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=<project ref>
```

> В Lovable Cloud этот файл генерируется автоматически — править вручную не нужно.

---

## 2. Структура проекта

```
src/
├── components/
│   ├── ChampionCard.tsx        # карточка героя в сетке (glassmorphism)
│   ├── SiteHeader.tsx          # верхняя навигация
│   ├── StarRating.tsx          # звёзды-оценки 0–5
│   └── ui/                     # shadcn/ui примитивы (Input, Button, Card, …)
├── pages/
│   ├── Index.tsx               # лендинг
│   ├── Champions.tsx           # список + умный фильтр + поиск
│   ├── ChampionDetail.tsx      # карточка героя со скиллами
│   ├── SpeedCalculator.tsx     # калькулятор скоростей
│   └── NotFound.tsx
├── lib/
│   ├── champions.ts            # типы Champion/Skill, словари RU, цветовые классы
│   └── utils.ts
├── integrations/supabase/      # клиент и автогенерируемые типы
├── index.css                   # дизайн-токены (HSL), .glass-card, акценты редкости
└── main.tsx

scripts/
└── parser.py                   # парсер HellHades → champions.json

supabase/
├── config.toml
└── migrations/                 # SQL: таблицы champions, skills, RLS, сидинг
```

### Дизайн-система

- Тёмная тема, золотой акцент `--primary: 38 90% 55%`, акцент `--accent: 280 70% 60%`.
- Цвета редкости: `--rarity-legendary` (золото), `--rarity-epic` (фиолет), `--rarity-rare` (синий).
- Цвета стихий: `--affinity-magic / force / spirit / void`.
- Эффект «transparent blur» — класс `.glass-card` в `src/index.css`.
- Шрифты: **Cinzel** (заголовки), **Inter** (текст).

> Все цвета — в HSL и подключаются через `hsl(var(--token))`. Не пишите цвета прямо
> в компонентах (`bg-white`, `text-black` и т.п.) — используйте семантические токены.

---

## 3. Ключевой функционал

### 3.1 Умный фильтр (`/champions`)

Реализован в `src/pages/Champions.tsx` через `useMemo` + цепочку `.filter()`:

```ts
list
  .filter(c => !query    || c.name_ru.toLowerCase().includes(query))
  .filter(c => !faction  || c.faction === faction)
  .filter(c => !affinity || c.affinity === affinity)
  .filter(c => !rarity   || c.rarity === rarity)
  .filter(c => !role     || c.role === role)
  .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);
```

Чтобы добавить фильтр «по навыку» (например, *Defence Down*), расширьте запрос:

```ts
const { data } = await supabase
  .from('champions')
  .select('*, skills!inner(description_ru)')
  .ilike('skills.description_ru', '%штраф защиты%');
```

### 3.2 Карточка героя (`/champions/:slug`)

`src/pages/ChampionDetail.tsx` подгружает чемпиона по `slug`, его скиллы из таблицы
`skills` и рендерит звёзды-оценки (CB / Arena / FW / Dungeons), рекомендуемые сеты и
порядок прокачки статов.

### 3.3 Калькулятор скоростей (`/speed-calculator`)

`src/pages/SpeedCalculator.tsx`. Формулы:

```
totalSpeed   = baseSpeed * (1 + (aura% + artifact%) / 100) + flatBonus
ticksToTurn  = (100 - turnMeter%) / (totalSpeed * 0.07)
```

Сортировка по `ticksToTurn` (по возрастанию) даёт **порядок ходов** в первом раунде.

---

## 4. База данных (Supabase / Lovable Cloud)

### Таблицы

`champions`
| поле | тип | описание |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `slug` | text unique | для URL `/champions/:slug` |
| `name_en`, `name_ru` | text | имена |
| `faction` | text | Banner Lords, Sacred Order, … |
| `affinity` | text | Magic / Force / Spirit / Void |
| `rarity` | text | Legendary / Epic / Rare / … |
| `role` | text | Attack / Defense / Support / HP |
| `description_ru` | text | биография |
| `hellhades_url` | text | ссылка на источник |
| `rating_cb / arena / fw / dungeons` | numeric | оценки 0–5 |
| `recommended_sets` | text[] | список сетов |
| `stat_priority` | text[] | порядок статов |

`skills`
| поле | тип | описание |
|---|---|---|
| `id` | uuid (PK) | |
| `champion_id` | uuid → champions.id | |
| `ord` | int | порядок A1, A2, A3, A4 |
| `name_ru` | text | название скилла |
| `description_ru` | text | описание |
| `cooldown` | int | КД в ходах |

### RLS

Обе таблицы — **публично читаемые** (политика `USING (true)` на `SELECT`),
запись/обновление/удаление закрыты. Сидинг данных — только из миграций или панели Supabase.

Готовая миграция со схемой и сидом 50 героев лежит в `supabase/migrations/`.

---

## 5. Парсер HellHades (`scripts/parser.py`)

```bash
pip install requests beautifulsoup4 lxml python-slugify
python scripts/parser.py --out data/champions.json --limit 50
```

На выходе — `data/champions.json` в формате колонок таблицы `champions`. Дальше:

**Вариант А — через SQL**

```sql
-- В SQL editor Supabase:
insert into public.champions (slug, name_en, name_ru, faction, affinity, rarity, role, hellhades_url)
values ('kael', 'Kael', 'Каэль', 'Dark Elves', 'Magic', 'Rare', 'Attack', 'https://hellhades.com/raid/kael/');
```

**Вариант Б — через `supabase-py`**

```python
from supabase import create_client
import json, os

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE'])
with open('data/champions.json', encoding='utf-8') as f:
    supabase.table('champions').upsert(json.load(f), on_conflict='slug').execute()
```

> Используйте **service_role** ключ только локально — никогда не коммитьте его и
> не выкладывайте в браузер. Для вставки также можно временно ослабить RLS.

⚠️ HellHades рендерит часть данных через JS — если селекторы сломаются, замените
их в `parser.py` или используйте Firecrawl / Playwright.

---

## 6. Скрипты npm

| команда | что делает |
|---|---|
| `npm run dev` | dev-сервер Vite на :8080 |
| `npm run build` | прод-сборка в `dist/` |
| `npm run preview` | локальный просмотр `dist/` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

---

## 7. Дальнейшие идеи

- Конструктор талантов (drag-and-drop по сетке мастерств).
- Сохранение билдов в Supabase под аккаунтом пользователя (включить Auth + RLS по `auth.uid()`).
- Переключатель RU / EN.
- Импорт скиллов отдельным проходом парсера.
- Edge Function для пересчёта рейтингов по агрегированным данным.

---

## Лицензия

Проект учебный/некоммерческий. Все названия и иконки игры **Raid: Shadow Legends**
принадлежат **Plarium Games**. Данные — собственные оценки + публичная информация
с [HellHades](https://hellhades.com).
