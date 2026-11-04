import { ArrowUpRight, Award, ExternalLink, FlaskConical, Users } from "lucide-react";
import { useSite } from "../store";
import { LINE_META, type Member, type MemberCategory } from "../types";
import type { ResearchProject, Scholarship } from "../types";
import {
  Avatar,
  EmptyState,
  Inline,
  LineBadge,
  PageHero,
  Reveal,
  SectionHeading,
  T,
} from "../components/ui";
import { cn } from "../utils/cn";

/* ---------------------------------- helpers ---------------------------------- */

function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_1fr] items-start gap-2 border-b border-[#eef4fa] py-2 last:border-0">
      <span className="pt-0.5 font-display text-[9.5px] font-bold uppercase tracking-[0.09em] text-[#6c8aa4]">{label}</span>
      <div className="text-[12px] leading-relaxed text-[#23435f]">{children}</div>
    </div>
  );
}

function ModalityBadge({ modality, kind }: { modality: string; kind: string }) {
  const isExtension = kind.toLowerCase().includes("extens");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ring-1",
        isExtension
          ? "bg-[#fdf0e7] text-[#b9530f] ring-[#f5cfb2]"
          : "bg-[#e9f7ef] text-[#0f7542] ring-[#bfe8d1]",
      )}
    >
      <Award className="h-3 w-3" aria-hidden="true" />
      {modality} · {kind}
    </span>
  );
}

const th = "text-left";
const td = "align-top";

/* ---------------------------------- scholarships ---------------------------------- */

