import { useRef } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "../utils/cn";
import { useSite } from "../store";
import { TAB_LABELS, type TabId } from "../types";
import { SiteImage } from "./ui";

export function Header() {
  const { activeTab, goTo, content } = useSite();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasOpen = content.notices.some((n) => n.status === "Aberto");

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const ids = TAB_LABELS.map((tab) => tab.id);
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % ids.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + ids.length) % ids.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = ids.length - 1;
    else return;
    event.preventDefault();
    const nextId = ids[nextIndex];
    goTo(nextId);
    tabRefs.current[nextId]?.focus();
  };

  const onTabClick = (id: TabId) => {
    goTo(id);
  };

  return (
    <header className="site-header no-print fixed inset-x-0 top-0 z-40 border-b border-[#dbe8f4] bg-white/88 shadow-[0_8px_30px_-24px_rgba(13,58,102,0.5)] backdrop-blur-xl">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("conteudo")?.focus();
        }}
      >
        Ir para o conteúdo
      </a>
      <div className="mx-auto max-w-7xl px-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 md:h-[74px] md:flex-nowrap md:justify-between md:gap-4 md:py-0">
          <button
            type="button"
            onClick={() => goTo("inicio")}
            className="order-1 flex shrink-0 items-center gap-2.5 rounded-xl p-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="PANDORA — ir para a página inicial"
          >
            <SiteImage
              imageKey="logo"
              loading="eager"
              imgClassName="h-9 w-auto max-w-[168px] object-contain sm:h-11 sm:max-w-[210px]"
              className="h-9 w-[150px] sm:h-11 sm:w-[200px]"
            />
  {/*
            <span className="hidden h-9 w-px bg-[#d5e5f2] xl:block" aria-hidden="true" />
            <span className="hidden flex-col leading-tight xl:flex">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">
                Macroprojeto &amp; Grupo de Pesquisa
              </span>
              <span className="text-[10.5px] font-medium text-[#5c7c98]">Ensino de Ciências e Tecnologias · UFCG</span>
            </span>
          */}
          </button>

          <div className="order-2 ml-auto hidden items-center gap-2 lg:flex xl:ml-0">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#d7e7f4] bg-[#f5faff] px-2.5 py-1 text-[10.5px] font-semibold text-[#3c6285] 2xl:inline-flex">
              <MapPin className="h-3 w-3 text-green-p" aria-hidden="true" />
              UACB · CSTR · UFCG · Campus Patos
            </span>
            {hasOpen && (
              <button
                type="button"
                onClick={() => goTo("editais")}
                className="hidden items-center gap-1 rounded-full bg-[#e9f7ef] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#0f7542] ring-1 ring-[#bfe8d1] transition hover:bg-[#d9f2e4] xl:inline-flex"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-p opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-p" />
                </span>
                Inscrições abertas
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>

          <nav
            role="tablist"
            aria-label="Seções do site"
            className="order-3 -mb-1 flex w-full shrink-0 items-center justify-between gap-0.5 overflow-hidden border-t border-[#e8f1f8] pt-1 md:order-last md:mb-0 md:ml-auto md:w-auto md:justify-end md:gap-1 md:border-0 md:pt-0"
          >
            {TAB_LABELS.map((tab, index) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  id={`tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onTabClick(tab.id)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full px-1 py-1.5 text-[10px] font-semibold transition sm:gap-1.5 sm:px-2.5 sm:text-[11px] md:flex-none md:px-3.5 md:py-2 md:text-[13px]",
                    selected
                      ? "bg-gradient-to-r from-[#0d3a66] to-[#12619a] text-white shadow-[0_8px_18px_-10px_rgba(13,58,102,0.9)]"
                      : "text-[#33587a] hover:bg-[#eef6fc] hover:text-brand-deep",
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: selected ? "#f9bd19" : tab.dot }}
                    aria-hidden="true"
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="rainbow-bar h-[3px] w-full" aria-hidden="true" />
    </header>
  );
}
