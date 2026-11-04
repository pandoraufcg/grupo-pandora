import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, FileText, Filter, Search, X } from "lucide-react";
import { useSite } from "../store";
import { LINE_META, type LineKey, type Publication } from "../types";
import { btnPrimary, btnSecondary, Inline, LineBadge, PageHero, Reveal, T } from "../components/ui";
import { cn } from "../utils/cn";

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const TYPE_STYLES: Record<string, string> = {
  Artigo: "bg-[#e8f2fb] text-[#0d3a66] ring-[#c5dff3]",
  TCC: "bg-[#e9f7ef] text-[#0f7542] ring-[#bfe8d1]",
  Capítulo: "bg-[#f7e9f3] text-[#8e207d] ring-[#ecc9e1]",
  "Resumo expandido": "bg-[#fdf0e7] text-[#b9530f] ring-[#f5cfb2]",
};

const selectCls =
  "w-full appearance-none rounded-xl border border-[#cfe0ee] bg-white px-3 py-2.5 text-[12.5px] font-medium text-[#23435f] shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-[#2f80c2]/20";

export function Publications() {
  const { content, update } = useSite();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [author, setAuthor] = useState("all");
  const [line, setLine] = useState("all");

  const years = useMemo(
    () => Array.from(new Set(content.publications.map((p) => p.year))).sort((a, b) => b - a),
    [content.publications],
  );
  const authors = useMemo(
    () => Array.from(new Set(content.publications.map((p) => p.authors))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [content.publications],
  );
  const lines: LineKey[] = useMemo(
    () => Array.from(new Set(content.publications.map((p) => p.line))),
    [content.publications],
  );

  const filtered = useMemo(() => {
    const q = norm(query);
    return content.publications.filter((p) => {
      const matchesQuery = !q || norm(p.title).includes(q) || norm(p.authors).includes(q);
      const matchesYear = year === "all" || String(p.year) === year;
      const matchesAuthor = author === "all" || p.authors === author;
      const matchesLine = line === "all" || p.line === line;
      return matchesQuery && matchesYear && matchesAuthor && matchesLine;
    });
  }, [content.publications, query, year, author, line]);

  const activeFilters = (query ? 1 : 0) + (year !== "all" ? 1 : 0) + (author !== "all" ? 1 : 0) + (line !== "all" ? 1 : 0);

  const reset = () => {
    setQuery("");
    setYear("all");
    setAuthor("all");
    setLine("all");
  };

  const patch = (id: string, p: Partial<Publication>) =>
    update((draft) => {
      const item = draft.publications.find((pub) => pub.id === id);
      if (item) Object.assign(item, p);
    });

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHero
        eyebrow="Produção científica"
        titleId="publicacoes-titulo"
        title="Publicações"
        descriptionId="publicacoes-desc"
        description="Artigos, TCCs, capítulos e resumos produzidos por integrantes do PANDORA. Use os filtros para encontrar produções por título, autoria, ano ou linha temática."
      >
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#41637f]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 ring-1 ring-[#d7e7f4]">
            <BookOpen className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {content.publications.length} publicações catalogadas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 ring-1 ring-[#d7e7f4]">
            <FileText className="h-3.5 w-3.5 text-green-p" aria-hidden="true" />
            {lines.length} linhas temáticas
          </span>
        </div>
      </PageHero>

      <Reveal>
        <div className="surface rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-brand-deep">
              <Filter className="h-4 w-4 text-brand" aria-hidden="true" />
              Filtrar publicações
            </h2>
            {activeFilters > 0 && (
              <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-p hover:underline">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Limpar {activeFilters} {activeFilters === 1 ? "filtro" : "filtros"}
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_1fr_0.8fr]">
            <div>
              <label htmlFor="filtro-publicacoes" className="studio-label">
                Buscar por título ou autor(a)
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa6bd]" aria-hidden="true" />
                <input
                  id="filtro-publicacoes"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex.: inteligência artificial, Ana Celina…"
                  className={cn(selectCls, "pl-9")}
                />
              </div>
            </div>
            <div>
              <label htmlFor="filtro-ano" className="studio-label">Ano</label>
              <select id="filtro-ano" value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
                <option value="all">Todos os anos</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filtro-autor" className="studio-label">Participante / autor(a)</label>
              <select id="filtro-autor" value={author} onChange={(e) => setAuthor(e.target.value)} className={selectCls}>
                <option value="all">Todas as pessoas</option>
                {authors.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filtro-linha" className="studio-label">Linha temática</label>
              <select id="filtro-linha" value={line} onChange={(e) => setLine(e.target.value)} className={selectCls}>
                <option value="all">Todas as linhas</option>
                {lines.map((l) => (
                  <option key={l} value={l}>{LINE_META[l]?.short ?? l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e8f1f8] pt-3">
            <p className="text-[12px] font-medium text-[#4a6a86]" role="status" aria-live="polite">
              <span className="font-display text-[15px] font-bold text-brand">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "publicação encontrada" : "publicações encontradas"}
              {activeFilters > 0 && <span className="text-[#7b95ac]"> · de {content.publications.length} no total</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5fb] px-2.5 py-1 text-[10px] font-semibold text-[#41637f]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" /> Ano
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5fb] px-2.5 py-1 text-[10px] font-semibold text-[#41637f]">
                <span className="h-1.5 w-1.5 rounded-full bg-green-p" aria-hidden="true" /> Linha
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal id="publicacoes-lista" className="scroll-mt-32">
        <div className="surface overflow-hidden rounded-3xl p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <T
              as="h2"
              id="publicacoes-lista-titulo"
              fallback="Produção do grupo"
              className="font-display text-lg font-bold tracking-tight text-ink"
            />
            <span className="rounded-full bg-[#f3f9fe] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5c7c98] ring-1 ring-[#e1edf7]">
              Catálogo demonstrativo
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9deee] bg-[#fbfdff] px-6 py-12 text-center">
              <Search className="mx-auto h-7 w-7 text-[#9cc3e2]" aria-hidden="true" />
              <p className="mt-2 font-display text-sm font-semibold text-ink">Nenhuma publicação encontrada</p>
              <p className="mt-1 text-[12px] text-[#6c8aa4]">Ajuste a busca ou remova os filtros ativos.</p>
              <button type="button" onClick={reset} className={cn(btnSecondary, "mt-4")}>
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-2xl border border-[#dfebf5] md:block">
                <table className="p-table">
                  <caption className="sr-only">Publicações do grupo PANDORA</caption>
                  <thead>
                    <tr>
                      <th scope="col"><T id="pub-th-ano" fallback="Ano" /></th>
                      <th scope="col"><T id="pub-th-publicacao" fallback="Publicação" /></th>
                      <th scope="col"><T id="pub-th-autoria" fallback="Autoria" /></th>
                      <th scope="col"><T id="pub-th-linha" fallback="Linha" /></th>
                      <th scope="col"><T id="pub-th-tipo" fallback="Tipo" /></th>
                      <th scope="col"><T id="pub-th-acesso" fallback="Acesso" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((pub) => (
                      <tr key={pub.id}>
                        <td className="align-top">
                          <Inline value={String(pub.year)} label="ano" onCommit={(v) => patch(pub.id, { year: Number(v.replace(/\D/g, "")) || pub.year })} className="inline-flex rounded-md bg-[#f3f9fe] px-2 py-1 font-display text-[11px] font-bold text-brand-deep ring-1 ring-[#dceaf5]" />
                        </td>
                        <td className="max-w-[400px] align-top">
                          <Inline value={pub.title} label="título" multiline onCommit={(v) => patch(pub.id, { title: v })} className="font-medium leading-snug text-ink" />
                        </td>
                        <td className="align-top">
                          <Inline value={pub.authors} label="autoria" multiline onCommit={(v) => patch(pub.id, { authors: v })} className="text-[12.5px] text-[#33587a]" />
                        </td>
                        <td className="align-top"><LineBadge line={pub.line} /></td>
                        <td className="align-top">
                          <span className={cn("inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1", TYPE_STYLES[pub.type] ?? "bg-[#f1f5f9] text-[#475569] ring-[#dbe4ec]")}>
                            {pub.type}
                          </span>
                        </td>
                        <td className="align-top">
                          <AccessButton url={pub.url} title={pub.title} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filtered.map((pub) => (
                  <article key={pub.id} className="rounded-2xl border border-[#dfebf5] bg-[#fbfdff] p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-white px-2 py-1 font-display text-[10px] font-bold text-brand-deep ring-1 ring-[#dceaf5]">{pub.year}</span>
                      <LineBadge line={pub.line} />
                      <span className={cn("ml-auto inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ring-1", TYPE_STYLES[pub.type] ?? "bg-[#f1f5f9] text-[#475569] ring-[#dbe4ec]")}>{pub.type}</span>
                    </div>
                    <h3 className="font-display text-[13px] font-semibold leading-snug text-ink">{pub.title}</h3>
                    <p className="mt-1 text-[11.5px] text-[#5c7c98]">{pub.authors}</p>
                    <div className="mt-3"><AccessButton url={pub.url} title={pub.title} /></div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </Reveal>

      <Reveal>
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d9e8f4] bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <T
            as="p"
            id="publicacoes-rodape"
            fallback="Publicações demonstrativas do catálogo do grupo. O botão “Acessar” é habilitado quando existe um link ou DOI cadastrado pelo PANDORA Studio."
            className="max-w-3xl text-[12px] leading-relaxed text-[#4a6a86]"
          />
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f7e9f3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-magenta-p">
            Ciência aberta
          </span>
        </div>
      </Reveal>
    </div>
  );
}

function AccessButton({ url, title }: { url: string; title: string }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Acessar publicação: ${title}`}
        className={cn(btnPrimary, "!px-3 !py-1.5 !text-[11px]")}
      >
        Acessar
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled
      title="Link de acesso não cadastrado"
      aria-label={`Acesso indisponível para: ${title}`}
      className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-[#dbe6ef] bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-semibold text-[#8aa6bd]"
    >
      Acessar
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}
