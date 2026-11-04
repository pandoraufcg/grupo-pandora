import { Mail, MapPin } from "lucide-react";
import { useSite } from "../store";
import { TAB_LABELS } from "../types";
import { Inline, InstagramIcon, SiteImage } from "./ui";

export function Footer() {
  const { content, goTo, update } = useSite();
  const { settings } = content;

  return (
    <footer className="relative mt-16 border-t border-[#dbe8f4] bg-white/80 backdrop-blur">
      <div className="rainbow-bar h-1.5 w-full" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <SiteImage
              imageKey="logo"
              imgClassName="h-12 w-auto max-w-[220px] object-contain"
              className="h-12 w-[190px]"
            />
            <Inline
              as="p"
              value={settings.footerText}
              label="texto do rodapé"
              multiline
              className="mt-4 max-w-xl text-[13px] leading-relaxed text-[#4a6a86]"
              onCommit={(value) =>
                update((draft) => {
                  draft.settings.footerText = value;
                })
              }
            />
          </div>

          <nav aria-label="Links do rodapé">
            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-brand-deep">Navegação</h2>
            <ul className="mt-3 space-y-2">
              {TAB_LABELS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => goTo(tab.id)}
                    className="group inline-flex items-center gap-2 text-[13px] font-medium text-[#33587a] transition hover:text-brand"
                  >
                    <span className="h-1 w-1 rounded-full" style={{ background: tab.dot }} aria-hidden="true" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-brand-deep">Contato</h2>
            <ul className="mt-3 space-y-2.5 text-[13px] text-[#33587a]">
              <li>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium transition hover:text-brand"
                >
                  <InstagramIcon className="h-4 w-4 text-magenta-p" />
                  {settings.instagram}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 font-medium transition hover:text-brand"
                >
                  <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-[#5c7c98]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-p" aria-hidden="true" />
                UACB/CSTR/UFCG · Campus Patos — Paraíba, Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#e3eef7] pt-5 text-[11.5px] text-[#617f99] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Grupo de Pesquisa PANDORA. Todos os direitos reservados.</p>
          <p className="flex items-center gap-2">
            <span className="rainbow-ring h-2 w-2 rounded-full" aria-hidden="true" />
            Ensino de Ciências e Tecnologias · UACB/CSTR/UFCG · Campus Patos
          </p>
        </div>
      </div>
    </footer>
  );
}
