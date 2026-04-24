import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Database, Filter } from "lucide-react";

const Index = () => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="container relative py-24 md:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Raid: Shadow Legends
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight md:text-7xl">
            <span className="text-gold">RSL Codex</span>
            <br />
            <span className="text-foreground">База чемпионов на русском</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Навыки, оценки для КБ, Арены, ВФ и Подземелий, рекомендуемые сеты и приоритеты статов —
            всё в одном месте, в духе HellHades, но на русском.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/champions">
                Открыть базу чемпионов <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="container py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Database, title: "База чемпионов", text: "50+ героев с навыками, фракциями и стихиями." },
          { icon: Filter, title: "Умный фильтр", text: "По фракции, роли, редкости и стихии за один клик." },
          { icon: Sparkles, title: "Тир-листы", text: "Оценки 1–5★ для всех ключевых режимов игры." },
        ].map((f) => (
          <div key={f.title} className="glass-card p-6">
            <f.icon className="h-7 w-7 text-primary" />
            <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  </main>
);

export default Index;
