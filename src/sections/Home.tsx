import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Mail,
  Microscope,
  MoveRight,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";
import { useSite } from "../store";
import { ACRONYM, LINE_META, type LineKey, type NewsItem } from "../types";
import {
  Avatar,
  btnOrange,
  btnPrimary,
  btnSecondary,
  Inline,
  InstagramIcon,
  Reveal,
  SectionHeading,
  SiteImage,
  T,
} from "../components/ui";
import { cn } from "../utils/cn";

/* ------------------------------------- News carousel ------------------------------------- */

function useCarousel(count: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setIndex((i) => (count === 0 ? 0 : Math.min(i, count - 1)));
  }, [count]);

  const next = useCallback(() => setIndex((i) => (count ? (i + 1) % count : 0)), [count]);
  const prev = useCallback(() => setIndex((i) => (count ? (i - 1 + count) % count : 0)), [count]);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const timer = window.setTimeout(next, 7000);
    return () => window.clearTimeout(timer);
  }, [index, paused, reduced, count, next]);

  const onPointerDown = (e: React.PointerEvent) => {
    touchX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (touchX.current === null) return;
    const delta = e.clientX - touchX.current;
    if (Math.abs(delta) > 45) {
      if (delta < 0) next();
      else prev();
    }
    touchX.current = null;
  };

  return { index, setIndex, next, prev, paused, setPaused, reduced, onPointerDown, onPointerUp };
}

