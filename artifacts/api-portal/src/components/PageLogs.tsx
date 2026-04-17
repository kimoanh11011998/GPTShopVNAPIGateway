import { useState, useEffect, useRef, useCallback } from "react";
import { Download, Trash2, Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/utils";

interface LogEntry {
  id: number;
  time: string;
  method: string;
  path: string;
  model?: string;
  backend?: string;
  status: number;
  duration: number;
  stream: boolean;
  promptTokens?: number;
  completionTokens?: number;
  level: "info" | "warn" | "error";
  error?: string;
}

export default function PageLogs({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const unmounted = useRef(false);

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) { clearTimeout(reconnectTimer.current); reconnectTimer.current = null; }
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (unmounted.current) return;
    const delay = Math.min(2000 * Math.pow(2, retryCount.current), 30000);
    retryCount.current++;
    reconnectTimer.current = setTimeout(() => {
      if (!unmounted.current) connectStream();
    }, delay);
  }, []);

  const connectStream = useCallback(async () => {
    if (!apiKey || unmounted.current) return;
    cleanup();

    try {
      const histRes = await fetch(`${baseUrl}/api/v1/admin/logs`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!histRes.ok) {
        const body = await histRes.json().catch(() => ({}));
        const msg = body?.error?.message || `HTTP ${histRes.status}`;
        setConnError(msg);
        setConnected(false);
        scheduleReconnect();
        return;
      }
      const histData = await histRes.json();
      if (histData.logs && !unmounted.current) setLogs(histData.logs);
    } catch {
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/logs/stream?key=${encodeURIComponent(apiKey)}`, {
        headers: { Accept: "text/event-stream" },
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error?.message || `HTTP ${res.status}`;
        setConnError(msg);
        setConnected(false);
        scheduleReconnect();
        return;
      }

      setConnected(true);
      setConnError(null);
      retryCount.current = 0;

      const reader = res.body?.getReader();
      if (!reader) { scheduleReconnect(); return; }
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done || unmounted.current) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const entry = JSON.parse(line.slice(6)) as LogEntry;
              setLogs((prev) => {
                const next = [...prev, entry];
                return next.length > 200 ? next.slice(-200) : next;
              });
            } catch {}
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }

    if (!unmounted.current) {
      setConnected(false);
      scheduleReconnect();
    }
  }, [baseUrl, apiKey, cleanup, scheduleReconnect]);

  useEffect(() => {
    unmounted.current = false;
    connectStream();
    return () => {
      unmounted.current = true;
      cleanup();
      setConnected(false);
    };
  }, [connectStream, cleanup]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  const downloadLogs = () => {
    const text = filtered.map((l) =>
      `[${l.time}] ${l.level.toUpperCase()} ${l.method} ${l.path} → ${l.status} ${l.duration}ms ${l.model ?? ""} (${l.backend ?? ""})`
    ).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `proxy-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <WifiOff className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Vui lòng nhập API Key ở trang Tổng quan để xem nhật ký</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", connected ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-danger")} />
            <span className={cn("text-xs font-semibold", connected ? "text-success" : "text-danger")}>
              {connected ? "Đang theo dõi" : connError ? `Lỗi: ${connError}` : "Đang kết nối lại..."}
            </span>
          </div>
          {!connected && (
            <button
              onClick={() => { retryCount.current = 0; setConnError(null); connectStream(); }}
              className="text-xs px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20"
            >
              Thử lại ngay
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {(["all", "info", "warn", "error"] as const).map((lv) => (
            <button
              key={lv}
              onClick={() => setFilter(lv)}
              className={cn(
                "text-[11px] px-3 py-1 rounded-full uppercase font-medium tracking-wide transition-colors border",
                filter === lv
                  ? lv === "error" ? "bg-danger/10 text-danger border-danger/30"
                  : lv === "warn" ? "bg-warning/10 text-warning border-warning/30"
                  : lv === "info" ? "bg-success/10 text-success border-success/30"
                  : "bg-accent/10 text-accent border-accent/30"
                  : "bg-transparent text-text-muted border-border hover:bg-surface-2"
              )}
            >
              {lv === "all" ? "Tất cả" : lv}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-border mx-2" />

          <label className="flex items-center gap-2 text-[11px] text-text-muted cursor-pointer hover:text-text select-none">
            <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="accent-accent" />
            Cuộn tự động
          </label>

          <button onClick={downloadLogs} className="flex items-center justify-center w-7 h-7 rounded-md bg-surface-2 text-text-subtle hover:text-text hover:bg-border-strong transition-colors border border-border" title="Tải xuống">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setLogs([])} className="flex items-center justify-center w-7 h-7 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors border border-danger/20" title="Xóa">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Viewer */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-[400px] max-h-[600px] overflow-y-auto bg-[#0a0a0c] rounded-xl border border-border p-4 font-mono text-[12px] leading-relaxed"
      >
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-subtle">
            <p>{connected ? "Đang chờ request mới..." : connError ? "Lỗi kết nối. Vui lòng kiểm tra lại cấu hình." : "Đang kết nối đến server..."}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-start sm:items-center gap-3 py-1 hover:bg-white/5 rounded px-1 transition-colors border-b border-white/[0.02] last:border-0 group">
                <span className="text-text-subtle shrink-0 tabular-nums">{l.time.slice(11, 19)}</span>
                <span className={cn(
                  "w-12 shrink-0 font-semibold uppercase text-[10px] tracking-wider",
                  l.level === "error" ? "text-danger" : l.level === "warn" ? "text-warning" : "text-success"
                )}>
                  {l.level}
                </span>
                <span className={cn(
                  "w-12 shrink-0 font-bold",
                  l.method === "GET" ? "text-success/80" : l.method === "POST" ? "text-accent/80" : "text-text-muted"
                )}>{l.method}</span>
                <span className="text-text truncate flex-1">{l.path}</span>
                {l.model && <span className="text-accent/70 shrink-0 hidden sm:inline-block max-w-[150px] truncate">{l.model}</span>}
                <span className={cn(
                  "w-10 shrink-0 text-right tabular-nums",
                  l.status >= 500 ? "text-danger" : l.status >= 400 ? "text-warning" : "text-success"
                )}>{l.status}</span>
                <span className="w-16 shrink-0 text-right text-text-subtle tabular-nums">{l.duration}ms</span>
                {l.stream ? <span className="w-8 shrink-0 text-right text-accent/50 text-[10px]">SSE</span> : <span className="w-8 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-text-subtle">
        <span>Hiển thị {filtered.length} / {logs.length} dòng</span>
        <span>Lưu tối đa 200 dòng mới nhất</span>
      </div>
    </div>
  );
}