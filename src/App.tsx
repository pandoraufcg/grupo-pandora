import { SiteProvider, useSite } from "./store";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Aurora } from "./components/ui";
import { Home } from "./sections/Home";
import { Research } from "./sections/Research";
import { Publications } from "./sections/Publications";
import { Notices } from "./sections/Notices";
import { TAB_LABELS } from "./types";
import { cn } from "./utils/cn";

function SiteShell() {
  const { activeTab } = useSite();

  return (
    <div className="min-h-screen">
      <Aurora />
      <Header />

      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-7xl px-3 pb-28 pt-[104px] outline-none sm:px-5 md:pb-32 md:pt-[94px]">
        {TAB_LABELS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <div key={tab.id}>
              <h2 className="print-tab-title mb-4 border-b-2 border-[#12619a] pb-2 font-display text-xl font-bold text-[#0e2340]">
                PANDORA · {tab.label}
              </h2>
              <section
                id={`panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
                inert={!active ? true : undefined}
                className={cn("tab-panel focus-visible:outline-none", active && "is-active")}
              >
                {tab.id === "inicio" && <Home />}
                {tab.id === "pesquisa" && <Research />}
                {tab.id === "publicacoes" && <Publications />}
                {tab.id === "editais" && <Notices />}
              </section>
            </div>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <SiteShell />
    </SiteProvider>
  );
}
