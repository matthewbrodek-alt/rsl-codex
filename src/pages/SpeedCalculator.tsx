import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Zap } from "lucide-react";

interface ChampionRow {
  id: string;
  name: string;
  baseSpeed: number;
  speedAuraPct: number; // % бонус от ауры скорости (например 25)
  artifactSpeedPct: number; // % бонус от артефактов/сетов (например 25 за Speed set)
  flatSpeedBonus: number; // плоский бонус из шевронов/глифов
  turnMeterFillPct: number; // % залива полоски хода в начале раунда (0-100)
}

const newRow = (i: number): ChampionRow => ({
  id: crypto.randomUUID(),
  name: `Чемпион ${i}`,
  baseSpeed: 100,
  speedAuraPct: 0,
  artifactSpeedPct: 0,
  flatSpeedBonus: 0,
  turnMeterFillPct: 0,
});

const SpeedCalculator = () => {
  const [rows, setRows] = useState<ChampionRow[]>([newRow(1), newRow(2)]);

  const update = (id: string, patch: Partial<ChampionRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const add = () => setRows((r) => [...r, newRow(r.length + 1)]);
  const remove = (id: string) => setRows((r) => r.filter((row) => row.id !== id));

  const computed = useMemo(() => {
    const enriched = rows.map((r) => {
      // Итоговая скорость: (база * (1 + аура% + артефакты%)) + плоский бонус
      const totalSpeed = Math.max(
        0,
        Math.round(
          r.baseSpeed * (1 + (r.speedAuraPct + r.artifactSpeedPct) / 100) +
            r.flatSpeedBonus,
        ),
      );
      // Время до 1-го хода: TM до 100% при заливе. Полоска заполняется со скоростью totalSpeed * tick.
      // Используем условную метрику: количество "тиков" до хода = (100 - залив%) / (totalSpeed * 0.07)
      // 0.07 — стандартный коэффициент полоски хода в RSL.
      const remainingTm = Math.max(0, 100 - r.turnMeterFillPct);
      const ticksToTurn = totalSpeed > 0 ? remainingTm / (totalSpeed * 0.07) : Infinity;
      return { ...r, totalSpeed, ticksToTurn };
    });
    // Порядок хода — чем меньше ticksToTurn, тем раньше ход
    const order = [...enriched].sort((a, b) => a.ticksToTurn - b.ticksToTurn);
    return { enriched, order };
  }, [rows]);

  return (
    <main className="container py-10">
      <header className="glass-card p-8">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl font-bold text-gold">Калькулятор скоростей</h1>
        </div>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Рассчитайте итоговую скорость чемпионов с учётом ауры, артефактов, плоских бонусов и
          залива полоски хода. Результат — итоговая скорость и порядок ходов на первом раунде.
        </p>
        <p className="mt-2 text-xs text-muted-foreground/80">
          Формула: <code className="text-primary">итог = база × (1 + аура% + сеты%) + плоский</code>.
          Тики до хода: <code className="text-primary">(100 − залив%) / (итог × 0.07)</code>.
        </p>
      </header>

      <section className="mt-8 space-y-4">
        {computed.enriched.map((r, idx) => (
          <div key={r.id} className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Input
                value={r.name}
                onChange={(e) => update(r.id, { name: e.target.value })}
                className="max-w-xs font-display text-lg"
              />
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Итог</div>
                  <div className="font-display text-2xl font-bold text-gold">{r.totalSpeed}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(r.id)}
                  disabled={rows.length <= 1}
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="База скорости" value={r.baseSpeed} onChange={(v) => update(r.id, { baseSpeed: v })} />
              <Field label="Аура скорости, %" value={r.speedAuraPct} onChange={(v) => update(r.id, { speedAuraPct: v })} />
              <Field label="Сеты/арт., %" value={r.artifactSpeedPct} onChange={(v) => update(r.id, { artifactSpeedPct: v })} />
              <Field label="Плоский бонус" value={r.flatSpeedBonus} onChange={(v) => update(r.id, { flatSpeedBonus: v })} />
              <Field label="Залив TM, %" value={r.turnMeterFillPct} onChange={(v) => update(r.id, { turnMeterFillPct: Math.min(100, Math.max(0, v)) })} />
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Тики до 1-го хода: <span className="text-primary font-semibold">{Number.isFinite(r.ticksToTurn) ? r.ticksToTurn.toFixed(2) : "—"}</span>
              {" · "}Позиция #{idx + 1}
            </div>
          </div>
        ))}

        <Button onClick={add} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Добавить чемпиона
        </Button>
      </section>

      <section className="mt-8 glass-card p-6">
        <h2 className="font-display text-xl font-semibold text-gold">Порядок ходов (1-й раунд)</h2>
        <ol className="mt-4 space-y-2">
          {computed.order.map((r, i) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <span className="font-medium">{r.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                СПД <span className="text-foreground font-semibold">{r.totalSpeed}</span>
                {" · "}Тики <span className="text-foreground font-semibold">{Number.isFinite(r.ticksToTurn) ? r.ticksToTurn.toFixed(2) : "—"}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
};

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    <Input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
    />
  </div>
);

export default SpeedCalculator;