function NewsAction({ item }: { item: NewsItem }) {
  const { goTo } = useSite();
  if (item.targetType === "none" || !item.buttonText.trim()) return null;
  if (item.targetType === "external") {
    if (!item.externalUrl.trim()) return null;
    return (
      <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className={btnOrange}>
        {item.buttonText}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }
  return (
    <button type="button" onClick={() => goTo(item.targetTab, item.targetSection || undefined)} className={btnOrange}>
      {item.buttonText}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function NewsCarousel() {
  const { content, update } = useSite();
  const items = useMemo(() => content.news.filter((n) => !n.hidden), [content.news]);
  const { index, setIndex, next, prev, paused, setPaused, onPointerDown, onPointerUp } = useCarousel(items.length);

  const patchNews = (id: string, patch: Partial<NewsItem>) =>
    update((draft) => {
      const target = draft.news.find((n) => n.id === id);
      if (target) Object.assign(target, patch);
    });

  return (
    <Reveal id="noticias" className="scroll-mt-32">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-p">
            <span className="rainbow-bar h-1 w-7 rounded-full" aria-hidden="true" />
            <T id="noticias-eyebrow" fallback="Acontece no PANDORA" />
          </div>
          <T
            as="h2"
            id="noticias-titulo"
            fallback="Notícias e eventos"
            className="font-display text-2xl font-bold tracking-tight text-ink md:text-[32px]"
          />
          <T
            as="p"
            id="noticias-desc"
            fallback="Seleções, encontros e ações de divulgação científica do grupo."
            className="mt-1 text-sm text-[#4a6a86]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d3e4f2] bg-white text-brand-deep transition hover:bg-[#eef7fd]"
            aria-label={paused ? "Retomar passagem automática das notícias" : "Pausar passagem automática das notícias"}
            aria-pressed={paused}
          >
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={prev}
            disabled={items.length < 2}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d3e4f2] bg-white text-brand-deep transition hover:bg-[#eef7fd] disabled:opacity-40"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={items.length < 2}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-deep disabled:opacity-40"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface rounded-3xl p-8 text-center text-sm text-[#4a6a86]">
          Nenhuma notícia publicada no momento. Use o PANDORA Studio para adicionar uma notícia.
        </div>
      ) : (
        <div
          className="surface relative overflow-hidden rounded-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="region"
          aria-roledescription="carrossel"
          aria-label="Notícias e eventos do PANDORA"
        >
          <div className="rainbow-bar h-1.5 w-full" aria-hidden="true" />
          <div className="overflow-hidden" style={{ touchAction: "pan-y" }}>
            <div className="carousel-track flex" style={{ transform: `translateX(-${index * 100}%)` }}>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="carousel-slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} de ${items.length}`}
                  aria-hidden={i !== index}
                  inert={i !== index ? true : undefined}
                >
                  <div className="grid md:grid-cols-[1.55fr_1fr]">
                    <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 md:p-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdeee2] px-2.5 py-1 font-display text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-[#b9530f] ring-1 ring-[#f5cfb2]">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            {item.tag}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5fb] px-2.5 py-1 text-[10.5px] font-semibold text-[#3c6285]">
                            <CalendarDays className="h-3 w-3" aria-hidden="true" />
                            {content.notices[0]?.status === "Aberto" && i === 0 ? "Inscrições abertas" : "Agenda do grupo"}
                          </span>
                        </div>
                        <Inline
                          as="h3"
                          value={item.title}
                          label="título da notícia"
                          onCommit={(value) => patchNews(item.id, { title: value })}
                          className="mt-3.5 max-w-xl font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl md:text-[26px]"
                        />
                        <Inline
                          as="p"
                          value={item.description}
                          label="descrição da notícia"
                          multiline
                          onCommit={(value) => patchNews(item.id, { description: value })}
                          className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-[#4a6a86]"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <NewsAction item={item} />
                        <span className="text-[11px] font-medium text-[#6c8aa4]">{item.meta}</span>
                      </div>
                    </div>

                    <div className="dark-mesh relative hidden overflow-hidden p-6 text-white md:flex md:flex-col md:justify-between">
                      <div
                        className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full border-[22px] border-white/10"
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full border-[18px] border-white/10"
                        aria-hidden="true"
                      />
                      <div className="relative flex items-center justify-between">
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                          PANDORA em movimento
                        </span>
                        <span className="rainbow-ring h-7 w-7 rounded-full shadow-lg" aria-hidden="true" />
                      </div>
                      <div className="relative mt-8">
                        <div className="font-display text-[64px] font-extrabold leading-none tracking-tighter text-white/90">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="mt-1 h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg,#f9bd19,#ed7128,#8e207d)" }} aria-hidden="true" />
                        <p className="mt-4 max-w-[210px] text-[12px] leading-relaxed text-white/75">
                          Pesquisa, extensão e formação de professoras(es)-pesquisadoras(es) no sertão paraibano.
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-[#9fe3c3]">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ee1a0]" aria-hidden="true" />
                          Campus Patos · UFCG
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7eff7] bg-white/80 px-5 py-3">
            <div className="flex items-center gap-1.5" role="group" aria-label="Indicadores das notícias">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`Ir para a notícia ${i + 1}: ${item.title}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-7 bg-brand" : "w-3 bg-[#c9deee] hover:bg-[#9cc3e2]",
                  )}
                />
              ))}
            </div>
            <span className="text-[10.5px] font-medium text-[#7b95ac]">
              {index + 1} / {items.length} · Arraste para navegar
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {items[index] ? `Notícia ${index + 1} de ${items.length}: ${items[index].title}` : ""}
          </p>
        </div>
      )}
    </Reveal>
  );
}

/* ------------------------------------- Hero ------------------------------------- */

function Hero() {
  const { content, goTo } = useSite();
  const openNotice = content.notices.find((n) => n.status === "Aberto");
  const vacancies = openNotice
    ? openNotice.vacancies.TED + openNotice.vacancies.GIO + openNotice.vacancies.CTS + openNotice.vacancies.externo
    : 0;

  return (
    <Reveal>
      <div className="surface relative overflow-hidden rounded-[26px]">
        <div className="rainbow-bar absolute inset-x-0 top-0 z-10 h-1.5" aria-hidden="true" />
        <div className="hero-mesh">
          <div className="grid items-center gap-8 px-5 pb-7 pt-8 sm:px-7 md:px-9 lg:grid-cols-[1.04fr_1fr] lg:gap-10 lg:pb-9 lg:pt-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe4f4] bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                  <Microscope className="h-3 w-3" aria-hidden="true" />
                  Macroprojeto e Grupo de Pesquisa
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f7ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0f7542]">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-p" aria-hidden="true" />
                  UACB · CSTR · UFCG
                </span>
              </div>

              <h1 className="mt-4 font-display text-[52px] font-extrabold leading-[0.92] tracking-[-0.04em] text-ink sm:text-[64px] lg:text-[72px]">
                PANDORA<span className="text-orange-p">.</span>
              </h1>
              <p className="mt-2 max-w-lg font-display text-[15px] font-semibold leading-snug text-brand-deep sm:text-[17px]">
                <T
                  id="hero-nome"
                  fallback="Práticas Analíticas e Narrativas de Democratização, Ontologia e Resistência Ativa"
                />
              </p>
              <div className="mt-3 flex h-1.5 w-32 overflow-hidden rounded-full" aria-hidden="true">
                {ACRONYM.map((item) => (
                  <span key={item.letter + item.word} className="h-full flex-1" style={{ background: item.color }} />
                ))}
              </div>
              <T
                as="p"
                id="hero-texto"
                fallback="Somos um grupo de pesquisa dedicado ao Ensino de Ciências e Tecnologias. Abrimos caixas-pretas da ciência para formar pesquisadoras(es) críticas(os), valorizar narrativas silenciadas e democratizar o conhecimento."
                className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-[#41637f] sm:text-sm"
              />

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => goTo("inicio", "sobre")} className={btnPrimary}>
                  Conhecer o PANDORA
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => goTo("editais", "edital-2026-01")} className={btnSecondary}>
                  <GraduationCap className="h-4 w-4 text-green-p" aria-hidden="true" />
                  {openNotice ? "Ver edital aberto" : "Ver editais"}
                </button>
              </div>

              <dl className="mt-6 grid max-w-lg grid-cols-3 gap-2 border-t border-[#dceaf5] pt-4">
                {[
                  { value: "3", label: "linhas temáticas", color: "#12619a" },
                  { value: vacancies ? String(vacancies) : "—", label: "vagas nesta seleção", color: "#ed7128" },
                  { value: String(content.members.length), label: "integrantes", color: "#8e207d" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="font-display text-2xl font-extrabold tracking-tight" style={{ color: stat.color }}>
                        {stat.value}
                      </span>
                      <span className="ml-1 block text-[10px] font-medium uppercase leading-tight tracking-wide text-[#6c8aa4]">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="rainbow-ring rounded-[22px] p-[3px] shadow-[0_26px_60px_-30px_rgba(13,58,102,0.55)]">
                <div className="overflow-hidden rounded-[20px] bg-white">
                  <SiteImage
                    imageKey="cover"
                    loading="eager"
                    imgClassName="h-auto w-full object-contain lg:max-h-[350px]"
                    className="aspect-[16/10] w-full"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#dceaf5] bg-white/85 px-3 py-2.5 backdrop-blur">
                <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-deep">
                  <span className="rainbow-ring h-2.5 w-2.5 rounded-full" aria-hidden="true" />
                  Ensino · Pesquisa · Extensão
                </span>
                <span className="rounded-full bg-[#f3f9fe] px-2 py-0.5 text-[10px] font-semibold text-[#5c7c98]">
                  Campus Patos — PB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------- About ------------------------------------- */

function About() {
  return (
    <Reveal id="sobre" className="scroll-mt-32">
      <div className="surface overflow-hidden rounded-3xl">
        <div className="grid gap-7 p-5 sm:p-7 md:p-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <div className="order-2 lg:order-1">
            <div className="rainbow-ring rounded-[22px] p-[3px]">
              <div className="relative overflow-hidden rounded-[19px] bg-white">
                <SiteImage
                  imageKey="about"
                  imgClassName="h-auto w-full object-contain p-4"
                  className="aspect-square w-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0e2340]/85 to-transparent p-3.5">
                  <p className="text-[11px] font-medium leading-snug text-white/90">
                    “Abrir caixas-pretas é um gesto metodológico: perguntar quem produz, para quem e com quais interesses.”
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { icon: Microscope, label: "Pesquisa" },
                { icon: GraduationCap, label: "Formação" },
                { icon: Sparkles, label: "Extensão" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e0ecf6] bg-[#f8fbfe] px-2 py-2 text-[10.5px] font-semibold text-[#41637f]"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
              <span className="rainbow-bar h-1 w-7 rounded-full" aria-hidden="true" />
              <T id="sobre-eyebrow" fallback="Quem somos" />
            </div>
            <T
              as="h2"
              id="sobre-titulo"
              fallback="O que é o PANDORA?"
              className="font-display text-2xl font-bold tracking-tight text-ink md:text-[32px]"
            />
            <T
              as="p"
              id="sobre-subtitulo"
              fallback="Um nome que é programa de pesquisa: cada letra indica um compromisso teórico-metodológico."
              className="mt-2 text-[13.5px] leading-relaxed text-[#4a6a86]"
            />

            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {ACRONYM.map((item) => (
                <li
                  key={`${item.letter}-${item.word}`}
                  className="flex items-center gap-2.5 rounded-xl border border-[#e6eff7] bg-white/80 px-2.5 py-2 transition hover:border-[#cfe3f2]"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-[15px] font-extrabold text-white shadow-sm"
                    style={{ background: item.color }}
                    aria-hidden="true"
                  >
                    {item.letter}
                  </span>
                  <span className="text-[12.5px] font-semibold leading-tight text-[#23435f]">{item.word}</span>
                </li>
              ))}
              <li className="flex items-center gap-2.5 rounded-xl border border-dashed border-[#d8e6f2] bg-[#f8fbfe] px-2.5 py-2">
                <span className="rainbow-ring h-7 w-7 shrink-0 rounded-full" aria-hidden="true" />
                <span className="text-[11px] font-semibold leading-tight text-[#5c7c98]">PANDORA em movimento</span>
              </li>
            </ul>

            <div className="mt-4 space-y-3">
              <T
                as="p"
                id="sobre-p1"
                fallback="O PANDORA é um macroprojeto e grupo de pesquisa voltado ao Ensino de Ciências e Tecnologias, inspirado no gesto de abrir caixas-pretas da ciência e da tecnologia. Propõe uma reestruturação teórico-metodológica da iniciação à pesquisa, articulando formação investigativa, criticidade e compromisso social."
                className="text-[13.5px] leading-relaxed text-[#41637f]"
              />
              <T
                as="p"
                id="sobre-p2"
                fallback="Suas ações valorizam narrativas historicamente silenciadas, problematizam as relações entre ciência, tecnologia, sociedade e ambiente e promovem democratização do conhecimento, resistência ativa e formação de professoras(es)-pesquisadoras(es)."
                className="text-[13.5px] leading-relaxed text-[#41637f]"
              />
            </div>
            <div className="mt-4 inline-flex items-start gap-2 rounded-xl bg-[#f0f8f3] px-3 py-2 text-[11.5px] leading-snug text-[#23694a] ring-1 ring-[#cfe9d9]">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-p" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Práticas de abertura:</strong> ler o Macroprojeto é pré-requisito para
                participar das seleções do grupo.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------- Thematic lines ------------------------------------- */

const LINES: { key: Exclude<LineKey, "OUTRAS">; image: string; title: string }[] = [
  { key: "GIO", image: "gio", title: "Gênero, Interseccionalidade e Ontologia" },
  { key: "TED", image: "ted", title: "Tecnologias Emergentes e Democratização" },
  { key: "CTS", image: "cts", title: "Ciência, Tecnologia, Sociedade e Ambiente" },
];

function Lines() {
  const { goTo } = useSite();
  return (
    <Reveal id="linhas" className="scroll-mt-32">
      <SectionHeading
        eyebrow="Pesquisa em três frentes"
        eyebrowClass="text-green-p"
        title="Linhas temáticas"
        titleId="linhas-titulo"
        description="Três linhas articuladas pelo compromisso com a democratização do conhecimento e a formação investigativa."
        descriptionId="linhas-desc"
        action={
          <button type="button" onClick={() => goTo("pesquisa", "projetos")} className={btnSecondary}>
            Ver projetos e membros
            <MoveRight className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {LINES.map(({ key, image, title }, i) => {
          const meta = LINE_META[key];
          return (
            <article
              key={key}
              className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-[#dce9f5] bg-white"
              style={{ borderTop: `4px solid ${meta.color}` }}
            >
              <div className="relative flex items-center justify-center overflow-hidden px-5 pb-2 pt-5" style={{ background: meta.soft }}>
                <div
                  className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20"
                  style={{ background: meta.color }}
                  aria-hidden="true"
                />
                <SiteImage
                  imageKey={image}
                  imgClassName="relative h-28 w-auto max-w-[160px] object-contain transition duration-300 group-hover:scale-[1.04]"
                  className="relative h-28 w-40"
                />
                <span
                  className="absolute left-4 top-4 rounded-md px-2 py-1 font-display text-[10px] font-extrabold tracking-[0.14em] text-white shadow-sm"
                  style={{ background: meta.color }}
                >
                  {meta.short}
                </span>
                <span className="absolute right-4 top-4 font-display text-[10px] font-bold text-[#7b95ac]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-[16px] font-bold leading-snug tracking-tight text-ink">{title}</h3>
                <T
                  as="p"
                  id={`linha-${key}-desc`}
                  fallback={meta.description ?? ""}
                  className="mt-2 flex-1 text-[12.5px] leading-relaxed text-[#4a6a86]"
                />
                <p className="mt-3 font-display text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: meta.color }}>
                  {meta.refs}
                </p>
                <button
                  type="button"
                  onClick={() => goTo("pesquisa", "projetos")}
                  className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold transition group-hover:gap-2.5"
                  style={{ color: meta.color }}
                >
                  Explorar a linha
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ------------------------------------- Contact ------------------------------------- */

function Contact() {
  const { content } = useSite();
  const coordinator = content.members.find((m) => m.category === "coordenacao");
  return (
    <Reveal id="contato" className="scroll-mt-32">
      <div className="dark-mesh relative overflow-hidden rounded-3xl px-5 py-8 text-white sm:px-8 md:px-10 md:py-10">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[28px] border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full border-[22px] border-white/10"
          aria-hidden="true"
        />
        <div className="relative grid gap-7 md:grid-cols-[1.35fr_1fr] md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#9fe3c3]">
              <span className="rainbow-ring h-2.5 w-2.5 rounded-full" aria-hidden="true" />
              <T id="contato-eyebrow" fallback="Contato" />
            </div>
            <T
              as="h2"
              id="contato-titulo"
              fallback="Quer pesquisar com a gente?"
              className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
            />
            <T
              as="p"
              id="contato-texto"
              fallback="Acompanhe editais, encontros e ações de divulgação científica. Escreva para o grupo para propor parcerias, tirar dúvidas sobre as linhas temáticas ou saber mais sobre o processo seletivo."
              className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/75"
            />
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={content.settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#8e207d] transition hover:bg-[#fbeff8]"
              >
                <InstagramIcon className="h-4 w-4" />
                {content.settings.instagram}
              </a>
              <a
                href={`mailto:${content.settings.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Mail className="h-4 w-4 text-[#f9bd19]" aria-hidden="true" />
                {content.settings.email}
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Coordenação</p>
            <div className="mt-2.5 flex items-center gap-3">
              <Avatar name={coordinator?.name ?? "Maria Kamylla"} color="#ed7128" />
              <div>
                <p className="font-display text-[13.5px] font-bold leading-tight">
                  {coordinator?.name ?? "Profa. Dra. Maria Kamylla e Silva Xavier"}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-white/70">
                  {coordinator?.role ?? "Coordenadora e proponente · UACB/CSTR/UFCG"}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-white/15 pt-3 text-[11px] leading-relaxed text-white/70">
              <p className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#f9bd19]" aria-hidden="true" />
                Reuniões semanais de orientação
              </p>
              <p className="mt-1 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-[#9fe3c3]" aria-hidden="true" />
                Iniciação à pesquisa · PIBIC · PROBEX
              </p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Home() {
  return (
    <div className="space-y-12 md:space-y-16">
      <Hero />
      <NewsCarousel />
      <About />
      <Lines />
      <Contact />
    </div>
  );
}
