import { Power, Home, BarChart3, Boxes, Cable, ScrollText, X } from "lucide-react";
import { cn } from "../lib/utils";
import UpdateBadge from "./UpdateBadge";

export type Tab = "home" | "stats" | "models" | "endpoints" | "logs";

export const TABS = [
  { id: "home" as Tab, label: "Tổng quan", icon: <Home className="w-4 h-4" /> },
  { id: "stats" as Tab, label: "Thống kê", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "models" as Tab, label: "Mô hình", icon: <Boxes className="w-4 h-4" /> },
  { id: "endpoints" as Tab, label: "Endpoints", icon: <Cable className="w-4 h-4" /> },
  { id: "logs" as Tab, label: "Nhật ký", icon: <ScrollText className="w-4 h-4" /> },
];

export default function Sidebar({
  tab, setTab, online, baseUrl, apiKey, mobileOpen = false, onCloseMobile
}: {
  tab: Tab; setTab: (t: Tab) => void; online: boolean | null; baseUrl: string; apiKey: string;
  mobileOpen?: boolean; onCloseMobile?: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-[260px] md:w-[240px] bg-surface/95 md:bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Power className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-bold text-[15px] text-text tracking-tight font-heading">GPT ShopVN</div>
            <div className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold">Free API Gateway</div>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Đóng menu"
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-text-subtle hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1.5">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group overflow-hidden",
                active ? "text-accent bg-accent/10 border border-accent/20 shadow-inner" : "text-text-subtle hover:text-text hover:bg-surface-2 border border-transparent"
              )}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />}
              <span className={cn("transition-colors", active ? "text-accent" : "text-text-muted group-hover:text-text")}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 bg-surface-2/30">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", online === null ? "bg-text-subtle" : online ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]")} />
            <span className="text-[11px] font-semibold text-text-subtle">
              {online === null ? "Đang kết nối..." : online ? "Trực tuyến" : "Ngoại tuyến"}
            </span>
          </div>
        </div>
        <UpdateBadge baseUrl={baseUrl} apiKey={apiKey} />
      </div>
    </aside>
    </>
  );
}