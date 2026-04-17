import { Boxes } from "lucide-react";
import { cn } from "../lib/utils";
import { Card, Badge, Provider, OPENAI_MODELS, ANTHROPIC_MODELS, GEMINI_MODELS, OPENROUTER_MODELS } from "./Shared";

export type ModelStatus = { id: string; provider: string; enabled: boolean };
export type GroupSummary = { total: number; enabled: number };

export default function PageModels({
  baseUrl, apiKey, modelStatus, summary, onRefresh, onToggleProvider, onToggleModel
}: {
  baseUrl: string; apiKey: string; modelStatus: ModelStatus[]; summary: Record<string, GroupSummary>;
  onRefresh: () => void; onToggleProvider: (p: string, e: boolean) => void; onToggleModel: (id: string, e: boolean) => void;
}) {
  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <Boxes className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Vui lòng nhập API Key ở trang Tổng quan để xem Mô hình</p>
      </div>
    );
  }

  const groups = [
    { title: "OpenAI", provider: "openai" as Provider, models: OPENAI_MODELS },
    { title: "Anthropic", provider: "anthropic" as Provider, models: ANTHROPIC_MODELS },
    { title: "Google Gemini", provider: "gemini" as Provider, models: GEMINI_MODELS },
    { title: "OpenRouter", provider: "openrouter" as Provider, models: OPENROUTER_MODELS },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {groups.map((g) => {
        const sum = summary[g.provider] ?? { total: g.models.length, enabled: g.models.length };
        const isAllEnabled = sum.enabled === sum.total && sum.total > 0;
        
        return (
          <Card key={g.provider} variant="standard" className="p-0 overflow-hidden">
            <div className="bg-surface-2/50 px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-text text-sm font-heading">{g.title}</div>
                <div className="text-[11px] font-mono text-text-subtle bg-surface px-2 py-0.5 rounded border border-border-strong">
                  {sum.enabled}/{sum.total}
                </div>
              </div>
              <button
                onClick={() => onToggleProvider(g.provider, !isAllEnabled)}
                className="text-[11px] font-medium text-text-muted hover:text-text px-3 py-1.5 bg-bg border border-border rounded-md transition-colors hover:bg-surface-2"
              >
                {isAllEnabled ? "Tắt tất cả" : "Bật tất cả"}
              </button>
            </div>
            
            <div className="flex flex-col">
              {g.models.map((m) => {
                const status = modelStatus.find(ms => ms.id === m.id);
                const enabled = status ? status.enabled : true;
                return (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-surface-2/30 transition-colors">
                    <code className="font-mono text-[12.5px] text-accent w-[240px] shrink-0 truncate">{m.id}</code>
                    <span className="text-[12px] text-text-subtle flex-1 truncate">{m.desc}</span>
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        {m.context && <span className="text-[10px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono">{m.context}</span>}
                        {m.badge && <Badge variant={m.badge} />}
                      </div>
                      <button
                        onClick={() => onToggleModel(m.id, !enabled)}
                        className={cn(
                          "relative w-9 h-5 rounded-full shrink-0 transition-colors border",
                          enabled ? "bg-accent border-accent/50" : "bg-surface-2 border-border-strong"
                        )}
                      >
                        <span className={cn(
                          "absolute top-[1px] w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                          enabled ? "left-[18px]" : "left-[1px]"
                        )} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}