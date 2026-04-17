import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Trash2, AlertCircle, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { Card, SectionTitle, getModelPrice, estimateModelCost, DEFAULT_PRICING } from "./Shared";

type BackendStat = { calls: number; errors: number; streamingCalls: number; promptTokens: number; completionTokens: number; totalTokens: number; avgDurationMs: number; avgTtftMs: number | null; health: string; url?: string; dynamic?: boolean; enabled?: boolean };
type ModelStat = { calls: number; promptTokens: number; completionTokens: number };

function FleetManager() {
  const [instances, setInstances] = useState<{ id: string; name: string; url: string; key: string; status: "ok" | "error" | "checking" | "updating" | "restarting"; version: string | null; latestVersion: string | null; updateAvailable: boolean; lastChecked: number; updateLog: string | null; }[]>(() => {
    try { return JSON.parse(localStorage.getItem("proxy_fleet") || "[]"); } catch { return []; }
  });
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addKey, setAddKey] = useState("");

  const persist = (data: any[]) => localStorage.setItem("proxy_fleet", JSON.stringify(data));

  const addInst = () => {
    let u = addUrl.trim();
    if (!u.startsWith("http")) u = `https://${u}`;
    u = u.replace(/\/+$/, "").replace(/\/v1$/, "").replace(/\/api$/, "");
    const inst = { id: crypto.randomUUID(), name: addName.trim() || new URL(u).hostname, url: u, key: addKey.trim(), status: "checking" as const, version: null, latestVersion: null, updateAvailable: false, lastChecked: Date.now(), updateLog: null };
    const next = [...instances, inst];
    setInstances(next); persist(next);
    setAddName(""); setAddUrl(""); setAddKey("");
    checkOne(inst.id);
  };

  const removeInst = (id: string) => {
    const next = instances.filter((i) => i.id !== id);
    setInstances(next); persist(next);
  };

  const patchInst = (id: string, patch: Partial<typeof instances[0]>) => {
    setInstances((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, ...patch } : i);
      persist(next); return next;
    });
  };

  const checkOne = async (id: string) => {
    const inst = instances.find((i) => i.id === id);
    if (!inst) return;
    patchInst(id, { status: "checking" });
    try {
      const r = await fetch(`${inst.url}/api/update/version`, {
        headers: { Authorization: `Bearer ${inst.key}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json() as { version?: string; hasUpdate?: boolean; latestVersion?: string };
      patchInst(id, {
        status: "ok",
        version: d.version ?? null,
        latestVersion: d.latestVersion ?? null,
        updateAvailable: d.hasUpdate ?? false,
        lastChecked: Date.now(),
      });
    } catch {
      patchInst(id, { status: "error", lastChecked: Date.now() });
    }
  };

  const checkAll = async () => {
    await Promise.all(instances.map((i) => checkOne(i.id)));
  };

  const updateOne = async (id: string) => {
    const inst = instances.find((i) => i.id === id);
    if (!inst) return;
    patchInst(id, { status: "updating", updateLog: null });
    try {
      const r = await fetch(`${inst.url}/api/update/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${inst.key}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60000),
      });
      const d = await r.json() as { status?: string; message?: string };
      const logMsg = d.message ?? (r.ok ? "Lệnh cập nhật đã gửi, server sẽ tự động khởi động lại." : "Yêu cầu cập nhật thất bại.");
      patchInst(id, {
        status: r.ok ? "restarting" : "error",
        updateLog: logMsg,
        lastChecked: Date.now(),
      });
    } catch (e) {
      patchInst(id, { status: "error", updateLog: `Lỗi: ${(e as Error).message}`, lastChecked: Date.now() });
    }
  };

  const updateAll = async () => {
    const toUpdate = instances.filter((i) => i.updateAvailable);
    if (!toUpdate.length) return;
    for (const inst of toUpdate) await updateOne(inst.id);
  };

  return (
    <Card variant="standard">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Quản lý phiên bản cụm Node</SectionTitle>
        <div className="flex gap-2">
          {instances.some((i) => i.updateAvailable) && (
            <button onClick={updateAll} className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-colors">
              Cập nhật tất cả
            </button>
          )}
          <button onClick={checkAll} disabled={instances.length === 0} className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-surface-2 text-text-muted hover:text-text border border-border hover:bg-border-strong transition-colors disabled:opacity-50">
            Kiểm tra tất cả
          </button>
        </div>
      </div>
      <p className="text-[12.5px] text-text-subtle mb-4">
        Theo dõi và cập nhật hàng loạt các node con (qua API /api/update/apply). Yêu cầu nhập đúng URL gốc và mật khẩu của từng node.
      </p>

      <div className="flex flex-col gap-3">
        {instances.map((i) => (
          <div key={i.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-bg">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[13px] text-text truncate">{i.name}</span>
                  {i.status === "ok" && !i.updateAvailable && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-success/10 text-success border border-success/20">v{i.version}</span>}
                  {i.updateAvailable && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-warning/10 text-warning border border-warning/20 animate-pulse">v{i.version} ↑ {i.latestVersion}</span>}
                  {i.status === "checking" && <span className="text-[10px] text-text-subtle">Đang kiểm tra...</span>}
                  {i.status === "error" && <span className="text-[10px] text-danger">Lỗi kết nối</span>}
                  {i.status === "updating" && <span className="text-[10px] text-accent animate-pulse">Đang cập nhật...</span>}
                  {i.status === "restarting" && <span className="text-[10px] text-warning animate-pulse">Đang khởi động lại...</span>}
                </div>
                <div className="text-[11px] font-mono text-text-subtle truncate">{i.url}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => checkOne(i.id)} disabled={i.status === "checking" || i.status === "updating"} className="p-1.5 rounded bg-surface text-text-subtle hover:text-text border border-border hover:bg-border-strong transition-colors disabled:opacity-50">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {i.updateAvailable && (
                  <button onClick={() => updateOne(i.id)} disabled={i.status === "updating" || i.status === "restarting"} className="px-2 py-1 rounded text-[11px] font-medium bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-colors disabled:opacity-50">
                    Cập nhật
                  </button>
                )}
                <button onClick={() => removeInst(i.id)} className="p-1.5 rounded text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {i.updateLog && (
              <div className="mt-1 p-2 rounded bg-[#0a0a0c] border border-border-strong text-[11px] font-mono text-text-muted break-all shadow-inner">
                {i.updateLog}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-[12px] font-semibold text-text mb-3">Thêm Node vào trình quản lý</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Tên (tuỳ chọn)" value={addName} onChange={(e) => setAddName(e.target.value)} className="w-full sm:w-32 bg-bg border border-border-strong rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
          <input type="url" placeholder="https://node-url.replit.app" value={addUrl} onChange={(e) => setAddUrl(e.target.value)} className="flex-1 min-w-[200px] bg-bg border border-border-strong rounded-lg px-3 py-2 text-[12.5px] font-mono outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
          <input type="password" placeholder="Mật khẩu của node" value={addKey} onChange={(e) => setAddKey(e.target.value)} className="w-full sm:w-40 bg-bg border border-border-strong rounded-lg px-3 py-2 text-[12.5px] font-mono outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50" />
          <button onClick={addInst} disabled={!addUrl.trim() || !addKey.trim()} className="px-4 py-2 rounded-lg text-[12.5px] font-medium bg-surface-2 text-text border border-border hover:bg-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">Thêm</button>
        </div>
      </div>
    </Card>
  );
}

export default function PageStats({
  baseUrl, apiKey, stats, statsError, onRefresh,
  addUrl, setAddUrl, addState, addMsg, onAddBackend, onRemoveBackend,
  onToggleBackend, onBatchToggle, onBatchRemove,
  routing, onToggleRouting, modelStats,
}: {
  baseUrl: string; apiKey: string; stats: Record<string, BackendStat> | null; statsError: false | "auth" | "server";
  onRefresh: () => void; addUrl: string; setAddUrl: (u: string) => void; addState: "idle" | "loading" | "ok" | "err";
  addMsg: string; onAddBackend: (e: React.FormEvent) => void; onRemoveBackend: (label: string) => void;
  onToggleBackend: (label: string, enabled: boolean) => void; onBatchToggle: (labels: string[], enabled: boolean) => void;
  onBatchRemove: (labels: string[]) => void; routing: { localEnabled: boolean; localFallback: boolean; fakeStream: boolean };
  onToggleRouting: (field: "localEnabled" | "localFallback" | "fakeStream", value: boolean) => void; modelStats: Record<string, ModelStat> | null;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [envPromptCopied, setEnvPromptCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [budgetCap, setBudgetCap] = useState<number | null>(null);
  const [budgetEditing, setBudgetEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    fetch(`${baseUrl}/api/settings/budget`, { headers: { Authorization: `Bearer ${apiKey}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d && (typeof d.capUsd === "number" || d.capUsd === null)) setBudgetCap(d.capUsd); })
      .catch(() => {});
  }, [apiKey, baseUrl]);

  const saveBudget = (val: number | null) => {
    setBudgetSaving(true);
    fetch(`${baseUrl}/api/settings/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ capUsd: val }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setBudgetCap(d.capUsd); setBudgetEditing(false); })
      .finally(() => setBudgetSaving(false));
  };

  const ENV_NODE_PROMPT =
    `Hãy thêm một biến môi trường vào dự án Replit hiện tại để đăng ký node con thành ENV node vĩnh viễn (không mất sau khi Publish):\n\n` +
    `Bước 1: Kiểm tra các tên biến môi trường sau, tìm ô trống đầu tiên chưa được đặt:\n` +
    `   FRIEND_PROXY_URL → FRIEND_PROXY_URL_2 → FRIEND_PROXY_URL_3 → … → FRIEND_PROXY_URL_20\n` +
    `   (Có thể xem tên đã dùng trong panel Secrets hoặc viewEnvVars())\n\n` +
    `Bước 2: Thêm Secret qua panel Replit Secrets cho ô trống đó, giá trị là địa chỉ trang web của node con sau khi Publish:\n` +
    `   https://[nhập địa chỉ node con sau khi Publish]\n` +
    `   Ví dụ: https://my-proxy.replit.app\n\n` +
    `Bước 3: Khởi động lại server (chạy lệnh khởi động trong Shell, hoặc nhấn nút Replit Run)\n\n` +
    `Lưu ý:\n` +
    `• Chỉ cần nhập đường dẫn gốc (không cần thêm /api), chương trình sẽ tự hoàn thiện\n` +
    `• Sau khi khởi động lại, node sẽ xuất hiện ngay trong trang thống kê và vẫn còn sau khi Publish\n` +
    `• ENV node và node động cùng tồn tại, cân bằng tải tự động`;

  const copyEnvPrompt = () => {
    navigator.clipboard.writeText(ENV_NODE_PROMPT).then(() => {
      setEnvPromptCopied(true);
      setTimeout(() => setEnvPromptCopied(false), 2000);
    });
  };

  const resetStats = () => {
    setResetting(true);
    fetch(`${baseUrl}/api/v1/admin/stats/reset`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
    }).then(() => { onRefresh(); setResetting(false); })
      .catch(() => setResetting(false));
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Vui lòng nhập API Key ở trang Tổng quan để xem thống kê</p>
      </div>
    );
  }

  const allSubNodes = stats ? Object.entries(stats).filter(([l]) => l !== "local") : [];
  const dynamicNodes = allSubNodes.filter(([, s]) => s.dynamic);

  const allSelected = allSubNodes.length > 0 && allSubNodes.every(([l]) => selected.has(l));
  const someSelected = selected.size > 0;

  const toggleSelect = (label: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(label) ? s.delete(label) : s.add(label); return s; });

  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(allSubNodes.map(([l]) => l)));

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  const totalModelCost = modelStats
    ? Object.entries(modelStats).reduce((sum, [model, ms]) => sum + estimateModelCost(model, ms.promptTokens, ms.completionTokens), 0)
    : null;

  const estimateCostFallback = (prompt: number, completion: number) => {
    return (prompt * DEFAULT_PRICING.input + completion * DEFAULT_PRICING.output) / 1_000_000;
  };

  const totals = stats ? Object.values(stats).reduce((acc, s) => ({
    calls: acc.calls + s.calls,
    errors: acc.errors + s.errors,
    streamingCalls: acc.streamingCalls + (s.streamingCalls ?? 0),
    promptTokens: acc.promptTokens + s.promptTokens,
    completionTokens: acc.completionTokens + s.completionTokens,
    totalTokens: acc.totalTokens + s.totalTokens,
  }), { calls: 0, errors: 0, streamingCalls: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 }) : { calls: 0, errors: 0, streamingCalls: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  const overallCost = totalModelCost ?? estimateCostFallback(totals.promptTokens, totals.completionTokens);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Budget Panel */}
      {(() => {
        const used = overallCost;
        const cap = budgetCap;
        const ratio = cap && cap > 0 ? Math.min(used / cap, 1) : 0;
        const pct = cap && cap > 0 ? (used / cap) * 100 : 0;
        const barColor = !cap ? "bg-border" : pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";
        const textColor = !cap ? "text-text-muted" : pct >= 90 ? "text-danger" : pct >= 70 ? "text-warning" : "text-success";
        return (
          <Card variant="standard">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div>
                <SectionTitle>Hạn mức ngân sách</SectionTitle>
                <div className="text-sm text-text-muted mt-2">
                  Đã dùng <span className="font-mono font-semibold text-text">${used.toFixed(4)}</span>
                  {cap !== null && cap > 0 && (
                    <> / <span className="font-mono font-semibold text-text">${cap.toFixed(2)}</span> <span className={textColor}>({pct.toFixed(1)}%)</span></>
                  )}
                  {(cap === null || cap === 0) && <span className="text-text-subtle"> · Chưa đặt giới hạn</span>}
                </div>
              </div>
              {!budgetEditing ? (
                <button
                  onClick={() => { setBudgetInput(cap ? String(cap) : ""); setBudgetEditing(true); }}
                  className="px-3 py-1.5 text-xs font-semibold border border-border hover:border-accent hover:text-accent rounded-md transition"
                >
                  {cap ? "Sửa hạn mức" : "Đặt hạn mức"}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="USD (0 = bỏ giới hạn)"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="px-2 py-1.5 text-xs font-mono bg-bg border border-border focus:border-accent focus:outline-none rounded-md w-44"
                    autoFocus
                  />
                  <button
                    disabled={budgetSaving}
                    onClick={() => {
                      const v = parseFloat(budgetInput);
                      if (budgetInput === "" || isNaN(v) || v <= 0) saveBudget(null);
                      else saveBudget(v);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-accent text-accent-foreground rounded-md disabled:opacity-50"
                  >Lưu</button>
                  <button
                    onClick={() => setBudgetEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-surface-2"
                  >Hủy</button>
                </div>
              )}
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden border border-border mt-3">
              <div className={cn("h-full transition-all", barColor)} style={{ width: `${ratio * 100}%` }} />
            </div>
            {cap !== null && cap > 0 && pct >= 70 && (
              <div className={cn("mt-2 text-xs", textColor)}>
                {pct >= 100
                  ? `Đã vượt hạn mức ${(used - cap).toFixed(4)} USD`
                  : pct >= 90
                  ? `Cảnh báo: sắp chạm hạn mức, còn $${(cap - used).toFixed(4)}`
                  : `Đã dùng hơn 70% hạn mức, còn $${(cap - used).toFixed(4)}`}
              </div>
            )}
          </Card>
        );
      })()}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Tổng số gọi", value: fmt(totals.calls) },
          { label: "Lỗi", value: fmt(totals.errors) },
          { label: "Tổng Tokens", value: fmt(totals.totalTokens) },
          { label: "Số Node", value: allSubNodes.length.toString() },
          { label: "Chi phí ước tính", value: `$${overallCost.toFixed(4)}` },
          { label: "Gọi streaming", value: fmt(totals.streamingCalls) }
        ].map((kpi, i) => (
          <Card key={i} variant="compact" className="p-5 flex flex-col justify-center items-center text-center">
            <div className="text-[10px] font-bold text-text-subtle tracking-[0.1em] uppercase mb-2 font-heading">{kpi.label}</div>
            <div className="text-xl md:text-2xl font-mono font-semibold text-text">{kpi.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={resetStats}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-[11px] font-semibold text-text-subtle hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-50"
        >
          {resetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Xóa dữ liệu thống kê
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Nodes Table */}
          <Card variant="standard">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Danh sách Node</SectionTitle>
              <button onClick={onRefresh} className="p-1.5 text-text-subtle hover:text-text rounded-md hover:bg-surface-2 transition-colors border border-transparent hover:border-border">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Add inline form */}
            <form onSubmit={onAddBackend} className="flex gap-2 mb-4">
              <input
                type="url" value={addUrl} onChange={(e) => setAddUrl(e.target.value)}
                placeholder="https://node-url.replit.app"
                className="flex-1 bg-bg border border-border-strong rounded-lg px-3 py-2 text-text font-mono text-[13px] outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
              <button type="submit" disabled={addState === "loading"} className="px-4 py-2 bg-surface-2 hover:bg-border-strong text-text font-medium text-[13px] rounded-lg transition-colors border border-border flex items-center gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Thêm Node
              </button>
            </form>
            {addState === "ok" && <p className="text-[11.5px] text-success m-0 mb-3">{addMsg}</p>}
            {addState === "err" && <p className="text-[11.5px] text-danger m-0 mb-3">{addMsg}</p>}

            {allSubNodes.length > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-accent"
                  />
                  <span className="text-[12px] text-text-muted group-hover:text-text transition-colors">
                    {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </span>
                </label>

                {someSelected && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { onBatchToggle([...selected], true); setSelected(new Set()); }}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-colors"
                    >Bật đã chọn</button>
                    <button
                      onClick={() => { onBatchToggle([...selected], false); setSelected(new Set()); }}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-colors"
                    >Tắt đã chọn</button>
                    {[...selected].some((l) => dynamicNodes.find(([dl]) => dl === l)) && (
                      <button
                        onClick={() => {
                          const dynamicSelected = [...selected].filter((l) => dynamicNodes.find(([dl]) => dl === l));
                          onBatchRemove(dynamicSelected);
                          setSelected(new Set());
                        }}
                        className="px-2 py-1 rounded text-[11px] font-medium bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors"
                      >Xóa node động</button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto border border-border rounded-lg bg-bg">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-[11px] text-text-subtle uppercase tracking-wider font-heading">
                    <th className="p-3 font-semibold w-8"></th>
                    <th className="p-3 font-semibold">Node</th>
                    <th className="p-3 font-semibold text-right">Trạng thái</th>
                    <th className="p-3 font-semibold text-right">Gọi</th>
                    <th className="p-3 font-semibold text-right">Lỗi</th>
                    <th className="p-3 font-semibold text-right">Tốc độ</th>
                    <th className="p-3 font-semibold text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="text-[13px] font-mono">
                  {allSubNodes.length === 0 ? (
                    <tr><td colSpan={7} className="py-6 text-center text-text-subtle text-xs font-sans">Chưa có node con nào</td></tr>
                  ) : allSubNodes.map(([label, s]) => (
                    <tr key={label} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(label)}
                          onChange={() => toggleSelect(label)}
                          className="w-3.5 h-3.5 accent-accent"
                        />
                      </td>
                      <td className="p-3 text-text-muted flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.enabled !== false ? (s.health === "healthy" ? "bg-success" : "bg-danger") : "bg-text-subtle")} />
                        <span className="truncate max-w-[200px]">{s.url ?? label}</span>
                        {!s.dynamic && <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded border border-border text-text-subtle shrink-0">ENV</span>}
                      </td>
                      <td className="p-3 text-right font-sans">
                        <button
                          onClick={() => onToggleBackend(label, !(s.enabled !== false))}
                          className={cn("text-[11px] font-medium hover:underline", s.enabled !== false ? "text-success" : "text-text-subtle")}
                        >
                          {s.enabled !== false ? "Đang bật" : "Đã tắt"}
                        </button>
                      </td>
                      <td className="p-3 text-right text-text-subtle">{s.calls}</td>
                      <td className="p-3 text-right text-danger">{s.errors > 0 ? s.errors : "-"}</td>
                      <td className="p-3 text-right text-text-subtle">{s.avgDurationMs}ms</td>
                      <td className="p-3 text-right">
                        {s.dynamic && (
                          <button
                            onClick={() => onRemoveBackend(label)}
                            className="text-danger/70 hover:text-danger p-1 rounded hover:bg-danger/10 transition-colors inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[12.5px] text-text font-semibold mb-2">Thêm qua biến môi trường (node vĩnh viễn)</div>
              <div className="text-[11.5px] text-text-subtle leading-relaxed mb-3">
                ENV node được lưu vào Secrets, không mất sau khi Publish. Gửi nội dung bên dưới cho Replit Agent để tự động hoàn tất cấu hình.
              </div>
              <div className="bg-[#030712] border border-border-strong rounded-lg p-3 flex items-start gap-3 group shadow-inner">
                <span className="flex-1 text-accent/80 text-[11px] font-mono leading-relaxed whitespace-pre-wrap select-all break-all h-20 overflow-y-auto custom-scrollbar pr-2">
                  {ENV_NODE_PROMPT}
                </span>
                <button
                  onClick={copyEnvPrompt}
                  className={cn(
                    "shrink-0 px-2 py-1.5 rounded border text-[11px] font-semibold transition-all",
                    envPromptCopied 
                      ? "bg-success/10 text-success border-success/30" 
                      : "bg-surface-2 text-text hover:bg-border-strong border-border-strong"
                  )}
                >
                  {envPromptCopied ? "Đã sao chép" : "Sao chép"}
                </button>
              </div>
            </div>
          </Card>
          
          <FleetManager />
        </div>

        <div className="flex flex-col gap-6">
          {/* Routing Settings */}
          <Card variant="standard">
            <SectionTitle>Routing</SectionTitle>
            <div className="flex flex-col gap-3">
              {[
                { field: "localEnabled" as const, label: "Bật backend cục bộ", desc: "Khi tắt, backend cục bộ hoàn toàn dừng, mọi request chỉ đi qua node con" },
                { field: "localFallback" as const, label: "Fallback về backend cục bộ", desc: "Khi tắt, kể cả khi tất cả node con ngoại tuyến cũng không gọi backend cục bộ" },
                { field: "fakeStream" as const, label: "Fake Streaming", desc: "Mô phỏng SSE streaming nếu backend không hỗ trợ" },
              ].map(({ field, label, desc }) => (
                <div key={field} className="flex items-center justify-between bg-surface-2/30 border border-border rounded-lg p-3">
                  <div className="pr-4">
                    <div className="text-[13px] font-semibold text-text">{label}</div>
                    <div className="text-[11px] text-text-subtle mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                  <button
                    onClick={() => onToggleRouting(field, !routing[field])}
                    className={cn(
                      "relative w-10 h-5.5 rounded-full shrink-0 transition-colors border",
                      routing[field] ? "bg-accent border-accent/50" : "bg-surface-2 border-border-strong"
                    )}
                  >
                    <span className={cn(
                      "absolute top-[1px] w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      routing[field] ? "left-[22px]" : "left-[1px]"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Model Stats */}
          {modelStats && Object.keys(modelStats).length > 0 && (
            <Card variant="standard">
              <SectionTitle>Chi phí theo mô hình</SectionTitle>
              <div className="flex flex-col gap-1">
                {Object.entries(modelStats)
                  .sort((a, b) => estimateModelCost(b[0], b[1].promptTokens, b[1].completionTokens) - estimateModelCost(a[0], a[1].promptTokens, a[1].completionTokens))
                  .map(([model, ms]) => {
                    const cost = estimateModelCost(model, ms.promptTokens, ms.completionTokens);
                    const pct = totalModelCost ? (cost / totalModelCost) * 100 : 0;
                    return (
                      <div key={model} className="flex flex-col gap-1 py-2 border-b border-border/50 last:border-0">
                        <div className="flex justify-between items-center text-[12px] font-mono">
                          <span className="text-accent truncate pr-4">{model}</span>
                          <span className="text-text-muted shrink-0">${cost.toFixed(4)}</span>
                        </div>
                        <div className="w-full h-1 bg-bg rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-accent" style={{ width: `${Math.max(1, pct)}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-text-subtle mt-0.5 font-mono">
                          <span>{ms.calls} calls</span>
                          <span>{ms.promptTokens + ms.completionTokens} tkns</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}