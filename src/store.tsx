import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import exportedContent from "./exportedContent.json";
const defaultContent: SiteContent = exportedContent as SiteContent;
import type { SiteContent, SiteVersion, TabId } from "./types";
import { uid } from "./utils/id";

interface EmbeddedProject {
  content: unknown;
  versions: SiteVersion[];
  exportId: string;
}

function readEmbeddedProject(): EmbeddedProject | null {
  if (typeof document === "undefined") return null;
  const node = document.getElementById("pandora-editable-content");
  if (!node?.textContent) return null;
  try {
    const payload = JSON.parse(node.textContent);
    const embeddedContent = payload?.content ?? payload;
    if (!embeddedContent || embeddedContent.version !== 1) return null;
    return {
      content: embeddedContent,
      versions: Array.isArray(payload?.versions) ? payload.versions : [],
      exportId: node.getAttribute("data-export-id") || payload?.exportId || "embedded",
    };
  } catch {
    return null;
  }
}

/* Editable exports get their own storage namespace, so opening one never mixes
   its content with another PANDORA project already saved in this browser. */
const EMBEDDED_PROJECT = readEmbeddedProject();
const CONTENT_KEY = EMBEDDED_PROJECT
  ? `pandora.site.content.${EMBEDDED_PROJECT.exportId}.v1`
  : "pandora.site.content.v1";
const VERSIONS_KEY = EMBEDDED_PROJECT
  ? `pandora.site.versions.${EMBEDDED_PROJECT.exportId}.v1`
  : "pandora.site.versions.v1";
const MAX_VERSIONS = 15;

type SaveState = "saved" | "saving" | "error";

interface SiteContextValue {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  update: (recipe: (draft: SiteContent) => void) => void;
  patch: (partial: Partial<SiteContent>) => void;
  setText: (key: string, value: string) => void;
  setImage: (key: string, patch: Partial<SiteContent["images"][string]>) => void;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: TabId;
  goTo: (tab: TabId, section?: string) => void;
  saveState: SaveState;
  lastSaved: Date | null;
  saveNow: () => void;
  versions: SiteVersion[];
  createVersion: (auto?: boolean) => void;
  restoreVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  replaceContent: (next: SiteContent) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

function mergeContent(saved: unknown): SiteContent {
  if (!saved || typeof saved !== "object") return structuredClone(defaultContent);
  const s = saved as Partial<SiteContent>;
  if (s.version !== 1) return structuredClone(defaultContent);
  const base = structuredClone(defaultContent);
  return {
    ...base,
    ...s,
    version: 1,
    settings: { ...base.settings, ...(s.settings ?? {}) },
    images: { ...base.images, ...(s.images ?? {}) },
    texts: { ...(s.texts ?? {}) },
    news: Array.isArray(s.news) ? s.news : base.news,
    notices: Array.isArray(s.notices) ? s.notices : base.notices,
    members: Array.isArray(s.members) ? s.members : base.members,
    scholarships: Array.isArray(s.scholarships) ? s.scholarships : base.scholarships,
    projects: Array.isArray(s.projects) ? s.projects : base.projects,
    publications: Array.isArray(s.publications) ? s.publications : base.publications,
  };
}

function loadContent(): SiteContent {
  return structuredClone(defaultContent);
  return structuredClone(defaultContent);
}

function loadContentUnused(): SiteContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (raw) return mergeContent(JSON.parse(raw));
  } catch {
    /* fall back to the embedded project below */
  }
  if (EMBEDDED_PROJECT) return mergeContent(EMBEDDED_PROJECT.content);
  return structuredClone(defaultContent);
}

