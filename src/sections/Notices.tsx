import { useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Info,
  Landmark,
  Link2,
  ShieldQuestion,
  Sparkles,
  Users,
} from "lucide-react";
import { useSite } from "../store";
import { LINE_META, type Notice, type NoticeStatus } from "../types";
import { btnGreen, btnPrimary, btnSecondary, Inline, PageHero, Reveal, T } from "../components/ui";
import { cn } from "../utils/cn";

/* ---------------------------------- helpers ---------------------------------- */

const STATUS_STYLE: Record<NoticeStatus, { chip: string; dot: string; label: string }> = {
  Aberto: {
    chip: "bg-[#e9f7ef] text-[#0f7542] ring-[#b7e5cd]",
    dot: "#138d50",
    label: "Inscrições abertas",
  },
  Encerrado: {
    chip: "bg-[#eef2f6] text-[#4a6280] ring-[#d6e1eb]",
    dot: "#7b95ac",
    label: "Edital encerrado",
  },
  "Em breve": {
    chip: "bg-[#fdf6df] text-[#9a6b06] ring-[#f2dfa4]",
    dot: "#f9bd19",
    label: "Em breve",
  },
};

function localISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatBR(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

export function isAppealActive(notice: Notice, today = localISO()) {
  if (!notice.appealStart || !/^https:\/\//i.test(notice.appealUrl)) return false;
  if (today < notice.appealStart) return false;
  if (notice.appealEnd && today > notice.appealEnd) return false;
  return true;
}

const TH_ORDER: Record<NoticeStatus, number> = { Aberto: 0, "Em breve": 1, Encerrado: 2 };

/* ---------------------------------- schedule table ---------------------------------- */

function ScheduleTable({ notice }: { notice: Notice }) {
  const { update } = useSite();
  const header = notice.schedule[0] ?? [];
  const rows = notice.schedule.slice(1);
  const style = notice.scheduleStyle;
  const cellStyle: React.CSSProperties = {
    fontSize: style.fontSize,
    color: style.textColor,
    padding: `${style.cellPadding}px`,
    lineHeight: 1.45,
  };

  const patchCell = (rowIndex: number, colIndex: number, value: string) =>
    update((draft) => {
      const target = draft.notices.find((n) => n.id === notice.id);
      if (!target) return;
      const r = rowIndex + 1;
      while (target.schedule.length <= r) target.schedule.push([]);
      while (target.schedule[r].length <= colIndex) target.schedule[r].push("");
      target.schedule[r][colIndex] = value;
    });

  return (
    <div>
      <div className="hidden overflow-x-auto rounded-xl border border-[#dfebf5] md:block">
        <table className="w-full border-collapse" style={{ fontSize: style.fontSize }}>
          <caption className="sr-only">Cronograma do edital {notice.number}</caption>
          <thead>
            <tr>
              {header.map((cell, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap border-b border-[#d8e6f2] text-left font-display text-[11px] font-bold uppercase tracking-[0.07em]"
                  style={{ background: style.headerBg, color: style.textColor, padding: `${style.cellPadding}px` }}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ background: style.striped && rowIndex % 2 === 1 ? "#f8fbfe" : "#fff" }}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="border-b border-[#e9f0f6] align-top last:border-0"
                    style={cellStyle}
                  >
                    <Inline
                      value={cell}
                      label={`${header[colIndex] ?? "cronograma"} da etapa`}
                      multiline
                      onCommit={(v) => patchCell(rowIndex, colIndex, v)}
                      className={cn(colIndex === 0 && "font-semibold")}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-xl border border-[#dfebf5] bg-white p-3"
            style={{ fontSize: style.fontSize, color: style.textColor }}
          >
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="grid grid-cols-[92px_1fr] gap-2 border-b border-[#eef4fa] py-1.5 last:border-0"
              >
                <span
                  className="font-display text-[9.5px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: style.textColor, opacity: 0.7, paddingTop: 2 }}
                >
                  {header[colIndex] ?? "—"}
                </span>
                <Inline
                  value={cell}
                  label={`${header[colIndex] ?? "cronograma"} da etapa`}
                  multiline
                  onCommit={(v) => patchCell(rowIndex, colIndex, v)}
                  className={cn(colIndex === 0 && "font-semibold")}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- notice details ---------------------------------- */

function NoticeDetails({ notice, allowEnrollment }: { notice: Notice; allowEnrollment: boolean }) {
  const { update } = useSite();
  const confirmed = notice.schedule.slice(1, 4).filter((row) => row[1] && !/a definir/i.test(row[1]));
  const appealActive = isAppealActive(notice);

  const patchVacancy = (key: keyof Notice["vacancies"], value: string) =>
    update((draft) => {
      const target = draft.notices.find((n) => n.id === notice.id);
      if (target) target.vacancies[key] = Math.max(0, Number(value.replace(/\D/g, "")) || 0);
    });

  const links = [
    { label: "Ler edital completo", url: notice.fullNoticeUrl, icon: FileText, kind: "primary" },
    { label: "Acessar macroprojeto", url: notice.macroprojectUrl, icon: Link2, kind: "secondary" },
  ].filter((l) => l.url.trim());

  return (
    <div className="space-y-7">
      <Inline
        as="p"
        value={notice.presentation}
        label="apresentação do edital"
        multiline
        onCommit={(value) =>
          update((draft) => {
            const target = draft.notices.find((n) => n.id === notice.id);
            if (target) target.presentation = value;
          })
        }
        className="max-w-4xl text-[13px] leading-relaxed text-[#41637f] sm:text-[13.5px]"
      />

      <div className="flex flex-wrap gap-2">
        {links.map(({ label, url, icon: Icon, kind }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(kind === "primary" ? btnPrimary : btnSecondary, "!py-2 !text-[12px]")}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
          </a>
        ))}
        {allowEnrollment && notice.formUrl.trim() && (
          <a
            href={notice.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(btnGreen, "!py-2 !text-[12px]")}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Fazer inscrição
            <ExternalLink className="h-3 w-3 opacity-80" aria-hidden="true" />
          </a>
        )}
        {appealActive && (
          <a
            href={notice.appealUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ecc9e1] bg-[#f7e9f3] px-4 py-2 text-[12px] font-semibold text-magenta-p transition hover:bg-[#f1dced]"
          >
            <ShieldQuestion className="h-3.5 w-3.5" aria-hidden="true" />
            Solicitar recurso pelo formulário
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
          </a>
        )}
      </div>

      {appealActive && (
        <p className="-mt-4 text-[11px] font-medium text-magenta-p">
          Recurso disponível até {formatBR(notice.appealEnd || notice.appealStart)}. O botão é exibido somente dentro do
          prazo configurado.
        </p>
      )}

      <section aria-labelledby={`vagas-${notice.id}`}>
        <h3 id={`vagas-${notice.id}`} className="mb-3 flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-brand-deep">
          <Users className="h-4 w-4 text-brand" aria-hidden="true" />
          <T id={`${notice.id}-vagas-titulo`} fallback="Distribuição das vagas" />
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {(["TED", "GIO", "CTS"] as const).map((line) => (
            <div
              key={line}
              className="relative overflow-hidden rounded-xl border border-[#dce9f5] bg-white p-3.5"
              style={{ borderTop: `3px solid ${LINE_META[line].color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="inline-flex rounded-md px-1.5 py-0.5 font-display text-[10px] font-extrabold tracking-[0.12em] text-white"
                    style={{ background: LINE_META[line].color }}
                  >
                    {line}
                  </span>
                  <p className="mt-1.5 text-[10.5px] font-medium leading-tight text-[#5c7c98]">{LINE_META[line].name}</p>
                </div>
                <div className="text-right">
                  <Inline
                    value={String(notice.vacancies[line])}
                    label={`vagas ${line}`}
                    onCommit={(v) => patchVacancy(line, v)}
                    className="font-display text-2xl font-extrabold leading-none"
                  />
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#8aa6bd]">vagas</span>
                </div>
              </div>
            </div>
          ))}
          <div className="relative overflow-hidden rounded-xl border border-[#ecc9e1] bg-[#fbf4f9] p-3.5" style={{ borderTop: "3px solid #8e207d" }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex rounded-md bg-magenta-p px-1.5 py-0.5 font-display text-[10px] font-extrabold tracking-[0.12em] text-white">
                  EXTERNO
                </span>
                <p className="mt-1.5 text-[10.5px] font-medium leading-tight text-[#7a5570]">
                  Pesquisador(a) externo(a) · participação externa no Macroprojeto
                </p>
              </div>
              <div className="text-right">
                <Inline
                  value={String(notice.vacancies.externo)}
                  label="vagas para pesquisador externo"
                  onCommit={(v) => patchVacancy("externo", v)}
                  className="font-display text-2xl font-extrabold leading-none text-magenta-p"
                />
                <span className="block text-[9px] font-bold uppercase tracking-wider text-[#b083a6]">vaga(s)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {confirmed.length > 0 && (
        <section aria-labelledby={`datas-${notice.id}`}>
          <h3 id={`datas-${notice.id}`} className="mb-3 flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-brand-deep">
            <CalendarCheck className="h-4 w-4 text-green-p" aria-hidden="true" />
            <T id={`${notice.id}-datas-titulo`} fallback="Datas confirmadas" />
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {confirmed.map((row, i) => (
              <div key={i} className="rounded-xl border border-[#e2d3e8] bg-gradient-to-br from-[#fbf4f9] to-white p-3.5">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-magenta-p">{row[0]}</p>
                <p className="mt-1 font-display text-[19px] font-extrabold tracking-tight text-ink">{row[1]}</p>
                {row[2] && <p className="mt-0.5 text-[10.5px] leading-snug text-[#6c8aa4]">{row[2]}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby={`cronograma-${notice.id}`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 id={`cronograma-${notice.id}`} className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-brand-deep">
            <CalendarClock className="h-4 w-4 text-brand" aria-hidden="true" />
            <T id={`${notice.id}-cronograma-titulo`} fallback="Cronograma" />
          </h3>
          <span className="rounded-full bg-[#f3f9fe] px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-wide text-[#5c7c98] ring-1 ring-[#e1edf7]">
            Tabela editável no Studio
          </span>
        </div>
        <ScheduleTable notice={notice} />
      </section>

      {notice.criteria.length > 0 && (
        <section
          aria-labelledby={`criteria-${notice.id}`}
          className="rounded-2xl border border-[#d6e8f5] bg-gradient-to-br from-[#f2f9fe] to-white p-4 sm:p-5"
        >
          <h3 id={`criteria-${notice.id}`} className="flex items-center gap-2 font-display text-[13px] font-bold text-[#0d3a66]">
            <CheckCircle2 className="h-4 w-4 text-green-p" aria-hidden="true" />
            <T id={`${notice.id}-criterios-titulo`} fallback="Quem pode se inscrever?" />
          </h3>
          <ul className="mt-3 grid gap-2.5">
            {notice.criteria.map((criterion, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#33587a]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dff3e8] text-[9px] font-bold text-[#0f7542]" aria-hidden="true">
                  ✓
                </span>
                <Inline value={criterion} label="critério de participação" multiline onCommit={(v) =>
                  update((draft) => {
                    const target = draft.notices.find((n) => n.id === notice.id);
                    if (target) target.criteria[i] = v;
                  })
                } />
              </li>
            ))}
          </ul>
        </section>
      )}

      {notice.appealStart && !appealActive && (
        <p className="flex items-start gap-2 rounded-xl border border-[#e6ebf1] bg-[#f7f9fb] px-3 py-2 text-[11px] leading-relaxed text-[#6c8aa4]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Recurso configurado para {formatBR(notice.appealStart)}
          {notice.appealEnd ? ` a ${formatBR(notice.appealEnd)}` : ""}. O botão de solicitação aparece apenas dentro
          desse período.
        </p>
      )}

      {notice.note && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#f0dfb4] bg-[#fdf9ec] px-3.5 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#c28a0c]" aria-hidden="true" />
          <Inline
            as="p"
            value={notice.note}
            label="observação do edital"
            multiline
            onCommit={(value) =>
              update((draft) => {
                const target = draft.notices.find((n) => n.id === notice.id);
                if (target) target.note = value;
              })
            }
            className="text-[11.5px] leading-relaxed text-[#7a5b0b]"
          />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- notice card ---------------------------------- */

function NoticeCard({ notice }: { notice: Notice }) {
  const { update } = useSite();
  const isClosed = notice.status === "Encerrado";
  const [expanded, setExpanded] = useState(!isClosed);
  const status = STATUS_STYLE[notice.status] ?? STATUS_STYLE["Em breve"];

  return (
    <article
      id={notice.id}
      className={cn(
        "surface relative scroll-mt-32 overflow-hidden rounded-3xl",
        notice.status === "Aberto" && "ring-1 ring-[#c5e7d4]",
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1.5", notice.status === "Encerrado" ? "bg-[#c9d6e2]" : "rainbow-bar")} aria-hidden="true" />
      <div className="p-5 pt-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] ring-1", status.chip)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", notice.status === "Aberto" && "animate-pulse")} style={{ background: status.dot }} aria-hidden="true" />
                {notice.status === "Aberto" ? status.label : notice.status}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e7f4] bg-[#f7fbfe] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#33587a]">
                <FileText className="h-3 w-3 text-brand" aria-hidden="true" />
                Edital Nº {notice.number}
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-[#7b95ac]">{notice.situation}</span>
            </div>
            <h2 className="mt-2.5 max-w-3xl font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-[24px]">
              <Inline value={notice.title} label="título do edital" multiline onCommit={(value) =>
                update((draft) => {
                  const target = draft.notices.find((n) => n.id === notice.id);
                  if (target) target.title = value;
                })
              } />
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#5c7c98]">
              <Landmark className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              {notice.institution}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {isClosed && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls={`notice-body-${notice.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe0ee] bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-deep transition hover:bg-[#eef7fd]"
              >
                {expanded ? "Recolher detalhes" : "Expandir detalhes"}
                <ChevronDown className={cn("h-3.5 w-3.5 transition", expanded && "rotate-180")} aria-hidden="true" />
              </button>
            )}
            <div className="hidden items-center gap-1 rounded-full bg-[#f9f6ee] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#9a6b06] sm:flex">
              <FileText className="h-3 w-3" aria-hidden="true" />
              {notice.status === "Aberto" ? "Leia antes de se inscrever" : `Edital ${notice.number}`}
            </div>
          </div>
        </div>

        <div
          id={`notice-body-${notice.id}`}
          className={cn("notice-body mt-5 border-t border-[#e8f1f8] pt-5", isClosed && !expanded && "notice-collapsed")}
        >
          <NoticeDetails notice={notice} allowEnrollment={notice.status === "Aberto"} />
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------- page ---------------------------------- */

export function Notices() {
  const { content } = useSite();
  const notices = [...content.notices].sort((a, b) => TH_ORDER[a.status] - TH_ORDER[b.status]);
  const openCount = content.notices.filter((n) => n.status === "Aberto").length;
  const totalVacancies = content.notices
    .filter((n) => n.status === "Aberto")
    .reduce((acc, n) => acc + n.vacancies.TED + n.vacancies.GIO + n.vacancies.CTS + n.vacancies.externo, 0);

  return (
    <div className="space-y-8 md:space-y-10">
      <PageHero
        eyebrow="Oportunidades e chamadas"
        titleId="editais-titulo"
        title="Editais"
        descriptionId="editais-desc"
        description="Chamadas públicas do PANDORA para seleção de discentes e pesquisadores(as) externos(as). Leia o Macroprojeto e o edital completo antes de se inscrever."
      >
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[#0f7542] ring-1 ring-[#bfe8d1]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-p" aria-hidden="true" />
            {openCount} {openCount === 1 ? "edital aberto" : "editais abertos"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[#b9530f] ring-1 ring-[#f5cfb2]">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {totalVacancies} vagas nesta seleção
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[#41637f] ring-1 ring-[#d7e7f4]">
            <CalendarClock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Campus Patos · UFCG
          </span>
        </div>
      </PageHero>

      <Reveal className="space-y-5">
        {notices.length === 0 ? (
          <p className="surface rounded-2xl p-8 text-center text-sm text-[#4a6a86]">
            Nenhum edital publicado. Use o PANDORA Studio para criar um edital.
          </p>
        ) : (
          notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        )}
      </Reveal>

      <Reveal>
        <div className="rounded-2xl border border-[#d9e8f4] bg-white/70 px-5 py-4">
          <T
            as="p"
            id="editais-rodape"
            fallback="Observação: confira o edital completo antes de se inscrever. Editais encerrados permanecem disponíveis para consulta e não exibem o botão de inscrição."
            className="text-[12px] leading-relaxed text-[#4a6a86]"
          />
        </div>
      </Reveal>
    </div>
  );
}
