"""
RSL Codex — парсер чемпионов с HellHades.

Парсит публичную страницу со списком героев Raid: Shadow Legends
и сохраняет результат в champions.json в формате, совместимом
со схемой таблицы `champions` в Supabase / Lovable Cloud.

Использование:
    pip install requests beautifulsoup4 lxml python-slugify
    python scripts/parser.py --out data/champions.json --limit 50

Затем загрузите champions.json в Supabase любым удобным способом
(SQL INSERT, supabase-py, или через Lovable Cloud SQL editor).
"""

from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

import requests
from bs4 import BeautifulSoup
from slugify import slugify

BASE_URL = "https://hellhades.com"
INDEX_URL = f"{BASE_URL}/raid/champions/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; RSLCodexBot/1.0; +https://champion-codex.lovable.app)"
    )
}

AFFINITY_MAP = {"magic": "Magic", "force": "Force", "spirit": "Spirit", "void": "Void"}
RARITY_MAP = {
    "legendary": "Legendary",
    "epic": "Epic",
    "rare": "Rare",
    "uncommon": "Uncommon",
    "common": "Common",
}
ROLE_MAP = {"attack": "Attack", "defense": "Defense", "support": "Support", "hp": "HP"}


@dataclass
class Champion:
    slug: str
    name_en: str
    name_ru: str
    faction: str
    affinity: str
    rarity: str
    role: str
    description_ru: str | None
    hellhades_url: str
    rating_cb: float | None
    rating_arena: float | None
    rating_fw: float | None
    rating_dungeons: float | None
    recommended_sets: list[str] | None
    stat_priority: list[str] | None


def fetch(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "lxml")


def discover_champion_links(limit: int) -> list[str]:
    soup = fetch(INDEX_URL)
    links: list[str] = []
    for a in soup.select("a[href*='/raid/champions/']"):
        href = a.get("href", "")
        if href and href.startswith(BASE_URL) and href != INDEX_URL:
            if href not in links:
                links.append(href)
        if len(links) >= limit:
            break
    return links


def parse_rating(text: str) -> float | None:
    match = re.search(r"(\d+(?:\.\d+)?)", text or "")
    return float(match.group(1)) if match else None


def normalise(value: str | None, mapping: dict[str, str]) -> str:
    if not value:
        return ""
    return mapping.get(value.strip().lower(), value.strip())


def parse_champion(url: str) -> Champion | None:
    try:
        soup = fetch(url)
    except requests.HTTPError:
        return None

    name_en = (soup.select_one("h1") or soup.title).get_text(strip=True)
    description = soup.select_one("section.overview p, .champion-overview p")
    desc_text = description.get_text(strip=True) if description else None

    # HellHades рендерит метаданные в data-* атрибутах. Поля могут
    # отличаться, поэтому собираем максимально терпимо.
    meta_box = soup.select_one(".champion-meta, .meta")
    faction = meta_box.select_one("[data-faction]") if meta_box else None
    affinity = meta_box.select_one("[data-affinity]") if meta_box else None
    rarity = meta_box.select_one("[data-rarity]") if meta_box else None
    role = meta_box.select_one("[data-role]") if meta_box else None

    return Champion(
        slug=slugify(name_en),
        name_en=name_en,
        name_ru=name_en,  # переведите вручную или подключите Google Translate
        faction=(faction.get("data-faction") if faction else "Unknown"),
        affinity=normalise(
            affinity.get("data-affinity") if affinity else None, AFFINITY_MAP
        ),
        rarity=normalise(rarity.get("data-rarity") if rarity else None, RARITY_MAP),
        role=normalise(role.get("data-role") if role else None, ROLE_MAP),
        description_ru=desc_text,
        hellhades_url=url,
        rating_cb=parse_rating(_text(soup, "[data-stat='cb']")),
        rating_arena=parse_rating(_text(soup, "[data-stat='arena']")),
        rating_fw=parse_rating(_text(soup, "[data-stat='fw']")),
        rating_dungeons=parse_rating(_text(soup, "[data-stat='dungeons']")),
        recommended_sets=[
            el.get_text(strip=True) for el in soup.select(".recommended-sets li")
        ]
        or None,
        stat_priority=[
            el.get_text(strip=True) for el in soup.select(".stat-priority li")
        ]
        or None,
    )


def _text(soup: BeautifulSoup, selector: str) -> str:
    el = soup.select_one(selector)
    return el.get_text(" ", strip=True) if el else ""


def run(out: Path, limit: int, delay: float) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    champions: list[dict] = []

    for url in discover_champion_links(limit):
        champ = parse_champion(url)
        if champ:
            champions.append(asdict(champ))
            print(f"✓ {champ.name_en}")
        time.sleep(delay)

    out.write_text(json.dumps(champions, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nГотово: {len(champions)} героев → {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=Path("data/champions.json"))
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--delay", type=float, default=1.0, help="Секунд между запросами")
    args = parser.parse_args()
    run(args.out, args.limit, args.delay)
