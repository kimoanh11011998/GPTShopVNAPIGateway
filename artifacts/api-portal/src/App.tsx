import { useState, useEffect, useCallback } from "react";
import { Home, BarChart3, Boxes, Cable, ScrollText, Copy, Check, Plus, Trash2, RefreshCw, Power, Settings, Globe, AlertCircle, PlayCircle, LogOut, Download } from "lucide-react";
import SetupWizard from "./components/SetupWizard";
import UpdateBadge from "./components/UpdateBadge";
import PageLogs from "./components/PageLogs";
import PageDocs from "./components/PageDocs";
import { cn } from "./lib/utils";

// ---------------------------------------------------------------------------
// Model registry
// ---------------------------------------------------------------------------

type Provider = "openai" | "anthropic" | "gemini" | "openrouter";

interface ModelEntry {
  id: string;
  label: string;
  provider: Provider;
  desc: string;
  badge?: "thinking" | "thinking-visible" | "tools" | "reasoning";
  context?: string;
}

const OPENAI_MODELS: ModelEntry[] = [
  { id: "gpt-5.2", label: "GPT-5.2", provider: "openai", desc: "Mô hình đa phương tiện hàng đầu mới nhất", context: "128K", badge: "tools" },
  { id: "gpt-5.1", label: "GPT-5.1", provider: "openai", desc: "Mô hình đa phương tiện hàng đầu", context: "128K", badge: "tools" },
  { id: "gpt-5", label: "GPT-5", provider: "openai", desc: "Mô hình đa phương tiện hàng đầu", context: "128K", badge: "tools" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", provider: "openai", desc: "Mô hình nhanh tiết kiệm chi phí", context: "128K", badge: "tools" },
  { id: "gpt-5-nano", label: "GPT-5 Nano", provider: "openai", desc: "Mô hình nhẹ siêu nhỏ", context: "128K", badge: "tools" },
  { id: "gpt-4.1", label: "GPT-4.1", provider: "openai", desc: "Mô hình hàng đầu ổn định đa năng", context: "1M", badge: "tools" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "openai", desc: "Cân bằng tốc độ và chất lượng", context: "1M", badge: "tools" },
  { id: "gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "openai", desc: "Mô hình nhẹ siêu tốc", context: "1M", badge: "tools" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai", desc: "Hàng đầu đa phương tiện (ảnh/văn/âm)", context: "128K", badge: "tools" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai", desc: "Mô hình đa phương tiện nhỏ gọn", context: "128K", badge: "tools" },
  { id: "o4-mini", label: "o4 Mini", provider: "openai", desc: "Mô hình suy luận, nhanh và hiệu quả", context: "200K", badge: "reasoning" },
  { id: "o4-mini-thinking", label: "o4 Mini (thinking)", provider: "openai", desc: "Bí danh thinking của o4 Mini", context: "200K", badge: "thinking" },
  { id: "o3", label: "o3", provider: "openai", desc: "Mô hình suy luận hàng đầu mạnh mẽ", context: "200K", badge: "reasoning" },
  { id: "o3-thinking", label: "o3 (thinking)", provider: "openai", desc: "Bí danh thinking của o3", context: "200K", badge: "thinking" },
  { id: "o3-mini", label: "o3 Mini", provider: "openai", desc: "Mô hình suy luận hiệu quả", context: "200K", badge: "reasoning" },
  { id: "o3-mini-thinking", label: "o3 Mini (thinking)", provider: "openai", desc: "Bí danh thinking của o3 Mini", context: "200K", badge: "thinking" },
];

const ANTHROPIC_MODELS: ModelEntry[] = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", provider: "anthropic", desc: "Mới nhất · Suy luận đỉnh cao và tác vụ agent", context: "200K", badge: "tools" },
  { id: "claude-opus-4-6", label: "Claude Opus 4.6", provider: "anthropic", desc: "Suy luận đỉnh cao và tác vụ agent", context: "200K", badge: "tools" },
  { id: "claude-opus-4-6-thinking", label: "Claude Opus 4.6 (thinking)", provider: "anthropic", desc: "Suy nghĩ mở rộng (ẩn)", context: "200K", badge: "thinking" },
  { id: "claude-opus-4-6-thinking-visible", label: "Claude Opus 4.6 (thinking visible)", provider: "anthropic", desc: "Suy nghĩ mở rộng (hiển thị)", context: "200K", badge: "thinking-visible" },
  { id: "claude-opus-4-5", label: "Claude Opus 4.5", provider: "anthropic", desc: "Mô hình suy luận hàng đầu", context: "200K", badge: "tools" },
  { id: "claude-opus-4-5-thinking", label: "Claude Opus 4.5 (thinking)", provider: "anthropic", desc: "Suy nghĩ mở rộng (ẩn)", context: "200K", badge: "thinking" },
  { id: "claude-opus-4-5-thinking-visible", label: "Claude Opus 4.5 (thinking visible)", provider: "anthropic", desc: "Suy nghĩ mở rộng (hiển thị)", context: "200K", badge: "thinking-visible" },
  { id: "claude-opus-4-1", label: "Claude Opus 4.1", provider: "anthropic", desc: "Mô hình hàng đầu (ổn định)", context: "200K", badge: "tools" },
  { id: "claude-opus-4-1-thinking", label: "Claude Opus 4.1 (thinking)", provider: "anthropic", desc: "Suy nghĩ mở rộng (ẩn)", context: "200K", badge: "thinking" },
  { id: "claude-opus-4-1-thinking-visible", label: "Claude Opus 4.1 (thinking visible)", provider: "anthropic", desc: "Suy nghĩ mở rộng (hiển thị)", context: "200K", badge: "thinking-visible" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "anthropic", desc: "Cân bằng tốt nhất tốc độ và thông minh", context: "200K", badge: "tools" },
  { id: "claude-sonnet-4-6-thinking", label: "Claude Sonnet 4.6 (thinking)", provider: "anthropic", desc: "Suy nghĩ mở rộng (ẩn)", context: "200K", badge: "thinking" },
  { id: "claude-sonnet-4-6-thinking-visible", label: "Claude Sonnet 4.6 (thinking visible)", provider: "anthropic", desc: "Suy nghĩ mở rộng (hiển thị)", context: "200K", badge: "thinking-visible" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", provider: "anthropic", desc: "Hàng đầu cân bằng hiệu năng", context: "200K", badge: "tools" },
  { id: "claude-sonnet-4-5-thinking", label: "Claude Sonnet 4.5 (thinking)", provider: "anthropic", desc: "Suy nghĩ mở rộng (ẩn)", context: "200K", badge: "thinking" },
  { id: "claude-sonnet-4-5-thinking-visible", label: "Claude Sonnet 4.5 (thinking visible)", provider: "anthropic", desc: "Suy nghĩ mở rộng (hiển thị)", context: "200K", badge: "thinking-visible" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "anthropic", desc: "Mô hình nhỏ gọn siêu nhanh", context: "200K", badge: "tools" },
  { id: "claude-haiku-4-5-thinking", label: "Claude Haiku 4.5 (thinking)", provider: "anthropic", desc: "Suy nghĩ mở rộng (ẩn)", context: "200K", badge: "thinking" },
  { id: "claude-haiku-4-5-thinking-visible", label: "Claude Haiku 4.5 (thinking visible)", provider: "anthropic", desc: "Suy nghĩ mở rộng (hiển thị)", context: "200K", badge: "thinking-visible" },
];

const GEMINI_MODELS: ModelEntry[] = [
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", provider: "gemini", desc: "Mô hình đa phương tiện hàng đầu mới nhất", context: "2M", badge: "tools" },
  { id: "gemini-3.1-pro-preview-thinking", label: "Gemini 3.1 Pro Preview (thinking)", provider: "gemini", desc: "Suy nghĩ mở rộng (ẩn)", context: "2M", badge: "thinking" },
  { id: "gemini-3.1-pro-preview-thinking-visible", label: "Gemini 3.1 Pro Preview (thinking visible)", provider: "gemini", desc: "Suy nghĩ mở rộng (hiển thị)", context: "2M", badge: "thinking-visible" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview", provider: "gemini", desc: "Mô hình đa phương tiện siêu tốc", context: "1M", badge: "tools" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "gemini", desc: "Suy luận hàng đầu, mạnh về code", context: "1M", badge: "tools" },
  { id: "gemini-2.5-pro-thinking", label: "Gemini 2.5 Pro (thinking)", provider: "gemini", desc: "Suy nghĩ mở rộng (ẩn)", context: "1M", badge: "thinking" },
  { id: "gemini-2.5-pro-thinking-visible", label: "Gemini 2.5 Pro (thinking visible)", provider: "gemini", desc: "Suy nghĩ mở rộng (hiển thị)", context: "1M", badge: "thinking-visible" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini", desc: "Cân bằng tốc độ và chất lượng", context: "1M", badge: "tools" },
  { id: "gemini-2.5-flash-thinking", label: "Gemini 2.5 Flash (thinking)", provider: "gemini", desc: "Suy nghĩ mở rộng (ẩn)", context: "1M", badge: "thinking" },
  { id: "gemini-2.5-flash-thinking-visible", label: "Gemini 2.5 Flash (thinking visible)", provider: "gemini", desc: "Suy nghĩ mở rộng (hiển thị)", context: "1M", badge: "thinking-visible" },
];

const OPENROUTER_MODELS: ModelEntry[] = [
  { id: "x-ai/grok-4.20", label: "Grok 4.20", provider: "openrouter", desc: "Mô hình suy luận hàng đầu mới nhất của xAI", badge: "tools" },
  { id: "x-ai/grok-4.1-fast", label: "Grok 4.1 Fast", provider: "openrouter", desc: "Mô hình hội thoại tốc độ cao của xAI", badge: "tools" },
  { id: "x-ai/grok-4-fast", label: "Grok 4 Fast", provider: "openrouter", desc: "Mô hình nhanh của xAI", badge: "tools" },
  { id: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick", provider: "openrouter", desc: "Hàng đầu đa phương tiện của Meta" },
  { id: "meta-llama/llama-4-scout", label: "Llama 4 Scout", provider: "openrouter", desc: "Mô hình ngữ cảnh dài của Meta", context: "10M" },
  { id: "deepseek/deepseek-v3.2", label: "DeepSeek V3.2", provider: "openrouter", desc: "Mô hình mạnh về tiếng Việt/code", badge: "tools" },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1", provider: "openrouter", desc: "Mô hình suy luận mạnh mã nguồn mở", badge: "reasoning" },
  { id: "deepseek/deepseek-r1-0528", label: "DeepSeek R1 0528", provider: "openrouter", desc: "Phiên bản mới nhất của R1", badge: "reasoning" },
  { id: "mistralai/mistral-small-2603", label: "Mistral Small 2603", provider: "openrouter", desc: "Mô hình nhỏ gọn hiệu quả", badge: "tools" },
  { id: "qwen/qwen3.5-122b-a10b", label: "Qwen 3.5 122B", provider: "openrouter", desc: "Hàng đầu tham số lớn của Alibaba" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (OR)", provider: "openrouter", desc: "Gemini qua OpenRouter" },
  { id: "anthropic/claude-opus-4.6", label: "Claude Opus 4.6 (OR)", provider: "openrouter", desc: "Claude qua OpenRouter", badge: "tools" },
  { id: "cohere/command-a", label: "Command A", provider: "openrouter", desc: "Mô hình doanh nghiệp của Cohere", badge: "tools" },
  { id: "amazon/nova-premier-v1", label: "Nova Premier V1", provider: "openrouter", desc: "Hàng đầu đa phương tiện của Amazon" },
  { id: "baidu/ernie-4.5-300b-a47b", label: "ERNIE 4.5 300B", provider: "openrouter", desc: "Mô hình MoE tham số lớn của Baidu" },
];

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs rounded-md font-medium transition-all shrink-0 border",
        copied 
          ? "bg-success/10 text-success border-success/30" 
          : "bg-surface-2 text-text-muted hover:text-text hover:bg-border-strong border-transparent"
      )}
      title={copied ? "Đã sao chép" : "Sao chép"}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {label && <span>{copied ? "Đã sao chép!" : label}</span>}
    </button>
  );
}

function CodeBlock({ code, copyText }: { code: string; copyText?: string }) {
  return (
    <div className="relative group mt-2">
      <pre className="bg-[#0a0a0c] border border-border rounded-lg p-3 pr-12 font-mono text-[12.5px] text-text-subtle overflow-x-auto leading-relaxed custom-scrollbar">
        {code}
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={copyText ?? code} />
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-surface border border-border rounded-xl p-6", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold text-text-subtle tracking-[0.1em] uppercase mb-4 mt-0">
      {children}
    </h2>
  );
}

function Badge({ variant }: { variant: string }) {
  const styles: Record<string, string> = {
    thinking: "text-[#c084fc] bg-[#c084fc]/10 border-[#c084fc]/30",
    "thinking-visible": "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/30",
    tools: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30",
    reasoning: "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/30",
  };
  const labels: Record<string, string> = { thinking: "Thinking", "thinking-visible": "Thinking (visible)", tools: "Tool Calling", reasoning: "Reasoning" };
  const s = styles[variant] ?? styles.tools;
  
  return (
    <span className={cn("text-[10px] font-semibold border rounded px-1.5 py-0.5 shrink-0", s)}>
      {labels[variant] ?? variant}
    </span>
  );
}

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span className={cn(
      "border rounded px-2 py-0.5 text-[11px] font-bold font-mono shrink-0",
      method === "GET" ? "bg-success/10 text-success border-success/30" : "bg-accent/10 text-accent border-accent/30"
    )}>
      {method}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page components
// ---------------------------------------------------------------------------

function PageHome({
  displayUrl, apiKey, setApiKey, sillyTavernMode, stLoading, onToggleSTMode,
}: {
  displayUrl: string;
  apiKey: string;
  setApiKey: (k: string) => void;
  sillyTavernMode: boolean;
  stLoading: boolean;
  onToggleSTMode: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Base URL */}
      <Card>
        <SectionTitle>Base URL</SectionTitle>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-bg border border-border-strong rounded-lg px-4 py-3 font-mono text-[14px] text-accent overflow-hidden text-ellipsis whitespace-nowrap">
            {displayUrl}
          </code>
          <CopyButton text={displayUrl} label="Sao chép URL" />
        </div>
        <div className="mt-3 flex gap-2 items-start">
          <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/30 rounded px-1.5 py-0.5 shrink-0 mt-[1px]">DEV</span>
          <p className="m-0 text-xs text-text-subtle leading-relaxed">
            Đây là địa chỉ xem trước phát triển. Sau khi <strong className="text-text-muted">Publish (phát hành)</strong> dự án, hãy dùng tên miền môi trường sản xuất (<code className="text-accent text-[11.5px] bg-accent/10 px-1 rounded">https://your-app.replit.app</code>) làm Base URL chính thức.
          </p>
        </div>
      </Card>

      {/* API Key + SillyTavern */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <SectionTitle>Mật khẩu truy cập (API Key)</SectionTitle>
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-xs text-text-subtle block mb-2">Nhập PROXY_API_KEY của bạn</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); localStorage.setItem("proxy_api_key", e.target.value); }}
                placeholder="Ví dụ: my-secret-123"
                className="flex-1 bg-bg border border-border-strong rounded-lg px-3 py-2 text-text font-mono text-[13px] outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            {!apiKey && <p className="text-xs text-warning mt-2 mb-0">Cần nhập API Key để xem Thống kê và Mô hình</p>}
          </div>
        </Card>

        <Card className="flex flex-col">
          <SectionTitle>Chế độ SillyTavern</SectionTitle>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="m-0 text-text-subtle text-xs leading-relaxed">
                  Tự động thêm user message trống vào Claude để sửa lỗi yêu cầu thứ tự vai trò (role order) của một số client nhập vai.
                </p>
              </div>
              <button
                onClick={onToggleSTMode}
                disabled={stLoading || !apiKey}
                className={cn(
                  "relative w-11 h-6 rounded-full shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg",
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
              "px-3 py-2 rounded-md text-xs font-medium transition-colors border",
              sillyTavernMode ? "bg-accent/10 text-accent border-accent/20" : "bg-surface-2 text-text-muted border-transparent"
            )}>
              {sillyTavernMode ? 'Đã bật — Tự động thêm {role:"user", content:"Tiếp tục"}' : "Đã tắt — Gửi tin nhắn nguyên gốc"}
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Cards */}
      <div>
        <SectionTitle>Tính năng cốt lõi</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Globe className="w-5 h-5 text-accent" />, title: "Định tuyến đa backend", desc: "Tự động định tuyến theo tên mô hình đến OpenAI, Anthropic, Gemini hoặc OpenRouter." },
            { icon: <Cable className="w-5 h-5 text-accent" />, title: "Tương thích đa định dạng", desc: "Hỗ trợ đồng thời OpenAI, Claude Messages, Gemini Native; tự động chuyển đổi." },
            { icon: <Settings className="w-5 h-5 text-accent" />, title: "Tool Calling", desc: "Hỗ trợ đầy đủ OpenAI tools + tool_calls, tự động chuyển sang định dạng gốc." },
            { icon: <PlayCircle className="w-5 h-5 text-accent" />, title: "Streaming SSE", desc: "Tất cả endpoint đều hỗ trợ SSE streaming, bao gồm endpoint gốc Claude và Gemini." },
          ].map((f, i) => (
            <div key={i} className="bg-surface border border-border hover:border-accent/30 rounded-xl p-5 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center mb-3 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-text text-[13px] mb-1.5">{f.title}</h3>
              <p className="text-[12.5px] text-text-subtle leading-relaxed m-0">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageStats
// ---------------------------------------------------------------------------

type BackendStat = { calls: number; errors: number; streamingCalls: number; promptTokens: number; completionTokens: number; totalTokens: number; avgDurationMs: number; avgTtftMs: number | null; health: string; url?: string; dynamic?: boolean; enabled?: boolean };
type ModelStat = { calls: number; promptTokens: number; completionTokens: number };

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-5.2": { input: 2.5, output: 10 },
  "gpt-5.1": { input: 2.5, output: 10 },
  "gpt-5": { input: 2.5, output: 10 },
  "gpt-5-mini": { input: 0.15, output: 0.6 },
  "gpt-5-nano": { input: 0.075, output: 0.3 },
  "gpt-4.1": { input: 2, output: 8 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1-nano": { input: 0.1, output: 0.4 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10, output: 30 },
  "gpt-4": { input: 30, output: 60 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  "o4-mini": { input: 1.1, output: 4.4 },
  "o3": { input: 10, output: 40 },
  "o3-mini": { input: 1.1, output: 4.4 },
  "o1": { input: 15, output: 60 },
  "o1-mini": { input: 3, output: 12 },
  "o1-pro": { input: 150, output: 600 },
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-opus-4-6": { input: 15, output: 75 },
  "claude-opus-4-5": { input: 15, output: 75 },
  "claude-opus-4-1": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-sonnet-4-5": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 0.8, output: 4 },
  "claude-3-7-sonnet": { input: 3, output: 15 },
  "claude-3-5-sonnet": { input: 3, output: 15 },
  "claude-3-5-haiku": { input: 0.8, output: 4 },
  "claude-3-opus": { input: 15, output: 75 },
  "claude-3-sonnet": { input: 3, output: 15 },
  "claude-3-haiku": { input: 0.25, output: 1.25 },
  "gemini-3.1-pro": { input: 1.25, output: 10 },
  "gemini-3-flash": { input: 0.15, output: 0.6 },
  "gemini-2.5-pro": { input: 1.25, output: 10 },
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-2.0-flash-lite": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, output: 5 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-flash-8b": { input: 0.0375, output: 0.15 },
  "grok-4": { input: 3, output: 15 },
  "grok-4.1": { input: 3, output: 15 },
  "grok-4.20": { input: 3, output: 15 },
  "llama-4": { input: 0.2, output: 0.8 },
  "deepseek-v3": { input: 0.27, output: 1.1 },
  "deepseek-r1": { input: 0.55, output: 2.19 },
  "mistral-small": { input: 0.1, output: 0.3 },
  "qwen3": { input: 0.3, output: 1.2 },
  "command-a": { input: 2.5, output: 10 },
  "nova-premier": { input: 2.5, output: 10 },
  "ernie-4.5": { input: 1, output: 4 },
};

const DEFAULT_PRICING = { input: 3, output: 15 };

function getModelPrice(model: string): { input: number; output: number } {
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  const stripped = model.replace(/^[a-z0-9_-]+\//, "");
  if (MODEL_PRICING[stripped]) return MODEL_PRICING[stripped];
  const base = stripped.replace(/-(thinking-visible|thinking|latest|preview)$/g, "").replace(/-\d{4}-\d{2}-\d{2}$/, "");
  if (MODEL_PRICING[base]) return MODEL_PRICING[base];
  for (const [key, val] of Object.entries(MODEL_PRICING)) {
    if (stripped.startsWith(key) || base.startsWith(key)) return val;
  }
  return DEFAULT_PRICING;
}

function estimateModelCost(model: string, prompt: number, completion: number): number {
  const p = getModelPrice(model);
  return (prompt * p.input + completion * p.output) / 1_000_000;
}

function PageStats({
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

  const totalModelInputCost = modelStats
    ? Object.entries(modelStats).reduce((sum, [model, ms]) => sum + (ms.promptTokens * getModelPrice(model).input) / 1_000_000, 0)
    : null;

  const totalModelOutputCost = modelStats
    ? Object.entries(modelStats).reduce((sum, [model, ms]) => sum + (ms.completionTokens * getModelPrice(model).output) / 1_000_000, 0)
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
        const barColor = !cap ? "bg-border" : pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
        const textColor = !cap ? "text-text-muted" : pct >= 90 ? "text-red-400" : pct >= 70 ? "text-amber-400" : "text-emerald-400";
        return (
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div>
                <div className="text-[10px] font-bold text-text-subtle tracking-[0.1em] uppercase mb-1">Hạn mức ngân sách</div>
                <div className="text-sm text-text-muted">
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
                    className="px-3 py-1.5 text-xs font-semibold bg-accent text-bg rounded-md disabled:opacity-50"
                  >Lưu</button>
                  <button
                    onClick={() => setBudgetEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md"
                  >Hủy</button>
                </div>
              )}
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden border border-border">
              <div className={`h-full ${barColor} transition-all`} style={{ width: `${ratio * 100}%` }} />
            </div>
            {cap !== null && cap > 0 && pct >= 70 && (
              <div className={`mt-2 text-xs ${textColor}`}>
                {pct >= 100
                  ? `Đã vượt hạn mức ${(used - cap).toFixed(4)} USD`
                  : pct >= 90
                  ? `Cảnh báo: sắp chạm hạn mức, còn $${(cap - used).toFixed(4)}`
                  : `Đã dùng hơn 70% hạn mức, còn $${(cap - used).toFixed(4)}`}
              </div>
            )}
          </div>
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
          <div key={i} className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-text-subtle tracking-[0.1em] uppercase mb-2">{kpi.label}</div>
            <div className="text-xl md:text-2xl font-mono font-semibold text-text">{kpi.value}</div>
          </div>
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
          <Card>
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
                  <tr className="border-b border-border bg-surface text-[11px] text-text-subtle uppercase tracking-wider">
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
              <div className="bg-[#0a0a0c] border border-border-strong rounded-lg p-3 flex items-start gap-3 group">
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
                  {envPromptCopied ? "✓ Đã sao chép" : "📋 Sao chép"}
                </button>
              </div>
            </div>
          </Card>
          
          {/* FleetManager is a sub-component tracking instances, keep it clean */}
          <FleetManager />
        </div>

        <div className="flex flex-col gap-6">
          {/* Routing Settings */}
          <Card>
            <SectionTitle>Routing</SectionTitle>
            <div className="flex flex-col gap-3">
              {[
                { field: "localEnabled" as const, label: "Bật backend cục bộ", desc: "Khi tắt, backend cục bộ hoàn toàn dừng, mọi request chỉ đi qua node con" },
                { field: "localFallback" as const, label: "Fallback về backend cục bộ", desc: "Khi tắt, kể cả khi tất cả node con ngoại tuyến cũng không gọi backend cục bộ" },
                { field: "fakeStream" as const, label: "Fake Streaming", desc: "Mô phỏng SSE streaming nếu backend không hỗ trợ" },
              ].map(({ field, label, desc }) => (
                <div key={field} className="flex items-center justify-between bg-bg border border-border rounded-lg p-3">
                  <div className="pr-4">
                    <div className="text-[13px] font-semibold text-text">{label}</div>
                    <div className="text-[11px] text-text-subtle mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                  <button
                    onClick={() => onToggleRouting(field, !routing[field])}
                    className={cn(
                      "relative w-10 h-5.5 rounded-full shrink-0 transition-colors",
                      routing[field] ? "bg-accent" : "bg-surface-2"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      routing[field] ? "left-[21px]" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Model Stats */}
          {modelStats && Object.keys(modelStats).length > 0 && (
            <Card>
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
                        <div className="w-full h-1 bg-bg rounded-full overflow-hidden">
                          <div className="h-full bg-accent/60" style={{ width: `${Math.max(1, pct)}%` }} />
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

// ---------------------------------------------------------------------------
// PageModels
// ---------------------------------------------------------------------------

type ModelStatus = { id: string; provider: string; enabled: boolean };
type GroupSummary = { total: number; enabled: number };

function PageModels({
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
          <Card key={g.provider} className="p-0 overflow-hidden border border-border">
            <div className="bg-surface-2/50 px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-text text-sm">{g.title}</div>
                <div className="text-[11px] font-mono text-text-subtle bg-bg px-2 py-0.5 rounded border border-border-strong">
                  {sum.enabled}/{sum.total}
                </div>
              </div>
              <button
                onClick={() => onToggleProvider(g.provider, !isAllEnabled)}
                className="text-[11px] font-medium text-text-muted hover:text-text px-3 py-1 bg-bg border border-border rounded-md transition-colors"
              >
                {isAllEnabled ? "Tắt tất cả" : "Bật tất cả"}
              </button>
            </div>
            
            <div className="flex flex-col">
              {g.models.map((m) => {
                const status = modelStatus.find(ms => ms.id === m.id);
                const enabled = status ? status.enabled : true;
                return (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3 border-b border-border/50 last:border-0 hover:bg-surface-2/30 transition-colors">
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
                          "relative w-9 h-5 rounded-full shrink-0 transition-colors",
                          enabled ? "bg-accent" : "bg-surface-2"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                          enabled ? "left-[18px]" : "left-1"
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

// ---------------------------------------------------------------------------
// PageEndpoints
// ---------------------------------------------------------------------------

function PageEndpoints({ baseUrl }: { baseUrl: string }) {
  const endpoints = [
    { method: "POST" as const, path: "/v1/chat/completions", desc: "Chat Completions API (OpenAI format, tự động định tuyến)", code: `curl -X POST ${baseUrl}/v1/chat/completions \\\n  -H "Authorization: Bearer <your-proxy-key>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"claude-sonnet-4-6","messages":[{"role":"user","content":"Hello"}],"stream":true}'` },
    { method: "POST" as const, path: "/v1/messages", desc: "Anthropic Messages API", code: `curl -X POST ${baseUrl}/v1/messages \\\n  -H "x-api-key: <your-proxy-key>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"claude-sonnet-4-6","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'` },
    { method: "GET" as const, path: "/v1/models", desc: "Danh sách mô hình khả dụng", code: `curl -X GET ${baseUrl}/v1/models \\\n  -H "Authorization: Bearer <your-proxy-key>"` }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {endpoints.map((ep, i) => (
        <Card key={i} className="p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <MethodBadge method={ep.method} />
            <code className="font-mono text-[13px] text-text">{baseUrl}{ep.path}</code>
            <CopyButton text={`${baseUrl}${ep.path}`} label="" />
          </div>
          <p className="text-[12.5px] text-text-subtle m-0">{ep.desc}</p>
          <CodeBlock code={ep.code} />
        </Card>
      ))}
      <Card className="p-5">
        <SectionTitle>Tài liệu chi tiết</SectionTitle>
        <PageDocs />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fleet Manager
// ---------------------------------------------------------------------------

const _UPSTREAM_VER_URL = "https://raw.githubusercontent.com/kimoanh11011998/ReplitAPI-GPT-ShopVn-/main/version.json";

interface FleetInstance {
  id: string;
  name: string;
  url: string;
  key: string;
  status: "unknown" | "checking" | "ok" | "updating" | "error" | "restarting";
  version: string | null;
  latestVersion: string | null;
  updateAvailable: boolean;
  lastChecked: number | null;
  updateLog: string | null;
}

const FLEET_STORE_KEY = "fleet_instances_v2";

function loadFleet(): FleetInstance[] {
  try { return JSON.parse(localStorage.getItem(FLEET_STORE_KEY) ?? "[]") as FleetInstance[]; }
  catch { return []; }
}
function saveFleet(data: FleetInstance[]) {
  localStorage.setItem(FLEET_STORE_KEY, JSON.stringify(data));
}
function genId() { return Math.random().toString(36).slice(2, 9); }

function normalizeBackendUrl(raw: string): string {
  const url = raw.trim().replace(/\/+$/, "");
  if (!url) return url;
  return /\/api$/i.test(url) ? url : url + "/api";
}

function FleetManager() {
  const [instances, setInstances] = useState<FleetInstance[]>(() => loadFleet());
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addKey, setAddKey] = useState("");

  const persist = (next: FleetInstance[]) => { setInstances(next); saveFleet(next); };

  const addInst = () => {
    const url = addUrl.trim().replace(/\/+$/, "");
    const key = addKey.trim();
    if (!url || !key) return;
    const inst: FleetInstance = {
      id: genId(), name: addName.trim() || url, url, key,
      status: "unknown", version: null, latestVersion: null,
      updateAvailable: false, lastChecked: null, updateLog: null,
    };
    const next = [...instances, inst];
    persist(next);
    setAddName(""); setAddUrl(""); setAddKey("");
  };

  const removeInst = (id: string) => persist(instances.filter((i) => i.id !== id));
  const patchInst = (id: string, patch: Partial<FleetInstance>) => {
    const next = instances.map((i) => i.id === id ? { ...i, ...patch } : i);
    persist(next); return next;
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
    <Card>
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
              <div className="mt-1 p-2 rounded bg-[#0a0a0c] border border-border-strong text-[11px] font-mono text-text-muted break-all">
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

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

type Tab = "home" | "stats" | "models" | "endpoints" | "logs";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [online, setOnline] = useState<boolean | null>(null);
  const [sillyTavernMode, setSillyTavernMode] = useState(false);
  const [stLoading, setStLoading] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("proxy_api_key") ?? "");
  const [showWizard, setShowWizard] = useState(false);
  const [stats, setStats] = useState<Record<string, BackendStat> | null>(null);
  const [modelStats, setModelStats] = useState<Record<string, ModelStat> | null>(null);
  const [statsError, setStatsError] = useState<false | "auth" | "server">(false);
  const [routing, setRouting] = useState<{ localEnabled: boolean; localFallback: boolean; fakeStream: boolean }>({ localEnabled: true, localFallback: true, fakeStream: true });
  const [addUrl, setAddUrl] = useState("");
  const [addState, setAddState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [addMsg, setAddMsg] = useState("");
  const [modelStatus, setModelStatus] = useState<ModelStatus[]>([]);
  const [modelSummary, setModelSummary] = useState<Record<string, GroupSummary>>({});

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
      const parsed: Record<string, BackendStat> = {};
      for (const [k, v] of Object.entries(d.stats as Record<string, Record<string, unknown>>)) {
        parsed[k] = { ...(v as unknown as BackendStat), streamingCalls: (v.streamingCalls as number) ?? 0 };
      }
      setStats(parsed); setStatsError(false);
      setModelStats(d.modelStats && typeof d.modelStats === "object" ? d.modelStats as Record<string, ModelStat> : null);
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
    const url = normalizeBackendUrl(addUrl);
    if (!url) return;
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
    setModelSummary((prev) => {
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
    setModelSummary((prev) => {
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
      .then((status: { configured: boolean } | null) => {
        if (!status || status.configured) return;
        setShowWizard(true);
      })
      .catch(() => {});
  }, [baseUrl]);

  const TABS = [
    { id: "home" as Tab, label: "Tổng quan", icon: <Home className="w-4 h-4" /> },
    { id: "stats" as Tab, label: "Thống kê", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "models" as Tab, label: "Mô hình", icon: <Boxes className="w-4 h-4" /> },
    { id: "endpoints" as Tab, label: "Endpoints", icon: <Cable className="w-4 h-4" /> },
    { id: "logs" as Tab, label: "Nhật ký", icon: <ScrollText className="w-4 h-4" /> },
  ];

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

      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 w-[240px] bg-surface border-r border-border flex flex-col z-10">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-inner">
              <Power className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[14px] text-text tracking-tight">GPT ShopVN</div>
              <div className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold">Free API Gateway</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group overflow-hidden",
                  active ? "text-accent bg-accent/10" : "text-text-subtle hover:text-text hover:bg-surface-2"
                )}
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />}
                <span className={cn("transition-colors", active ? "text-accent" : "text-text-muted group-hover:text-text")}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", online === null ? "bg-text-subtle" : online ? "bg-success" : "bg-danger")} />
              <span className="text-[11px] font-semibold text-text-subtle">
                {online === null ? "Đang kết nối..." : online ? "Trực tuyến" : "Ngoại tuyến"}
              </span>
            </div>
          </div>
          <UpdateBadge baseUrl={baseUrl} apiKey={apiKey} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[240px] max-w-[1200px] w-full px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text mb-1">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="text-sm text-text-subtle m-0">Quản lý và giám sát API Gateway của bạn.</p>
          </div>
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-border-strong text-text font-medium text-xs rounded-lg transition-colors border border-border"
          >
            <Settings className="w-3.5 h-3.5" /> Trợ lý cấu hình
          </button>
        </div>

        {tab === "home" && <PageHome displayUrl={displayUrl} apiKey={apiKey} setApiKey={setApiKey} sillyTavernMode={sillyTavernMode} stLoading={stLoading} onToggleSTMode={toggleSTMode} />}
        {tab === "stats" && <PageStats baseUrl={baseUrl} apiKey={apiKey} stats={stats} statsError={statsError} onRefresh={() => fetchStats(apiKey)} addUrl={addUrl} setAddUrl={setAddUrl} addState={addState} addMsg={addMsg} onAddBackend={addBackend} onRemoveBackend={removeBackend} onToggleBackend={toggleBackend} onBatchToggle={batchToggleBackends} onBatchRemove={batchRemoveBackends} routing={routing} onToggleRouting={toggleRouting} modelStats={modelStats} />}
        {tab === "models" && <PageModels baseUrl={baseUrl} apiKey={apiKey} modelStatus={modelStatus} summary={modelSummary} onRefresh={() => fetchModels(apiKey)} onToggleProvider={toggleModelProvider} onToggleModel={toggleModelById} />}
        {tab === "endpoints" && <PageEndpoints baseUrl={baseUrl} />}
        {tab === "logs" && <PageLogs baseUrl={baseUrl} apiKey={apiKey} />}

        <div className="mt-16 text-center text-[11px] text-text-subtle pb-8 font-mono">
          Powered by Replit AI Integrations · Version 1.0
        </div>
      </main>
    </div>
  );
}