function loadVersions(content: SiteContent): SiteVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_VERSIONS);
    }
  } catch {
    /* ignore */
  }
  if (EMBEDDED_PROJECT?.versions.length) return structuredClone(EMBEDDED_PROJECT.versions.slice(0, MAX_VERSIONS));
  return [
    {
      id: uid(),
      createdAt: new Date().toISOString(),
      auto: false,
      content: structuredClone(content),
    },
  ];
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(loadContent);
  const [versions, setVersions] = useState<SiteVersion[]>(() => loadVersions(loadContent()));
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const pendingSection = useRef<string | null>(null);
  const lastSnapshot = useRef<string>(JSON.stringify(content));

  /* document title + meta theme */
  useEffect(() => {
    document.title = content.settings.pageTitle || "PANDORA";
  }, [content.settings.pageTitle]);

  /* autosave */
  useEffect(() => {
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
        setSaveState("saved");
        setLastSaved(new Date());
      } catch {
        setSaveState("error");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [content]);

  const persistVersions = useCallback((next: SiteVersion[]) => {
    const capped = next.slice(0, MAX_VERSIONS);
    setVersions(capped);
    try {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(capped));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const createVersion = useCallback(
    (auto = false) => {
      setVersions((prev) => {
        const serialized = JSON.stringify(content);
        if (auto && prev[0] && JSON.stringify(prev[0].content) === serialized) return prev;
        const next: SiteVersion[] = [
          { id: uid(), createdAt: new Date().toISOString(), auto, content: structuredClone(content) },
          ...prev,
        ].slice(0, MAX_VERSIONS);
        try {
          localStorage.setItem(VERSIONS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      lastSnapshot.current = JSON.stringify(content);
    },
    [content],
  );

  const saveNow = useCallback(() => {
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
      setSaveState("saved");
      setLastSaved(new Date());
    } catch {
      setSaveState("error");
    }
    createVersion(false);
  }, [content, createVersion]);

  const restoreVersion = useCallback((id: string) => {
    setVersions((prev) => {
      const found = prev.find((v) => v.id === id);
      if (found) setContent(structuredClone(found.content));
      return prev;
    });
  }, []);

  const deleteVersion = useCallback(
    (id: string) => {
      persistVersions(versions.filter((v) => v.id !== id));
    },
    [persistVersions, versions],
  );

  /* automatic snapshot after 2 minutes without edits */
  useEffect(() => {
    const serialized = JSON.stringify(content);
    if (serialized === lastSnapshot.current) return;
    const timer = window.setTimeout(() => {
      if (JSON.stringify(content) !== lastSnapshot.current) createVersion(true);
    }, 120_000);
    return () => window.clearTimeout(timer);
  }, [content, createVersion]);

  const update = useCallback((recipe: (draft: SiteContent) => void) => {
    setContent((prev) => {
      const draft = structuredClone(prev);
      recipe(draft);
      return draft;
    });
  }, []);

  const patch = useCallback((partial: Partial<SiteContent>) => {
    setContent((prev) => ({ ...prev, ...partial }));
  }, []);

  const setText = useCallback((key: string, value: string) => {
    setContent((prev) => {
      if ((prev.texts[key] ?? "") === value) return prev;
      return { ...prev, texts: { ...prev.texts, [key]: value } };
    });
  }, []);

  const setImage = useCallback((key: string, imagePatch: Partial<SiteContent["images"][string]>) => {
    setContent((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [key]: {
          key,
          label: prev.images[key]?.label ?? key,
          url: prev.images[key]?.url ?? "",
          alt: prev.images[key]?.alt ?? "",
          ...imagePatch,
        },
      },
    }));
  }, []);

  const replaceContent = useCallback((next: SiteContent) => {
    setContent(mergeContent(next));
    window.scrollTo({ top: 0, behavior: "auto" });
    setActiveTab("inicio");
  }, []);

  const goTo = useCallback((tab: TabId, section?: string) => {
    setActiveTab(tab);
    pendingSection.current = section ?? null;
    window.setTimeout(() => {
      const el = section ? document.getElementById(section) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 90);
  }, []);

  /* scroll to section requested by a CTA after the tab panel renders */
  useEffect(() => {
    if (!pendingSection.current) return;
    const target = pendingSection.current;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      pendingSection.current = null;
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  const value = useMemo<SiteContextValue>(
    () => ({
      content,
      setContent,
      update,
      patch,
      setText,
      setImage,
      editMode,
      setEditMode,
      activeTab,
      goTo,
      saveState,
      lastSaved,
      saveNow,
      versions,
      createVersion,
      restoreVersion,
      deleteVersion,
      replaceContent,
    }),
    [
      content,
      update,
      patch,
      setText,
      setImage,
      editMode,
      activeTab,
      goTo,
      saveState,
      lastSaved,
      saveNow,
      versions,
      createVersion,
      restoreVersion,
      deleteVersion,
      replaceContent,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
