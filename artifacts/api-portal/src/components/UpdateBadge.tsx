import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/utils";

interface VersionInfo {
  version: string;
  name?: string;
  releaseNotes?: string;
  hasUpdate: boolean;
  latestVersion?: string;
  latestReleaseNotes?: string;
  latestReleaseDate?: string;
  checkError?: string;
}

interface Props {
  baseUrl: string;
  apiKey: string;
}

export default function UpdateBadge({ baseUrl, apiKey: _apiKey }: Props) {
  const [info, setInfo] = useState<VersionInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkDone, setCheckDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchVersion = useCallback(async () => {
    try {
      const r = await fetch(`${baseUrl}/api/update/version`);
      if (r.ok) setInfo(await r.json());
    } catch {}
  }, [baseUrl]);

  const manualCheck = async () => {
    setChecking(true);
    setCheckDone(false);
    try {
      const r = await fetch(`${baseUrl}/api/update/version`);
      if (r.ok) setInfo(await r.json());
    } catch {}
    setChecking(false);
    setCheckDone(true);
    setTimeout(() => setCheckDone(false), 2000);
  };

  useEffect(() => {
    fetchVersion();
    const t = setInterval(fetchVersion, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchVersion]);

  const buildAgentPrompt = (latestVer: string) =>
    `Hãy giúp tôi cập nhật AI Gateway lên phiên bản mới nhất ${latestVer}.\n` +
    `Lấy code mới nhất từ kho GitHub https://github.com/kimoanh11011998/ReplitAPI-GPT-ShopVn-, ghi đè lên các file dự án hiện tại (không cần giữ lại file cũ), ` +
    `sau đó chạy pnpm install, cuối cùng khởi động lại hai workflow "artifacts/api-server: API Server" và "artifacts/api-portal: web".`;

  const copyPrompt = async () => {
    if (!info?.latestVersion) return;
    try {
      await navigator.clipboard.writeText(buildAgentPrompt(info.latestVersion));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = buildAgentPrompt(info.latestVersion);
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!info) return null;

  const hasUpdate = info.hasUpdate;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2 px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold cursor-pointer transition-colors border",
          hasUpdate
            ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
            : "border-border bg-surface-2 text-text-muted hover:bg-border-strong hover:text-text"
        )}
      >
        {hasUpdate && (
          <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 animate-pulse" />
        )}
        v{info.version}
        {hasUpdate && <span className="text-[10px]">↑ {info.latestVersion}</span>}
      </button>

      {open && (
        <div
          className="absolute bottom-12 left-4 w-[400px] z-[2000] bg-surface border border-border shadow-2xl rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-text text-sm">Thông tin phiên bản AI Gateway</div>
              <div className="text-text-muted text-xs mt-1">
                Phiên bản hiện tại <span className="text-accent font-mono">v{info.version}</span>
              </div>
            </div>
            <button
              onClick={() => { setOpen(false); setCopied(false); }}
              className="text-text-subtle hover:text-text text-xl leading-none px-2"
            >×</button>
          </div>

          {info.releaseNotes && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-4">
              <div className="text-accent text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Ghi chú phiên bản hiện tại</div>
              <div className="text-text-subtle text-xs leading-relaxed">{info.releaseNotes}</div>
            </div>
          )}

          {info.checkError && !hasUpdate && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4 text-danger text-xs">
              Kiểm tra phiên bản thất bại: {info.checkError}
            </div>
          )}

          {!hasUpdate && !info.checkError && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-2.5 mb-4 text-success text-xs font-medium flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Đây là phiên bản mới nhất
            </div>
          )}

          {hasUpdate && (
            <>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3.5 mb-3">
                <div className="text-warning text-xs font-semibold mb-1.5">
                  Phát hiện phiên bản mới v{info.latestVersion}
                  {info.latestReleaseDate && (
                    <span className="font-normal text-warning/70 ml-2">{info.latestReleaseDate}</span>
                  )}
                </div>
                {info.latestReleaseNotes && (
                  <div className="text-text-subtle text-[12px] leading-relaxed">
                    {info.latestReleaseNotes}
                  </div>
                )}
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3.5 mb-3">
                <div className="text-accent text-[11px] font-semibold mb-2">
                  📋 Cách cập nhật — Sao chép hướng dẫn → Dán vào hộp chat Replit AI
                </div>
                <pre className="m-0 p-3 bg-black/40 rounded-md text-[11px] text-text-subtle leading-relaxed whitespace-pre-wrap break-words font-mono max-h-[120px] overflow-y-auto">
                  {buildAgentPrompt(info.latestVersion ?? "")}
                </pre>
                <button
                  onClick={copyPrompt}
                  className={cn(
                    "mt-3 w-full py-2 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2 border",
                    copied
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20"
                  )}
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Đã sao chép vào clipboard!</> : <><Copy className="w-3.5 h-3.5" /> Sao chép hướng dẫn</>}
                </button>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              onClick={manualCheck}
              disabled={checking}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors border",
                checkDone
                  ? "bg-success/10 text-success border-success/30"
                  : checking
                  ? "bg-transparent text-text-subtle border-border cursor-not-allowed"
                  : "bg-surface-2 text-text-muted border-border hover:bg-border-strong hover:text-text"
              )}
            >
              {checking && <span className="animate-spin inline-block">⟳</span>}
              {checking ? "Đang kiểm tra…" : checkDone ? "✓ Hoàn tất" : "Kiểm tra lại"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}