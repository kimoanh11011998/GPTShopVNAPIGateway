import { Globe, Cable, Settings, PlayCircle, Copy, AlertCircle, RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Card, SectionTitle, CopyButton, CodeBlock } from "./Shared";

interface PageHomeProps {
  displayUrl: string;
  apiKey: string;
  setApiKey: (k: string) => void;
  sillyTavernMode: boolean;
  stLoading: boolean;
  onToggleSTMode: () => void;
  onOpenWizard: () => void;
  onOpenDocs: () => void;
}

export default function PageHome({
  displayUrl, apiKey, setApiKey, sillyTavernMode, stLoading, onToggleSTMode, onOpenWizard, onOpenDocs
}: PageHomeProps) {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. Hero Section */}
      <Card variant="hero" className="text-center py-12 relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text mb-4">
          One endpoint for all your AI models
        </h1>
        <p className="text-text-muted text-[15px] max-w-2xl mx-auto mb-8 leading-relaxed">
          Access OpenAI-compatible and native AI endpoints through a single streamlined gateway.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button onClick={onOpenWizard} className="px-6 py-2.5 bg-accent text-accent-foreground font-semibold rounded-lg text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] border border-accent/50 flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> Bắt đầu cấu hình
          </button>
          <button onClick={onOpenDocs} className="px-6 py-2.5 bg-surface-2 text-text font-semibold rounded-lg text-sm hover:bg-border-strong transition-colors border border-border flex items-center gap-2">
            Xem tài liệu API
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          <span className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider bg-surface-2/50 px-3 py-1.5 rounded-full border border-border">Multi-provider</span>
          <span className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider bg-surface-2/50 px-3 py-1.5 rounded-full border border-border">OpenAI-compatible</span>
          <span className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider bg-surface-2/50 px-3 py-1.5 rounded-full border border-border">Native endpoints</span>
          <span className="text-[11px] font-semibold text-accent/80 uppercase tracking-wider bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">Unified access</span>
        </div>
      </Card>

      {/* 2. Quick Start */}
      <section>
        <SectionTitle>Bắt đầu nhanh</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="standard" className="relative group hover:border-accent/30 transition-colors">
            <div className="absolute top-4 right-4 text-text-subtle/20 font-heading text-4xl font-bold">1</div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
              <PlayCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-text text-sm mb-2">Chạy trợ lý cấu hình</h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Hoàn tất cấu hình ban đầu để thiết lập mật khẩu truy cập và kích hoạt các tích hợp AI.
            </p>
          </Card>
          <Card variant="standard" className="relative group hover:border-accent/30 transition-colors">
            <div className="absolute top-4 right-4 text-text-subtle/20 font-heading text-4xl font-bold">2</div>
            <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-text text-sm mb-2">Phát hành ứng dụng</h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Đưa ứng dụng lên môi trường public để có một URL cố định, luôn hoạt động.
            </p>
          </Card>
          <Card variant="standard" className="relative group hover:border-accent/30 transition-colors">
            <div className="absolute top-4 right-4 text-text-subtle/20 font-heading text-4xl font-bold">3</div>
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning mb-4">
              <Copy className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-text text-sm mb-2">Tích hợp vào ứng dụng</h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Sao chép Base URL và API Key vào ứng dụng hoặc công cụ bạn đang dùng.
            </p>
          </Card>
        </div>
      </section>

      {/* Connection Details */}
      <Card variant="standard" className="border-accent/20 bg-accent/5">
        <SectionTitle>Thông tin kết nối của bạn</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-text-subtle block mb-2 font-semibold uppercase tracking-wider">Base URL (Preview)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-bg border border-border-strong rounded-lg px-4 py-2.5 font-mono text-[13px] text-accent overflow-hidden text-ellipsis whitespace-nowrap shadow-inner">
                {displayUrl}/v1
              </code>
              <CopyButton text={`${displayUrl}/v1`} />
            </div>
            <p className="text-[11px] text-warning/80 mt-2 mb-0 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Sau khi Publish, hãy thay bằng URL production (vd: <code className="font-mono text-warning bg-warning/10 px-1 rounded">https://your-app.replit.app/v1</code>).</span>
            </p>
          </div>
          <div>
            <label className="text-xs text-text-subtle block mb-2 font-semibold uppercase tracking-wider">API Key (Mật khẩu truy cập)</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); localStorage.setItem("proxy_api_key", e.target.value); }}
                placeholder="Nhập API Key bạn đã tạo"
                className="flex-1 bg-bg border border-border-strong rounded-lg px-4 py-2.5 text-text font-mono text-[13px] outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all shadow-inner"
              />
            </div>
            {!apiKey && <p className="text-[11px] text-danger/80 mt-2 mb-0">Cần nhập API Key để xem Thống kê và Mô hình</p>}
          </div>
        </div>
      </Card>

      {/* 3. Why this gateway */}
      <section>
        <SectionTitle>Tính năng cốt lõi</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Globe className="w-5 h-5 text-accent" />, title: "Định tuyến đa backend", desc: "Tự động định tuyến theo tên mô hình đến OpenAI, Anthropic, Gemini hoặc OpenRouter." },
            { icon: <Cable className="w-5 h-5 text-success" />, title: "Tương thích đa định dạng", desc: "Hỗ trợ đồng thời OpenAI, Claude Messages, Gemini Native; tự động chuyển đổi." },
            { icon: <Settings className="w-5 h-5 text-warning" />, title: "Tool Calling", desc: "Hỗ trợ đầy đủ OpenAI tools + tool_calls, tự động chuyển sang định dạng gốc." },
            { icon: <PlayCircle className="w-5 h-5 text-danger" />, title: "Streaming SSE", desc: "Tất cả endpoint đều hỗ trợ SSE streaming, bao gồm endpoint gốc Claude và Gemini." },
          ].map((f, i) => (
            <Card key={i} variant="compact" className="p-5 hover:border-border-strong transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center mb-3 border border-border group-hover:border-border-strong transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-text text-sm mb-1.5 font-heading">{f.title}</h3>
              <p className="text-[12px] text-text-subtle leading-relaxed m-0">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Provider support */}
      <section>
        <SectionTitle>Nhà cung cấp hỗ trợ</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: "openai", name: "OpenAI",
              color: "from-emerald-500/10 to-transparent", border: "border-emerald-500/20",
              badge: "Latest models",
              desc: "Hỗ trợ các mô hình hàng đầu với tool calling, vision, streaming và định dạng tương thích OpenAI.",
            },
            {
              id: "anthropic", name: "Anthropic",
              color: "from-amber-500/10 to-transparent", border: "border-amber-500/20",
              badge: "Reasoning + tools",
              desc: "Hỗ trợ Claude native, extended thinking, tool use và streaming cho các tác vụ hội thoại và agent.",
            },
            {
              id: "gemini", name: "Google Gemini",
              color: "from-blue-500/10 to-transparent", border: "border-blue-500/20",
              badge: "Native support",
              desc: "Hỗ trợ Gemini native, multimodal input, streaming và chuyển đổi linh hoạt giữa các định dạng request.",
            },
            {
              id: "openrouter", name: "OpenRouter",
              color: "from-purple-500/10 to-transparent", border: "border-purple-500/20",
              badge: "Broad model access",
              desc: "Mở rộng truy cập tới nhiều mô hình từ nhiều nhà cung cấp qua một lớp gateway thống nhất.",
            },
          ].map((p) => (
            <div key={p.id} className={cn("rounded-xl border p-5 bg-gradient-to-br relative overflow-hidden", p.color, p.border)}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-bold text-text text-base font-heading">{p.name}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-surface/50 border border-border text-text-muted shrink-0">{p.badge}</span>
              </div>
              <p className="text-[12px] text-text-subtle leading-relaxed m-0">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SillyTavern Mode */}
      <Card variant="standard" className="flex flex-col">
        <SectionTitle>Chế độ SillyTavern</SectionTitle>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="m-0 text-text-subtle text-[13px] leading-relaxed">
                Tự động thêm user message trống vào Claude để sửa lỗi yêu cầu thứ tự vai trò (role order) của một số client nhập vai.
              </p>
            </div>
            <button
              onClick={onToggleSTMode}
              disabled={stLoading || !apiKey}
              className={cn(
                "relative w-11 h-6 rounded-full shrink-0 transition-colors focus:outline-none",
                sillyTavernMode ? "bg-accent" : "bg-surface-2",
                (stLoading || !apiKey) && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                sillyTavernMode ? "left-[26px]" : "left-1"
              )} />
            </button>
          </div>
          <div className={cn(
            "px-3 py-2 rounded-md text-[12px] font-medium transition-colors border inline-flex w-fit",
            sillyTavernMode ? "bg-accent/10 text-accent border-accent/20" : "bg-surface-2 text-text-muted border-transparent"
          )}>
            {sillyTavernMode ? 'Đã bật — Thêm {role:"user", content:"Tiếp tục"}' : "Đã tắt — Gửi nguyên gốc"}
          </div>
        </div>
      </Card>

      {/* 6. Changelog & Promo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="compact">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Changelog</SectionTitle>
            <button onClick={() => setShowChangelog(!showChangelog)} className="text-[11px] text-accent hover:underline font-medium">
              {showChangelog ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
          <div className="text-[12px] transition-all">
            <div className="flex gap-3 mb-2">
              <span className="text-accent font-mono font-bold shrink-0">v1.0.0</span>
              <span className="text-text-muted">Phát hành phiên bản đầu tiên với hỗ trợ 4 nhà cung cấp, streaming, công cụ quản lý node và giới hạn ngân sách.</span>
            </div>
            {showChangelog && (
              <div className="flex gap-3 mb-2 mt-3 pt-3 border-t border-border/50">
                <span className="text-text-muted font-mono shrink-0">v0.9.0</span>
                <span className="text-text-subtle">Beta release: Tích hợp Replit AI, hỗ trợ OpenAI + Anthropic.</span>
              </div>
            )}
          </div>
        </Card>

        <Card variant="compact" className="border-accent/10 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-[2px] z-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-widest text-text-subtle font-bold mb-2">Tài trợ</div>
            <h3 className="font-heading font-bold text-lg text-text mb-1">GPTShopVN</h3>
            <p className="text-[12px] text-text-muted leading-relaxed mb-4 max-w-xs">
              Không để chi phí cao thành rào cản sử dụng AI cho người Việt.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://t.me/OdaybanChatGPT_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-[12px] font-semibold text-text bg-surface-2 border border-border rounded-md hover:border-accent/40 hover:text-accent transition-colors"
              >
                Telegram Bot
              </a>
              <a
                href="https://zalo.me/g/a7lgs7lvpw5wnr38ksnh"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-[12px] font-semibold text-text bg-surface-2 border border-border rounded-md hover:border-accent/40 hover:text-accent transition-colors"
              >
                Zalo Group
              </a>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}