export type TabId = "inicio" | "pesquisa" | "publicacoes" | "editais";
export type LineKey = "TED" | "GIO" | "CTS" | "OUTRAS";
export type NoticeStatus = "Aberto" | "Encerrado" | "Em breve";
export type NewsTarget = "none" | "internal" | "external";
export type MemberCategory = "coordenacao" | "discentes" | "externos";

export interface SiteImage {
  key: string;
  label: string;
  url: string;
  alt: string;
}

export interface NewsItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  meta: string;
  buttonText: string;
  targetType: NewsTarget;
  targetTab: TabId;
  targetSection: string;
  externalUrl: string;
  hidden: boolean;
}

export interface ScheduleStyle {
  fontSize: number;
  textColor: string;
  cellPadding: number;
  headerBg: string;
  striped: boolean;
}

export interface Notice {
  id: string;
  number: string;
  status: NoticeStatus;
  situation: string;
  title: string;
  presentation: string;
  institution: string;
  vacancies: { TED: number; GIO: number; CTS: number; externo: number };
  schedule: string[][];
  scheduleStyle: ScheduleStyle;
  appealStart: string;
  appealEnd: string;
  appealUrl: string;
  criteria: string[];
  fullNoticeUrl: string;
  macroprojectUrl: string;
  formUrl: string;
  note: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  category: MemberCategory;
  line: LineKey;
  extra: string;
  url: string;
}

export interface Scholarship {
  id: string;
  line: LineKey;
  title: string;
  scholar: string;
  modality: string;
  kind: string;
}

export interface ResearchProject {
  id: string;
  line: LineKey;
  title: string;
  members: string;
  defense: string;
}

export interface Publication {
  id: string;
  year: number;
  title: string;
  authors: string;
  line: LineKey;
  type: string;
  url: string;
}

export interface Settings {
  pageTitle: string;
  instagram: string;
  instagramUrl: string;
  email: string;
  footerText: string;
}

export interface SiteContent {
  version: 1;
  settings: Settings;
  texts: Record<string, string>;
  images: Record<string, SiteImage>;
  news: NewsItem[];
  notices: Notice[];
  members: Member[];
  scholarships: Scholarship[];
  projects: ResearchProject[];
  publications: Publication[];
}

export interface SiteVersion {
  id: string;
  createdAt: string;
  auto: boolean;
  content: SiteContent;
}

export const LINE_META: Record<
  LineKey,
  { name: string; short: string; color: string; soft: string; image?: string; description?: string; refs?: string }
> = {
  TED: {
    name: "Tecnologias Emergentes e Democratização",
    short: "TED",
    color: "#138d50",
    soft: "#e7f6ee",
    description:
      "Analisa IA, tecnologias emergentes, letramento ético-digital e democratização do acesso à educação científica.",
    refs: "Inteligência artificial · Letramento ético-digital",
  },
  GIO: {
    name: "Gênero, Interseccionalidade e Ontologia",
    short: "GIO",
    color: "#1764a0",
    soft: "#e8f2fb",
    description:
      "Investiga desigualdades, silenciamentos, sujeitos da ciência e saberes situados, em diálogo com Haraway, Schiebinger e Crenshaw.",
    refs: "Haraway · Schiebinger · Crenshaw",
  },
  CTS: {
    name: "Ciência, Tecnologia, Sociedade e Ambiente",
    short: "CTS",
    color: "#ed7128",
    soft: "#fdf0e7",
    description:
      "Problematiza relações CTSA, divulgação científica, materiais didáticos e letramento científico crítico.",
    refs: "CTSA · Divulgação científica · Materiais didáticos",
  },
  OUTRAS: {
    name: "Outras linhas / produção transversal",
    short: "Outras",
    color: "#8e207d",
    soft: "#f7e9f3",
  },
};

export const ACRONYM = [
  { letter: "P", word: "Práticas", color: "#1263a0" },
  { letter: "A", word: "Analíticas e", color: "#17a5a5" },
  { letter: "N", word: "Narrativas de", color: "#6da941" },
  { letter: "D", word: "Democratização", color: "#e7b11d" },
  { letter: "O", word: "Ontologia e", color: "#ee6b26" },
  { letter: "R", word: "Resistência", color: "#d62950" },
  { letter: "A", word: "Ativa", color: "#8b2a9e" },
];

export const TAB_LABELS: { id: TabId; label: string; dot: string }[] = [
  { id: "inicio", label: "Início", dot: "#12619a" },
  { id: "pesquisa", label: "Pesquisa e extensão", dot: "#138d50" },
  { id: "publicacoes", label: "Publicações", dot: "#8e207d" },
  { id: "editais", label: "Editais", dot: "#ed7128" },
];

export const IMAGE_LABELS: Record<string, string> = {
  logo: "Logotipo do PANDORA",
  cover: "Imagem de capa",
  about: "Imagem da seção O que é o PANDORA?",
  gio: "Imagem da linha GIO",
  ted: "Imagem da linha TED",
  cts: "Imagem da linha CTS",
};