function Scholarships() {
  const { content, update } = useSite();
  const patch = (id: string, p: Partial<Scholarship>) =>
    update((draft) => {
      const item = draft.scholarships.find((s) => s.id === id);
      if (item) Object.assign(item, p);
    });

  return (
    <Reveal id="bolsas" className="scroll-mt-32">
      <div className="surface overflow-hidden rounded-3xl p-5 sm:p-7">
        <SectionHeading
          eyebrow="Bolsa e extensão"
          eyebrowClass="text-green-p"
          title="Pesquisa com bolsa e extensão"
          titleId="bolsas-titulo"
          description="Projetos vinculados a programas de fomento, com orientação semanal e participação nas ações do grupo."
          descriptionId="bolsas-desc"
        />

        {content.scholarships.length === 0 ? (
          <EmptyState title="Nenhuma bolsa cadastrada" description="Gerencie as bolsas pelo PANDORA Studio." />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-[#dfebf5] md:block">
              <table className="p-table">
                <caption className="sr-only">Pesquisas com bolsa e projetos de extensão do PANDORA</caption>
                <thead>
                  <tr>
                    <th scope="col" className={th}><T id="bolsas-th-linha" fallback="Linha" /></th>
                    <th scope="col" className={th}><T id="bolsas-th-projeto" fallback="Projeto" /></th>
                    <th scope="col" className={th}><T id="bolsas-th-bolsista" fallback="Bolsista" /></th>
                    <th scope="col" className={th}><T id="bolsas-th-modalidade" fallback="Modalidade" /></th>
                  </tr>
                </thead>
                <tbody>
                  {content.scholarships.map((item) => (
                    <tr key={item.id}>
                      <td className={td}><LineBadge line={item.line} /></td>
                      <td className={cn(td, "max-w-[460px]")}>
                        <Inline value={item.title} label="projeto" multiline onCommit={(v) => patch(item.id, { title: v })} className="font-medium text-ink" />
                      </td>
                      <td className={td}>
                        <Inline value={item.scholar} label="bolsista" onCommit={(v) => patch(item.id, { scholar: v })} className="text-[13px] font-semibold text-[#0d3a66]" />
                      </td>
                      <td className={td}>
                        <ModalityBadge modality={item.modality} kind={item.kind} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {content.scholarships.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#dfebf5] bg-[#fbfdff] p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <LineBadge line={item.line} />
                    <ModalityBadge modality={item.modality} kind={item.kind} />
                  </div>
                  <CardField label="Projeto">
                    <Inline value={item.title} label="projeto" multiline onCommit={(v) => patch(item.id, { title: v })} className="font-medium text-ink" />
                  </CardField>
                  <CardField label="Bolsista">
                    <Inline value={item.scholar} label="bolsista" onCommit={(v) => patch(item.id, { scholar: v })} className="font-semibold text-[#0d3a66]" />
                  </CardField>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}

/* ---------------------------------- projects ---------------------------------- */

function Projects() {
  const { content, update } = useSite();
  const patch = (id: string, p: Partial<ResearchProject>) =>
    update((draft) => {
      const item = draft.projects.find((s) => s.id === id);
      if (item) Object.assign(item, p);
    });

  const counts = content.projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.line] = (acc[p.line] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Reveal id="projetos" className="scroll-mt-32">
      <div className="surface overflow-hidden rounded-3xl p-5 sm:p-7">
        <SectionHeading
          eyebrow="Iniciação à pesquisa"
          eyebrowClass="text-brand"
          title="Demais projetos de pesquisa"
          titleId="projetos-titulo"
          description="Trabalhos em andamento e concluídos, organizados pelas linhas temáticas do grupo."
          descriptionId="projetos-desc"
          action={
            <div className="flex flex-wrap gap-1.5">
              {(["TED", "GIO", "CTS"] as const).map((line) => (
                <span
                  key={line}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dce9f5] bg-white px-2.5 py-1 text-[10.5px] font-semibold text-[#41637f]"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: LINE_META[line].color }} aria-hidden="true" />
                  {line} · {counts[line] ?? 0}
                </span>
              ))}
            </div>
          }
        />

        {content.projects.length === 0 ? (
          <EmptyState title="Nenhum projeto cadastrado" description="Gerencie os projetos pelo PANDORA Studio." />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-[#dfebf5] md:block">
              <table className="p-table">
                <caption className="sr-only">Demais projetos de pesquisa do PANDORA</caption>
                <thead>
                  <tr>
                    <th scope="col" className={th}><T id="projetos-th-linha" fallback="Linha" /></th>
                    <th scope="col" className={th}><T id="projetos-th-projeto" fallback="Projeto" /></th>
                    <th scope="col" className={th}><T id="projetos-th-discentes" fallback="Discente(s)" /></th>
                    <th scope="col" className={th}><T id="projetos-th-defesa" fallback="Defesa" /></th>
                  </tr>
                </thead>
                <tbody>
                  {content.projects.map((project) => (
                    <tr key={project.id}>
                      <td className={td}><LineBadge line={project.line} /></td>
                      <td className={cn(td, "max-w-[420px]")}>
                        <Inline value={project.title} label="projeto" multiline onCommit={(v) => patch(project.id, { title: v })} className="font-medium text-ink" />
                      </td>
                      <td className={td}>
                        <Inline value={project.members} label="discentes" multiline onCommit={(v) => patch(project.id, { members: v })} className="text-[12.5px] text-[#33587a]" />
                      </td>
                      <td className={td}>
                        <Inline value={project.defense} label="defesa" onCommit={(v) => patch(project.id, { defense: v })} className="inline-flex whitespace-nowrap rounded-md bg-[#f3f9fe] px-2 py-1 font-display text-[10.5px] font-bold text-brand-deep ring-1 ring-[#dceaf5]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {content.projects.map((project) => (
                <article key={project.id} className="rounded-2xl border border-[#dfebf5] bg-[#fbfdff] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <LineBadge line={project.line} />
                    <Inline value={project.defense} label="defesa" onCommit={(v) => patch(project.id, { defense: v })} className="rounded-md bg-white px-2 py-1 font-display text-[10.5px] font-bold text-brand-deep ring-1 ring-[#dceaf5]" />
                  </div>
                  <Inline value={project.title} label="projeto" multiline onCommit={(v) => patch(project.id, { title: v })} className="block font-display text-[13px] font-semibold leading-snug text-ink" />
                  <CardField label="Discente(s)">
                    <Inline value={project.members} label="discentes" multiline onCommit={(v) => patch(project.id, { members: v })} />
                  </CardField>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}

/* ---------------------------------- members ---------------------------------- */

function MemberCard({ member, compact = false }: { member: Member; compact?: boolean }) {
  const { update } = useSite();
  const meta = LINE_META[member.line];
  const patch = (p: Partial<Member>) =>
    update((draft) => {
      const target = draft.members.find((m) => m.id === member.id);
      if (target) Object.assign(target, p);
    });

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[#dfebf5] bg-white p-4 transition hover:border-[#c5dcee] hover:shadow-[0_18px_40px_-30px_rgba(13,58,102,0.45)]",
        compact && "p-3.5",
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: meta?.color ?? "#12619a" }} aria-hidden="true" />
      <div className="flex items-start gap-3">
        <Avatar name={member.name} color={meta?.color ?? "#12619a"} size={compact ? "md" : "lg"} />
        <div className="min-w-0">
          <Inline
            as="h3"
            value={member.name}
            label="nome"
            onCommit={(v) => patch({ name: v })}
            className="font-display text-[13.5px] font-bold leading-snug text-ink"
          />
          <Inline
            as="p"
            value={member.role}
            label="cargo/vínculo"
            multiline
            onCommit={(v) => patch({ role: v })}
            className="mt-0.5 text-[11px] leading-snug text-[#5c7c98]"
          />
        </div>
      </div>
      {member.extra && (
        <Inline
          as="p"
          value={member.extra}
          label="descrição"
          multiline
          onCommit={(v) => patch({ extra: v })}
          className="mt-2.5 text-[11.5px] leading-relaxed text-[#4a6a86]"
        />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5">
        {member.line !== "OUTRAS" && <LineBadge line={member.line} />}
        {member.line === "OUTRAS" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5eff8] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-magenta-p">
            Equipe
          </span>
        )}
        {member.url && (
          <a
            href={member.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand transition hover:text-brand-deep"
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            Currículo / perfil
          </a>
        )}
      </div>
    </article>
  );
}

function MemberGroup({
  category,
  title,
  eyebrow,
  description,
  icon: Icon,
  gridClass,
}: {
  category: MemberCategory;
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof Users;
  gridClass: string;
}) {
  const { content } = useSite();
  const members = content.members.filter((m) => m.category === category);
  return (
    <section aria-labelledby={`grupo-${category}`} className="mt-7 first:mt-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id={`grupo-${category}`} className="flex items-center gap-2 font-display text-[15px] font-bold text-ink">
            <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
            {title}
            <span className="rounded-full bg-[#eef5fb] px-2 py-0.5 text-[10px] font-bold text-[#4a6a86]">{members.length}</span>
          </h3>
          <p className="mt-0.5 text-[11.5px] text-[#6c8aa4]">{description}</p>
        </div>
        <span className="rounded-full bg-[#f8fbfe] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7b95ac] ring-1 ring-[#e4eef7]">
          {eyebrow}
        </span>
      </div>
      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#dce9f5] px-4 py-4 text-[12px] text-[#6c8aa4]">
          Nenhuma pessoa cadastrada nesta categoria.
        </p>
      ) : (
        <div className={gridClass}>
          {members.map((member) => (
            <MemberCard key={member.id} member={member} compact={category === "externos"} />
          ))}
        </div>
      )}
    </section>
  );
}

function Members() {
  const { content } = useSite();
  const coordinator = content.members.find((m) => m.category === "coordenacao");
  return (
    <Reveal id="membros" className="scroll-mt-32">
      <div className="surface overflow-hidden rounded-3xl p-5 sm:p-7">
        <SectionHeading
          eyebrow="Quem faz o PANDORA"
          eyebrowClass="text-magenta-p"
          title="Membros"
          titleId="membros-titulo"
          description="Coordenação, discentes e pesquisadoras(es) externas(os) que constroem o macroprojeto coletivamente."
          descriptionId="membros-desc"
        />

        {coordinator && (
          <div className="dark-mesh relative mb-7 overflow-hidden rounded-2xl p-5 text-white sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[20px] border-white/10" aria-hidden="true" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
              <Avatar name={coordinator.name} color="#ed7128" size="lg" />
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#ffd9bf]">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-p" aria-hidden="true" />
                  Coordenação
                </span>
                <h3 className="mt-1.5 font-display text-[17px] font-bold leading-snug">{coordinator.name}</h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/75">{coordinator.role}</p>
                {coordinator.extra && <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-white/65">{coordinator.extra}</p>}
              </div>
            </div>
          </div>
        )}

        <MemberGroup
          category="discentes"
          title="Discentes"
          eyebrow="Iniciação à pesquisa"
          description="Estudantes de graduação e pós-graduação vinculados(as) às linhas TED, GIO e CTS."
          icon={FlaskConical}
          gridClass="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        />
        <MemberGroup
          category="externos"
          title="Pesquisadores externos e egressa"
          eyebrow="Rede de colaboração"
          description="Pesquisadoras(es) de outras instituições que coorientam e colaboram com o grupo."
          icon={Users}
          gridClass="grid gap-3 sm:grid-cols-2"
        />
      </div>
    </Reveal>
  );
}

/* ---------------------------------- page ---------------------------------- */

export function Research() {
  const { content } = useSite();
  return (
    <div className="space-y-8 md:space-y-10">
      <PageHero
        eyebrow="Pesquisa e extensão"
        titleId="pesquisa-titulo"
        title="Pesquisa com compromisso social"
        descriptionId="pesquisa-desc"
        description="Projetos de iniciação científica e extensão que articulam formação investigativa, criticidade e democratização do conhecimento no Ensino de Ciências e Tecnologias."
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: "bolsas", label: "Bolsas e extensão", icon: Award, count: content.scholarships.length },
            { id: "projetos", label: "Projetos de pesquisa", icon: FlaskConical, count: content.projects.length },
            { id: "membros", label: "Membros", icon: Users, count: content.members.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe2f1] bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-brand-deep transition hover:border-brand hover:bg-white"
            >
              <Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              {label}
              <span className="rounded-full bg-[#eef5fb] px-1.5 py-0.5 text-[9.5px] font-bold text-[#4a6a86]">{count}</span>
              <ArrowUpRight className="h-3 w-3 text-[#8aa6bd]" aria-hidden="true" />
            </a>
          ))}
        </div>
      </PageHero>

      <Scholarships />
      <Projects />
      <Members />

      <Reveal>
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#d9e8f4] bg-white/70 px-5 py-4 sm:flex-row sm:items-center">
          <T
            as="p"
            id="pesquisa-rodape"
            fallback="Todos os projetos são orientados pela coordenação do PANDORA e discutidos em reuniões semanais de orientação. Estudantes interessadas(os) devem acompanhar os editais de seleção."
            className="max-w-3xl text-[12px] leading-relaxed text-[#4a6a86]"
          />
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e9f7ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0f7542]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-p" aria-hidden="true" />
            UACB · CSTR · UFCG
          </span>
        </div>
      </Reveal>
    </div>
  );
}


