import { useState, useEffect, useCallback } from "react";
import { Settings, Menu } from "lucide-react";
import SetupWizard from "./components/SetupWizard";
import PageDocs from "./components/PageDocs";
import PageLogs from "./components/PageLogs";
import PageHome from "./components/PageHome";
import PageStats from "./components/PageStats";
import PageModels from "./components/PageModels";
import PageEndpoints from "./components/PageEndpoints";
import Sidebar, { Tab, TABS } from "./components/Sidebar";

export default function App() {
  const [tab, setTabRaw] = useState<Tab>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const setTab = (t: Tab) => { setTabRaw(t); setMobileNavOpen(false); };
  const [online, setOnline] = useState<boolean | null>(null);
  const [sillyTavernMode, setSillyTavernMode] = useState(false);
  const [stLoading, setStLoading] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("proxy_api_key") ?? "");
  const [showWizard, setShowWizard] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [modelStats, setModelStats] = useState<any>(null);
  const [statsError, setStatsError] = useState<false | "auth" | "server">(false);
  const [routing, setRouting] = useState<{ localEnabled: boolean; localFallback: boolean; fakeStream: boolean }>({ localEnabled: true, localFallback: true, fakeStream: true });
  const [addUrl, setAddUrl] = useState("");
  const [addState, setAddState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [addMsg, setAddMsg] = useState("");
  const [modelStatus, setModelStatus] = useState<any[]>([]);
  const [modelSummary, setModelSummary] = useState<any>({});

  const baseUrl = window.location.origin;
  const displayUrl: string = (import.meta.env.VITE_BASE_URL as string | undefined) ?? window.location.origin;

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/healthz`, { signal: AbortSignal.timeout(5000) });
      setOnline(res.ok);
    } catch { setOnline(false); }
  }, [baseUrl]);

  const fetchSTMode = useCallback(async () => {
    try {
      const key = localStorage.getItem("proxy_api_key") ?? "";
      const res = await fetch(`${baseUrl}/api/settings/sillytavern`, {
        headers: key ? { Authorization: `Bearer ${key}` } : {},
      });
      if (res.ok) { const d = await res.json(); setSillyTavernMode(d.enabled); }
    } catch {}
    setStLoading(false);
  }, [baseUrl]);

  const toggleSTMode = async () => {
    const newVal = !sillyTavernMode;
    setSillyTavernMode(newVal);
    try {
      const res = await fetch(`${baseUrl}/api/settings/sillytavern`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
        body: JSON.stringify({ enabled: newVal }),
      });
      if (!res.ok) setSillyTavernMode(!newVal);
    } catch { setSillyTavernMode(!newVal); }
  };

  const fetchStats = useCallback(async (key: string) => {
    if (!key) { setStats(null); setModelStats(null); setStatsError(false); return; }
    try {
      const r = await fetch(`${baseUrl}/api/v1/stats`, { headers: { Authorization: `Bearer ${key}` } });
      if (!r.ok) {
        setStatsError(r.status === 500 ? "server" : "auth");
        return;
      }
      const d = await r.json();
      const parsed: any = {};
      for (const [k, v] of Object.entries(d.stats as Record<string, any>)) {
        parsed[k] = { ...v, streamingCalls: v.streamingCalls ?? 0 };
      }
      setStats(parsed); setStatsError(false);
      setModelStats(d.modelStats && typeof d.modelStats === "object" ? d.modelStats : null);
      if (d.routing) setRouting(d.routing);
    } catch { setStatsError("auth"); }
  }, [baseUrl]);

  const fetchModels = useCallback(async (key: string = apiKey) => {
    if (!key) return;
    try {
      const r = await fetch(`${baseUrl}/api/v1/admin/models`, { headers: { Authorization: `Bearer ${key}` } });
      if (!r.ok) return;
      const d = await r.json();
      setModelStatus(d.models ?? []);
      setModelSummary(d.summary ?? {});
    } catch {}
  }, [baseUrl, apiKey]);

  const addBackend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUrl) return;
    let url = addUrl.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    url = url.replace(/\/+$/, "").replace(/\/v1$/, "").replace(/\/api$/, "");
    setAddState("loading");
    try {
      const r = await fetch(`${baseUrl}/api/v1/admin/backends`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await r.json();
      if (!r.ok) { setAddState("err"); setAddMsg(data.error ?? "Failed"); return; }
      setAddState("ok"); setAddMsg(`Đã thêm ${data.label}`); setAddUrl("");
      setTimeout(() => setAddState("idle"), 3000);
      fetchStats(apiKey);
    } catch { setAddState("err"); setAddMsg("Lỗi mạng"); }
  };

  const removeBackend = async (label: string) => {
    await fetch(`${baseUrl}/api/v1/admin/backends/${label}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    fetchStats(apiKey);
  };

  const toggleBackend = async (label: string, enabled: boolean) => {
    await fetch(`${baseUrl}/api/v1/admin/backends/${label}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    fetchStats(apiKey);
  };

  const batchToggleBackends = async (labels: string[], enabled: boolean) => {
    await fetch(`${baseUrl}/api/v1/admin/backends`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ labels, enabled }),
    });
    fetchStats(apiKey);
  };

  const batchRemoveBackends = async (labels: string[]) => {
    await Promise.all(labels.map((l) =>
      fetch(`${baseUrl}/api/v1/admin/backends/${l}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      })
    ));
    fetchStats(apiKey);
  };

  const toggleRouting = async (field: "localEnabled" | "localFallback" | "fakeStream", value: boolean) => {
    setRouting((prev) => ({ ...prev, [field]: value }));
    try {
      await fetch(`${baseUrl}/api/v1/admin/routing`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch {}
  };

  const toggleModelProvider = async (provider: string, enabled: boolean) => {
    setModelStatus((prev) => prev.map((m) => m.provider === provider ? { ...m, enabled } : m));
    setModelSummary((prev: any) => {
      const grp = prev[provider];
      if (!grp) return prev;
      return { ...prev, [provider]: { total: grp.total, enabled: enabled ? grp.total : 0 } };
    });
    try {
      await fetch(`${baseUrl}/api/v1/admin/models`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ provider, enabled }),
      });
    } catch {}
    fetchModels();
  };

  const toggleModelById = async (id: string, enabled: boolean) => {
    setModelStatus((prev) => prev.map((m) => m.id === id ? { ...m, enabled } : m));
    setModelSummary((prev: any) => {
      const m = modelStatus.find((ms) => ms.id === id);
      if (!m) return prev;
      const grp = prev[m.provider];
      if (!grp) return prev;
      const delta = enabled ? 1 : -1;
      return { ...prev, [m.provider]: { total: grp.total, enabled: Math.max(0, Math.min(grp.total, grp.enabled + delta)) } };
    });
    try {
      await fetch(`${baseUrl}/api/v1/admin/models`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id], enabled }),
      });
    } catch {}
    fetchModels();
  };

  useEffect(() => {
    checkHealth();
    fetchSTMode();
    fetchStats(apiKey);
    fetchModels(apiKey);
    const iv1 = setInterval(checkHealth, 30000);
    const iv2 = setInterval(() => fetchStats(apiKey), 15000);
    return () => { clearInterval(iv1); clearInterval(iv2); };
  }, [checkHealth, fetchSTMode, fetchStats, fetchModels, apiKey]);

  useEffect(() => {
    if (sessionStorage.getItem("wizard_dismissed") === "1") return;
    fetch(`${baseUrl}/api/setup-status`)
      .then((r) => r.ok ? r.json() : null)
      .then((status) => {
        if (!status || status.configured) return;
        setShowWizard(true);
      })
      .catch(() => {});
  }, [baseUrl]);

  return (
    <div className="min-h-[100dvh] bg-bg flex font-sans text-text">
      {showWizard && (
        <SetupWizard
          baseUrl={baseUrl}
          onComplete={(key) => {
            sessionStorage.setItem("wizard_dismissed", "1");
            setShowWizard(false);
            if (key) { setApiKey(key); localStorage.setItem("proxy_api_key", key); }
          }}
          onDismiss={() => { sessionStorage.setItem("wizard_dismissed", "1"); setShowWizard(false); }}
        />
      )}

      {showDocs ? (
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setShowDocs(false)} className="mb-6 text-sm text-accent hover:underline">← Quay lại trang quản lý</button>
            <h1 className="text-3xl font-bold font-heading mb-6 text-text">Tài liệu API</h1>
            <PageDocs />
          </div>
        </div>
      ) : (
        <>
          <Sidebar
            tab={tab}
            setTab={setTab}
            online={online}
            baseUrl={baseUrl}
            apiKey={apiKey}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />

          <main className="flex-1 md:ml-[240px] max-w-[1200px] w-full px-4 sm:px-6 md:px-10 py-5 md:py-10">
            <div className="mb-6 md:mb-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Mở menu"
                className="md:hidden w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-text bg-surface-2 hover:bg-border-strong border border-border transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-text mb-1 font-heading truncate">{TABS.find(t => t.id === tab)?.label}</h1>
                <p className="hidden sm:block text-sm text-text-subtle m-0">Quản lý và giám sát API Gateway của bạn.</p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-surface-2 hover:bg-border-strong text-text font-medium text-xs rounded-lg transition-colors border border-border shadow-[0_0_15px_rgba(0,0,0,0.2)] shrink-0"
              >
                <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Trợ lý cấu hình</span>
              </button>
            </div>

            {tab === "home" && <PageHome displayUrl={displayUrl} apiKey={apiKey} setApiKey={setApiKey} sillyTavernMode={sillyTavernMode} stLoading={stLoading} onToggleSTMode={toggleSTMode} onOpenWizard={() => setShowWizard(true)} onOpenDocs={() => setShowDocs(true)} />}
            {tab === "stats" && <PageStats baseUrl={baseUrl} apiKey={apiKey} stats={stats} statsError={statsError} onRefresh={() => fetchStats(apiKey)} addUrl={addUrl} setAddUrl={setAddUrl} addState={addState} addMsg={addMsg} onAddBackend={addBackend} onRemoveBackend={removeBackend} onToggleBackend={toggleBackend} onBatchToggle={batchToggleBackends} onBatchRemove={batchRemoveBackends} routing={routing} onToggleRouting={toggleRouting} modelStats={modelStats} />}
            {tab === "models" && <PageModels baseUrl={baseUrl} apiKey={apiKey} modelStatus={modelStatus} summary={modelSummary} onRefresh={() => fetchModels(apiKey)} onToggleProvider={toggleModelProvider} onToggleModel={toggleModelById} />}
            {tab === "endpoints" && <PageEndpoints baseUrl={baseUrl} />}
            {tab === "logs" && <PageLogs baseUrl={baseUrl} apiKey={apiKey} />}

            <div className="mt-16 text-center text-[11px] text-text-subtle pb-8 font-mono tracking-wider">
              GPTShopVN · Version 1.0
            </div>
          </main>
        </>
      )}
    </div>
  );
}