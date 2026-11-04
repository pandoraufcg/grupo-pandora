import React, { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useSite } from "../store";
import { LINE_META, type LineKey } from "../types";

/* ---------------------------------- Text editing ---------------------------------- */

interface TProps {
  id: string;
  fallback: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

/** Static site copy stored in the PANDORA Studio texts dictionary. */
export function T({ id, fallback, as = "span", className, multiline, placeholder }: TProps) {
  const { content, setText, editMode } = useSite();
  const value = Object.prototype.hasOwnProperty.call(content.texts, id) ? content.texts[id] : fallback;
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cn(className, multiline && "whitespace-pre-line")}
      data-editable={editMode ? "true" : undefined}
      data-edit-key={id}
      data-placeholder={placeholder ?? "Clique para editar…"}
      contentEditable={editMode || undefined}
      suppressContentEditableWarning
      spellCheck={false}
      aria-label={editMode ? `Texto editável: ${fallback.slice(0, 60)}` : undefined}
      onBlur={
        editMode
          ? (e: React.FocusEvent<HTMLElement>) => {
              const next = e.currentTarget.innerText.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n");
              if (next !== value) setText(id, next);
            }
          : undefined
      }
      onKeyDown={
        editMode && !multiline
          ? (e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
              }
            }
          : undefined
      }
    >
      {value}
    </Tag>
  );
}

interface InlineProps {
  value: string;
  onCommit: (value: string) => void;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
  label?: string;
}

/** Inline editing for data-driven cells (tables, cards). */
export function Inline({ value, onCommit, as = "span", className, multiline, label }: InlineProps) {
  const { editMode } = useSite();
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cn(className, multiline && "whitespace-pre-line")}
      data-editable={editMode ? "true" : undefined}
      data-placeholder="Editar…"
      contentEditable={editMode || undefined}
      suppressContentEditableWarning
      spellCheck={false}
      aria-label={editMode ? `Editar ${label ?? "conteúdo"}` : undefined}
      onBlur={
        editMode
          ? (e: React.FocusEvent<HTMLElement>) => {
              const next = e.currentTarget.innerText.replace(/\u00a0/g, " ");
              if (next !== value) onCommit(next);
            }
          : undefined
      }
      onKeyDown={
        editMode && !multiline
          ? (e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
              }
            }
          : undefined
      }
    >
      {value}
    </Tag>
  );
}

/* ---------------------------------- Images ---------------------------------- */

export function SiteImage({
  imageKey,
  className,
  imgClassName,
  decorative,
  loading = "lazy",
}: {
  imageKey: string;
  className?: string;
  imgClassName?: string;
  decorative?: boolean;
  loading?: "lazy" | "eager";
}) {
  const { content } = useSite();
  const image = content.images[imageKey];
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [image?.url]);

  if (!image?.url || failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9d3e7] bg-gradient-to-br from-[#eaf4fc] via-white to-[#f6fbf8] p-4 text-center",
          className,
        )}
        role="img"
        aria-label={image?.alt || image?.label || "Imagem indisponível"}
      >
        <span className="rainbow-ring h-8 w-8 rounded-full opacity-80" aria-hidden="true" />
        <span className="font-display text-[11px] font-semibold text-[#4a6a86]">{image?.label ?? "Imagem"}</span>
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={decorative ? "" : image.alt}
      aria-hidden={decorative || undefined}
      className={cn(imgClassName, className)}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

/* ---------------------------------- Scroll reveal ---------------------------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- Shared bits ---------------------------------- */

export const btnBase =
  "no-print-url inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";
export const btnPrimary = `${btnBase} bg-brand text-white shadow-[0_10px_24px_-12px_rgba(18,97,154,0.9)] hover:bg-brand-deep`;
export const btnSecondary = `${btnBase} border border-[#c9deee] bg-white text-brand-deep hover:border-brand hover:bg-[#f0f7fd]`;
export const btnOrange = `${btnBase} bg-orange-p text-white shadow-[0_10px_24px_-12px_rgba(237,113,40,0.9)] hover:bg-[#d9611b]`;
export const btnGreen = `${btnBase} bg-green-p text-white shadow-[0_10px_24px_-12px_rgba(19,141,80,0.9)] hover:bg-[#0f7542]`;

export function SectionHeading({
  eyebrow,
  eyebrowClass,
  title,
  titleId,
  description,
  descriptionId,
  align = "left",
  action,
}: {
  eyebrow: string;
  eyebrowClass?: string;
  title: string;
  titleId: string;
  description?: string;
  descriptionId?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 md:mb-8",
        action ? "md:flex-row md:items-end md:justify-between" : "",
        align === "center" && "items-center text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <div
          className={cn(
            "mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]",
            eyebrowClass ?? "text-brand",
            align === "center" && "justify-center",
          )}
        >
          <span className="rainbow-bar h-1 w-7 rounded-full" aria-hidden="true" />
          <T id={`${titleId}-eyebrow`} fallback={eyebrow} />
        </div>
        <T
          as="h2"
          id={titleId}
          fallback={title}
          className="font-display text-2xl font-bold tracking-tight text-ink md:text-[32px] md:leading-tight"
        />
        {description && (
          <T
            as="p"
            id={descriptionId ?? `${titleId}-desc`}
            fallback={description}
            className="mt-2.5 text-sm leading-relaxed text-[#4a6a86] md:text-[15px]"
          />
        )}
      </div>
      {action}
    </div>
  );
}

export function LineBadge({ line, className }: { line: LineKey; className?: string }) {
  const meta = LINE_META[line];
  if (!meta) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[10.5px] font-bold uppercase tracking-wider",
        className,
      )}
      style={{ background: meta.soft, color: meta.color, border: `1px solid ${meta.color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
      {meta.short}
    </span>
  );
}

export function PageHero({
  eyebrow,
  titleId,
  title,
  description,
  descriptionId,
  children,
}: {
  eyebrow: string;
  titleId: string;
  title: string;
  description: string;
  descriptionId: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="mt-4">
      <div className="surface hero-mesh relative overflow-hidden rounded-3xl px-5 py-8 md:px-10 md:py-10">
        <div className="rainbow-bar absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-[18px] border-white/50"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
            <span className="rainbow-ring h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            <T id={`${titleId}-eyebrow`} fallback={eyebrow} />
          </div>
          <T
            as="h1"
            id={titleId}
            fallback={title}
            className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-ink md:text-[44px]"
          />
          <T
            as="p"
            id={descriptionId}
            fallback={description}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4a6a86] md:text-base"
          />
          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </Reveal>
  );
}

export function Aurora() {
  return (
    <div className="aurora no-print" aria-hidden="true">
      <span className="aurora-blob b1" />
      <span className="aurora-blob b2" />
      <span className="aurora-blob b3" />
      <span className="aurora-blob b4" />
      <span className="aurora-grid" />
    </div>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Avatar({ name, color, size = "md" }: { name: string; color?: string; size?: "md" | "lg" }) {
  const initials = name
    .replace(/^(Profa?\.?\s*(Dra?\.?)?|Prof\.?\s*(Dr\.?)?)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white shadow-inner",
        size === "lg" ? "h-16 w-16 text-xl" : "h-11 w-11 text-sm",
      )}
      style={{ background: color ?? "#12619a" }}
      aria-hidden="true"
    >
      {initials || "P"}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9deee] bg-white/70 px-6 py-10 text-center">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-[#4a6a86]">{description}</p>}
    </div>
  );
}
