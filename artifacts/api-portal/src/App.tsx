import { useState, useEffect, useCallback } from "react";
import SetupWizard from "./components/SetupWizard";
import UpdateBadge from "./components/UpdateBadge";
import PageLogs from "./components/PageLogs";
import PageDocs from "./components/PageDocs";

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
// Styles
// ---------------------------------------------------------------------------

const PROVIDER_COLORS: Record<Provider, { bg: string; border: string; dot: string; text: string; label: string }> = {
  openai: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", dot: "#60a5fa", text: "#93c5fd", label: "OpenAI" },
  anthropic: { bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.25)", dot: "#fb923c", text: "#fdba74", label: "Anthropic" },
  gemini: { bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", dot: "#34d399", text: "#6ee7b7", label: "Google Gemini" },
  openrouter: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", dot: "#a78bfa", text: "#c4b5fd", label: "OpenRouter" },
};

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
    <button onClick={handleCopy} style={{
      background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)",
      border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.12)"}`,
      color: copied ? "#4ade80" : "#94a3b8", borderRadius: "6px",
      padding: "4px 10px", fontSize: "12px", cursor: "pointer",
      transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {copied ? "Đã sao chép!" : (label ?? "Sao chép")}
    </button>
  );
}

function CodeBlock({ code, copyText }: { code: string; copyText?: string }) {
  return (
    <div style={{ position: "relative", marginTop: "8px" }}>
      <pre style={{
        background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px", padding: "12px 16px", fontFamily: "Menlo, monospace",
        fontSize: "12.5px", color: "#e2e8f0", overflowX: "auto", margin: 0, paddingRight: "72px",
        lineHeight: "1.6",
      }}>{code}</pre>
      <div style={{ position: "absolute", top: "8px", right: "8px" }}>
        <CopyButton text={copyText ?? code} />
      </div>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "12px", padding: "24px", ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.1em",
      textTransform: "uppercase", marginBottom: "16px", marginTop: 0,
    }}>{children}</h2>
  );
}

function Badge({ variant }: { variant: string }) {
  const styles: Record<string, { color: string; bg: string; border: string }> = {
    thinking: { color: "#c084fc", bg: "rgba(192,132,252,0.15)", border: "rgba(192,132,252,0.35)" },
    "thinking-visible": { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
    tools: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" },
    reasoning: { color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)" },
  };
  const labels: Record<string, string> = { thinking: "Thinking", "thinking-visible": "Thinking (visible)", tools: "Tool Calling", reasoning: "Reasoning" };
  const s = styles[variant] ?? styles.tools;
  return (
    <span style={{
      fontSize: "10px", fontWeight: 600, color: s.color,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "4px", padding: "1px 5px", flexShrink: 0,
    }}>{labels[variant] ?? variant}</span>
  );
}

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span style={{
      background: method === "GET" ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.2)",
      color: method === "GET" ? "#4ade80" : "#818cf8",
      border: `1px solid ${method === "GET" ? "rgba(34,197,94,0.3)" : "rgba(99,102,241,0.3)"}`,
      borderRadius: "5px", padding: "2px 8px", fontSize: "11px", fontWeight: 700,
      fontFamily: "Menlo, monospace", flexShrink: 0,
    }}>{method}</span>
  );
}

function ModelGroup({ title, models, provider, expanded, onToggle }: {
  title: string; models: ModelEntry[]; provider: Provider;
  expanded: boolean; onToggle: () => void;
}) {
  const c = PROVIDER_COLORS[provider];
  const base = models.filter((m) => !m.badge || (m.badge !== "thinking" && m.badge !== "thinking-visible"));
  const thinking = models.filter((m) => m.badge === "thinking" || m.badge === "thinking-visible");
  return (
    <div style={{ marginBottom: "10px" }}>
      <button onClick={onToggle} style={{
        display: "flex", alignItems: "center", gap: "10px", width: "100%",
        background: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px",
        padding: "10px 14px", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: c.text, fontSize: "13px", flex: 1 }}>{title}</span>
        <span style={{ fontSize: "12px", color: "#475569" }}>{base.length} model · {thinking.length > 0 ? `${thinking.length} thinking` : "–"}</span>
        <span style={{ fontSize: "11px", color: "#475569", marginLeft: "4px" }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ marginTop: "5px", display: "flex", flexDirection: "column", gap: "3px" }}>
          {models.map((m) => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "7px", padding: "7px 12px",
            }}>
              <code style={{ fontFamily: "Menlo, monospace", fontSize: "12px", color: c.text, flex: 1, wordBreak: "break-all" }}>{m.id}</code>
              <span style={{ fontSize: "12px", color: "#475569", flexShrink: 0, minWidth: "100px", textAlign: "right" }}>{m.desc}</span>
              {m.context && (
                <span style={{ fontSize: "10px", color: "#334155", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "3px", padding: "1px 5px", flexShrink: 0 }}>{m.context}</span>
              )}
              {m.badge && <Badge variant={m.badge} />}
              <CopyButton text={m.id} />
            </div>
          ))}
        </div>
      )}
    </div>
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
    <>
      {/* Quick Start Guide */}
      <Card style={{ marginBottom: "20px", borderColor: "rgba(16,185,129,0.3)", background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(99,102,241,0.04) 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <span style={{ fontSize: "18px" }}>🚀</span>
          <SectionTitle>Hướng dẫn bắt đầu nhanh</SectionTitle>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#334155", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "99px", padding: "2px 10px" }}>Dành cho người mới</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Step 1 */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#818cf8",
            }}>1</div>
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "13.5px", marginBottom: "4px" }}>
                Chạy Trợ lý cấu hình
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.6" }}>
                Nhấn nút <span style={{ color: "#a5b4fc", fontWeight: 600 }}>🚀 Trợ lý cấu hình</span> ở góc trên bên phải.
                Đặt mật khẩu truy cập, sao chép lệnh được tạo ra rồi dán vào Replit Agent — Agent sẽ tự động cấu hình toàn bộ (AI Integrations + Secrets + khởi động lại).
              </div>
            </div>
          </div>

          <div style={{ marginLeft: "22px", borderLeft: "1px dashed rgba(255,255,255,0.06)", paddingLeft: "22px" }} />

          {/* Step 2 */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#818cf8",
            }}>2</div>
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "13.5px", marginBottom: "4px" }}>
                Publish dự án để lấy địa chỉ chính thức
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.6" }}>
                Vào <strong style={{ color: "#94a3b8" }}>Deploy → Publish</strong> trên Replit để phát hành dự án.
                Bạn sẽ nhận được một địa chỉ dạng <code style={{ color: "#a78bfa", fontSize: "11.5px" }}>https://your-app.replit.app</code> — đây là <strong style={{ color: "#94a3b8" }}>Base URL</strong> dùng cho tất cả client.
              </div>
            </div>
          </div>

          <div style={{ marginLeft: "22px", borderLeft: "1px dashed rgba(255,255,255,0.06)", paddingLeft: "22px" }} />

          {/* Step 3 */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#818cf8",
            }}>3</div>
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "13.5px", marginBottom: "4px" }}>
                Kết nối client AI của bạn
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.6" }}>
                Điền vào client (CherryStudio, SillyTavern, OpenWebUI…):
              </div>
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {[
                  { label: "Base URL", value: "https://your-app.replit.app", color: "#a78bfa" },
                  { label: "API Key", value: "Mật khẩu bạn đặt ở bước 1", color: "#4ade80" },
                  { label: "Loại kết nối", value: "OpenAI Compatible", color: "#fbbf24" },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "6px", padding: "5px 10px",
                  }}>
                    <span style={{ fontSize: "11px", color: "#475569", width: "90px", flexShrink: 0 }}>{row.label}</span>
                    <code style={{ fontSize: "11.5px", color: row.color, fontFamily: "Menlo, monospace" }}>{row.value}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginLeft: "22px", borderLeft: "1px dashed rgba(255,255,255,0.06)", paddingLeft: "22px" }} />

          {/* Step 4 */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", color: "#4ade80",
            }}>✓</div>
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <div style={{ fontWeight: 600, color: "#4ade80", fontSize: "13.5px", marginBottom: "4px" }}>
                Sẵn sàng sử dụng!
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.6" }}>
                Nhập API Key vào ô bên dưới để mở khóa trang <strong style={{ color: "#94a3b8" }}>Thống kê</strong> và <strong style={{ color: "#94a3b8" }}>Mô hình</strong>.
                Xem tab <strong style={{ color: "#94a3b8" }}>Tài liệu</strong> để biết thêm chi tiết về tất cả endpoint.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Shop Promo Card */}
      <Card style={{ marginBottom: "20px", borderColor: "rgba(251,191,36,0.35)", background: "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(245,158,11,0.04) 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <span style={{ fontSize: "20px" }}>🛒</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#fbbf24", letterSpacing: "-0.01em" }}>GPT ShopVn — Bot nâng cấp ChatGPT Plus / Pro</div>
            <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>Tài khoản chính chủ · Kích hoạt ngay · Hỗ trợ 24/7</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#92400e", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "99px", padding: "2px 10px", whiteSpace: "nowrap" }}>Ưu đãi hôm nay</span>
        </div>
        <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.7", marginBottom: "14px" }}>
          Hỗ trợ kích hoạt, gia hạn tài khoản ChatGPT Plus/Pro hàng tháng/năm trên mail chính chủ của bạn với chi phí siêu rẻ - bảo mật - nhanh gọn!
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href="https://t.me/OdaybanChatGPT_bot"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "linear-gradient(135deg, #0088cc, #006aaa)",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,136,204,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 14.03l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.936.556z"/></svg>
            Mua qua Telegram Bot
          </a>
          <a
            href="https://zalo.me/g/bhqxcer66atne2anqd5b"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "linear-gradient(135deg, #0068ff, #0052cc)",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,104,255,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.75 17.25h-1.5v-6.75h1.5v6.75zm-.75-8.25a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25z"/></svg>
            Nhóm Zalo hỗ trợ
          </a>
        </div>
      </Card>

      {/* Changelog */}
      <Card style={{ marginBottom: "20px", borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <span style={{ fontSize: "15px" }}>📋</span>
          <SectionTitle>Nhật ký cập nhật · Changelog</SectionTitle>
        </div>
        {(() => {
          const releases = [
            {
              version: "v.1",
              date: "2026-04-17",
              items: [
                { zh: "", en: "Bản đầu tiên của GPT ShopVN - Free API Gateway · phát hành công khai." },
                { zh: "", en: "Hỗ trợ 4 phương thức xác thực: Authorization Bearer, x-api-key, x-goog-api-key, ?key= query." },
                { zh: "", en: "Endpoint OpenAI-compatible /v1/chat/completions tự động định tuyến đến OpenAI, Anthropic, Gemini hoặc OpenRouter." },
                { zh: "", en: "Endpoint Anthropic native /v1/messages (non-stream + stream) và Gemini native /v1/models/:model:generateContent + :streamGenerateContent (kèm alias /v1beta)." },
                { zh: "", en: "Danh sách Claude đã verify thực tế: 19 model có callback (7 base Opus/Sonnet/Haiku + 12 thinking variants)." },
                { zh: "", en: "Sử dụng Replit AI Integrations — không cần cung cấp API key OpenAI/Anthropic/Gemini/OpenRouter của riêng bạn." },
              ],
            },
          ];

          const renderRelease = (release: typeof releases[0]) => (
            <div key={release.version} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontFamily: "Menlo, monospace", fontSize: "13px", fontWeight: 700, color: "#a5b4fc" }}>{release.version}</span>
                <span style={{ fontSize: "11px", color: "#334155" }}>{release.date}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", paddingLeft: "4px" }}>
                {release.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: "#4f46e5", marginTop: "2px", flexShrink: 0, fontSize: "11px" }}>▸</span>
                    <div style={{ fontSize: "12.5px", color: "#94a3b8", lineHeight: "1.5" }}>{item.en}</div>
                  </div>
                ))}
              </div>
            </div>
          );

          return (
            <div style={{ maxHeight: "260px", overflowY: "auto", paddingRight: "4px" }}>
              {releases.map(renderRelease)}
            </div>
          );
        })()}
      </Card>

      {/* Feature Cards */}
      <div style={{ marginBottom: "20px" }}>
        <SectionTitle>Tính năng cốt lõi</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))", gap: "10px" }}>
          {[
            { icon: "🔀", title: "Định tuyến đa backend", desc: "Tự động định tuyến theo tên mô hình đến OpenAI, Anthropic, Gemini hoặc OpenRouter.", color: "#6366f1" },
            { icon: "📐", title: "Tương thích đa định dạng", desc: "Hỗ trợ đồng thời OpenAI, Claude Messages, Gemini Native; tự động chuyển đổi.", color: "#3b82f6" },
            { icon: "🔧", title: "Tool Calling", desc: "Hỗ trợ đầy đủ OpenAI tools + tool_calls, tự động chuyển sang định dạng gốc từng backend.", color: "#f59e0b" },
            { icon: "🧠", title: "Extended Thinking", desc: "Claude, Gemini, o-series đều hỗ trợ hậu tố -thinking và -thinking-visible.", color: "#a855f7" },
            { icon: "🔑", title: "Đa phương thức xác thực", desc: "Hỗ trợ Bearer Token, header x-goog-api-key, tham số URL ?key=.", color: "#10b981" },
            { icon: "⚡", title: "Streaming SSE", desc: "Tất cả endpoint đều hỗ trợ SSE streaming, bao gồm endpoint gốc Claude và Gemini.", color: "#f43f5e" },
          ].map((f) => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px", padding: "16px", borderTopColor: `${f.color}30`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "18px", width: "32px", height: "32px", background: `${f.color}15`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon}</span>
                <span style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "13px" }}>{f.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#475569", lineHeight: "1.6" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Base URL */}
      <Card style={{ marginBottom: "14px" }}>
        <SectionTitle>Base URL</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <code style={{
            flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "10px 16px", fontFamily: "Menlo, monospace",
            fontSize: "14px", color: "#a78bfa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{displayUrl}</code>
          <CopyButton text={displayUrl} label="Sao chép URL" />
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#fbbf24",
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: "4px", padding: "1px 6px", flexShrink: 0, marginTop: "1px",
          }}>DEV</span>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#475569", lineHeight: "1.6" }}>
            Đây là địa chỉ xem trước phát triển. Sau khi <strong style={{ color: "#94a3b8" }}>Publish (phát hành)</strong> dự án, hãy dùng tên miền môi trường sản xuất (<code style={{ color: "#a78bfa", fontSize: "11.5px" }}>https://your-app.replit.app</code>) làm Base URL chính thức.
          </p>
        </div>
      </Card>

      {/* API Key + SillyTavern */}
      <Card>
        <SectionTitle>Mật khẩu truy cập & Cài đặt</SectionTitle>
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>API Key (PROXY_API_KEY)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); localStorage.setItem("proxy_api_key", e.target.value); }}
            placeholder="Nhập PROXY_API_KEY của bạn"
            style={{
              width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", padding: "8px 12px", color: "#e2e8f0",
              fontFamily: "Menlo, monospace", fontSize: "13px", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "13.5px", marginBottom: "3px" }}>Chế độ tương thích SillyTavern</div>
            <p style={{ margin: 0, color: "#475569", fontSize: "12.5px", lineHeight: "1.5" }}>
              Khi bật, tự động thêm user message trống vào Claude để sửa yêu cầu thứ tự vai trò.
            </p>
          </div>
          <button
            onClick={onToggleSTMode}
            disabled={stLoading || !apiKey}
            style={{
              width: "52px", height: "28px", borderRadius: "14px", border: "none",
              background: sillyTavernMode ? "#6366f1" : "rgba(255,255,255,0.12)",
              cursor: (stLoading || !apiKey) ? "not-allowed" : "pointer",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
              opacity: (stLoading || !apiKey) ? 0.5 : 1,
            }}
          >
            <div style={{
              width: "22px", height: "22px", borderRadius: "50%", background: "#fff",
              position: "absolute", top: "3px", left: sillyTavernMode ? "27px" : "3px",
              transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }} />
          </button>
        </div>
        <div style={{
          marginTop: "10px", padding: "7px 12px",
          background: sillyTavernMode ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${sillyTavernMode ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "8px", fontSize: "12px",
          color: sillyTavernMode ? "#818cf8" : "#475569", fontWeight: 500, transition: "all 0.2s",
        }}>
          {sillyTavernMode ? 'Đã bật — Tự động thêm {role:"user", content:"Tiếp tục"} cho mô hình Claude' : "Đã tắt — Gửi tin nhắn nguyên gốc"}
        </div>
      </Card>
    </>
  );
}

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
  baseUrl: string;
  apiKey: string;
  stats: Record<string, BackendStat> | null;
  statsError: false | "auth" | "server";
  onRefresh: () => void;
  addUrl: string;
  setAddUrl: (u: string) => void;
  addState: "idle" | "loading" | "ok" | "err";
  addMsg: string;
  onAddBackend: (e: React.FormEvent) => void;
  onRemoveBackend: (label: string) => void;
  onToggleBackend: (label: string, enabled: boolean) => void;
  onBatchToggle: (labels: string[], enabled: boolean) => void;
  onBatchRemove: (labels: string[]) => void;
  routing: { localEnabled: boolean; localFallback: boolean; fakeStream: boolean };
  onToggleRouting: (field: "localEnabled" | "localFallback" | "fakeStream", value: boolean) => void;
  modelStats: Record<string, ModelStat> | null;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [envPromptCopied, setEnvPromptCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  const allSubNodes = stats
    ? Object.entries(stats).filter(([l]) => l !== "local")
    : [];
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
    totalDuration: acc.totalDuration + (s.avgDurationMs * s.calls),
    totalTtft: acc.totalTtft + ((s.avgTtftMs ?? 0) * (s.streamingCalls ?? 0)),
    totalStreamCalls: acc.totalStreamCalls + (s.streamingCalls ?? 0),
  }), { calls: 0, errors: 0, streamingCalls: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, totalDuration: 0, totalTtft: 0, totalStreamCalls: 0 }) : null;

  const statCardStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "18px 20px",
  };

  const statLabelStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "14px",
  };

  const bigNumStyle: React.CSSProperties = {
    fontSize: "26px", fontWeight: 700, fontFamily: "'JetBrains Mono', Menlo, monospace",
    letterSpacing: "-0.02em",
  };

  const subNumStyle: React.CSSProperties = {
    fontSize: "12px", color: "#475569", marginTop: "2px",
  };

  return (
    <>
      {/* Stats Panel Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "4px", height: "20px", background: "linear-gradient(180deg, #6366f1, #8b5cf6)", borderRadius: "2px" }} />
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#f1f5f9" }}>Bảng thống kê</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onRefresh} style={{
            padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
          }}>&#8635; Làm mới</button>
          <button onClick={resetStats} disabled={resetting || !apiKey} style={{
            padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", cursor: (!apiKey || resetting) ? "not-allowed" : "pointer",
            opacity: (!apiKey || resetting) ? 0.5 : 1,
          }}>Đặt lại</button>
        </div>
      </div>

      {!apiKey ? (
        <Card><p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>Vui lòng nhập API Key ở trang Tổng quan trước khi xem thống kê.</p></Card>
      ) : statsError === "server" ? (
        <Card><p style={{ margin: 0, fontSize: "13px", color: "#f87171" }}>Server chưa cấu hình PROXY_API_KEY — Hãy chạy trình cấu hình để hoàn tất khởi tạo.</p></Card>
      ) : statsError === "auth" ? (
        <Card>
          <div style={{ fontSize: "13px", color: "#f87171", lineHeight: "1.7" }}>
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>Xác thực thất bại (API Key không khớp)</div>
            <div style={{ color: "#94a3b8", fontSize: "12.5px" }}>
              API Key nhập ở trang Tổng quan phải trùng chính xác với mật khẩu đã cấu hình.
            </div>
            <div style={{ color: "#475569", fontSize: "12px", marginTop: "6px" }}>
              Nếu quên mật khẩu, hãy xem giá trị
              <code style={{ color: "#a78bfa", fontFamily: "Menlo, monospace", marginLeft: "4px", marginRight: "4px" }}>PROXY_API_KEY</code>
              trong panel <strong style={{ color: "#94a3b8" }}>&#128274; Secrets</strong> ở thanh bên Replit, hoặc chạy lại trình cấu hình để đổi mật khẩu.
            </div>
          </div>
        </Card>
      ) : !stats ? (
        <Card><p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>Đang tải...</p></Card>
      ) : (
        <>
          {/* 6 Summary Cards - 3x2 Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "16px" }}>
            {/* Thống kê sử dụng */}
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <span style={{ fontSize: "15px" }}>&#128202;</span>
                <span>Thống kê sử dụng</span>
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={subNumStyle}>Tổng request</div>
                  <div style={{ ...bigNumStyle, color: "#818cf8" }}>{totals!.calls}</div>
                </div>
                <div>
                  <div style={subNumStyle}>Streaming</div>
                  <div style={{ ...bigNumStyle, color: "#3b82f6" }}>{totals!.streamingCalls}</div>
                </div>
              </div>
            </div>

            {/* Lượng Token */}
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <span style={{ fontSize: "15px" }}>&#9889;</span>
                <span style={{ color: "#fbbf24" }}>Lượng Token</span>
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={subNumStyle}>Prompt tokens</div>
                  <div style={{ ...bigNumStyle, color: "#34d399" }}>{fmt(totals!.promptTokens)}</div>
                </div>
                <div>
                  <div style={subNumStyle}>Completion tokens</div>
                  <div style={{ ...bigNumStyle, color: "#34d399" }}>{fmt(totals!.completionTokens)}</div>
                </div>
              </div>
            </div>

            {/* Chi phí ước tính */}
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <span style={{ fontSize: "15px" }}>&#128176;</span>
                <span style={{ color: "#f59e0b" }}>Chi phí ước tính</span>
                {totalModelCost !== null && <span style={{ fontSize: "10px", color: "#475569", marginLeft: "auto" }}>Theo giá từng mô hình</span>}
              </div>
              <div>
                <div style={subNumStyle}>Tổng chi phí</div>
                <div style={{ ...bigNumStyle, color: "#f59e0b" }}>
                  ${(totalModelCost ?? estimateCostFallback(totals!.promptTokens, totals!.completionTokens)).toFixed(2)}
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#475569" }}>Input <span style={{ color: "#f59e0b" }}>${(totalModelInputCost ?? (totals!.promptTokens * DEFAULT_PRICING.input / 1_000_000)).toFixed(2)}</span></span>
                  <span style={{ fontSize: "11px", color: "#475569" }}>Output <span style={{ color: "#f59e0b" }}>${(totalModelOutputCost ?? (totals!.completionTokens * DEFAULT_PRICING.output / 1_000_000)).toFixed(2)}</span></span>
                </div>
              </div>
            </div>

            {/* Tỷ lệ thành công */}
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <span style={{ fontSize: "15px" }}>&#9989;</span>
                <span>Tỷ lệ thành công</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ position: "relative", width: "52px", height: "52px" }}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    {totals!.calls > 0 && (
                      <circle cx="26" cy="26" r="20" fill="none" stroke="#4ade80" strokeWidth="5"
                        strokeDasharray={`${((totals!.calls - totals!.errors) / totals!.calls) * 125.6} 125.6`}
                        strokeLinecap="round" transform="rotate(-90 26 26)" />
                    )}
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>
                    {totals!.calls > 0 ? `${Math.round(((totals!.calls - totals!.errors) / totals!.calls) * 100)}%` : "--"}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Thành công <strong style={{ color: "#e2e8f0" }}>{totals!.calls - totals!.errors}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f87171" }} />
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Thất bại <strong style={{ color: "#e2e8f0" }}>{totals!.errors}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chỉ số hiệu suất */}
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <span style={{ fontSize: "15px" }}>&#127919;</span>
                <span style={{ color: "#f43f5e" }}>Chỉ số hiệu suất</span>
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={subNumStyle}>Avg. latency</div>
                  <div style={{ ...bigNumStyle, fontSize: "20px", color: "#e2e8f0" }}>
                    {totals!.calls > 0 ? `${Math.round(totals!.totalDuration / totals!.calls)}ms` : "--"}
                  </div>
                </div>
                <div>
                  <div style={subNumStyle}>Avg. TTFT</div>
                  <div style={{ ...bigNumStyle, fontSize: "20px", color: "#e2e8f0" }}>
                    {totals!.totalStreamCalls > 0 ? `${Math.round(totals!.totalTtft / totals!.totalStreamCalls)}ms` : "--"}
                  </div>
                </div>
              </div>
            </div>

            {/* Chi phí theo mô hình */}
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <span style={{ fontSize: "15px" }}>&#128221;</span>
                <span style={{ color: "#a78bfa" }}>Chi phí theo mô hình</span>
              </div>
              {(() => {
                if (!modelStats || Object.keys(modelStats).length === 0) {
                  return <div style={{ fontSize: "12px", color: "#475569" }}>Chưa có dữ liệu</div>;
                }
                const sorted = Object.entries(modelStats)
                  .filter(([, ms]) => ms.calls > 0)
                  .map(([model, ms]) => ({ model, cost: estimateModelCost(model, ms.promptTokens, ms.completionTokens), calls: ms.calls }))
                  .sort((a, b) => b.cost - a.cost);
                if (sorted.length === 0) return <div style={{ fontSize: "12px", color: "#475569" }}>Chưa có dữ liệu</div>;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "120px", overflowY: "auto" }}>
                    {sorted.map(({ model, cost, calls }) => (
                      <div key={model} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", gap: "8px" }}>
                        <span style={{ color: "#94a3b8", fontFamily: "Menlo, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }} title={model}>{model}</span>
                        <span style={{ color: "#475569", flexShrink: 0 }}>{calls} lần</span>
                        <span style={{ color: "#f59e0b", fontWeight: 600, flexShrink: 0 }}>${cost.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Per-backend node cards */}
          <Card style={{ marginBottom: "14px" }}>
            <SectionTitle>Thống kê theo node</SectionTitle>
            {Object.entries(stats).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "40px", marginBottom: "8px", opacity: 0.3 }}>&#128172;</div>
                <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Chưa có dữ liệu thống kê</div>
                <div style={{ color: "#475569", fontSize: "12px", marginTop: "4px" }}>Thống kê sẽ tự động ghi nhận sau khi có yêu cầu API</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Object.entries(stats).map(([label, s]) => {
                  const isEnabled = s.enabled !== false;
                  const isHealthy = s.health === "healthy";
                  const cost = estimateCostFallback(s.promptTokens, s.completionTokens);
                  return (
                    <div key={label} style={{
                      background: isEnabled ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.35)",
                      border: `1px solid ${isEnabled ? "rgba(255,255,255,0.06)" : "rgba(248,113,113,0.15)"}`,
                      borderRadius: "10px", padding: "14px 16px",
                      opacity: isEnabled ? 1 : 0.6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: !isEnabled ? "#64748b" : isHealthy ? "#4ade80" : "#f87171",
                          boxShadow: (isEnabled && isHealthy) ? "0 0 6px #4ade80" : undefined,
                        }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: isEnabled ? "#e2e8f0" : "#64748b", fontFamily: "'JetBrains Mono', Menlo, monospace" }}>{label}</span>
                        {s.dynamic && <span style={{ fontSize: "10px", color: "#a78bfa", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: "4px", padding: "1px 6px" }}>Động</span>}
                        {!isEnabled && <span style={{ fontSize: "10px", color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "4px", padding: "1px 6px" }}>Đã tắt</span>}
                        {s.url && <span style={{ fontSize: "11px", color: "#334155", fontFamily: "Menlo, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.url}</span>}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
                        {[
                          { label: "Request", value: s.calls.toString(), color: "#818cf8" },
                          { label: "Streaming", value: (s.streamingCalls ?? 0).toString(), color: "#3b82f6" },
                          { label: "Lỗi", value: s.errors.toString(), color: s.errors > 0 ? "#f87171" : "#4ade80" },
                          { label: "Prompt tokens", value: fmt(s.promptTokens), color: "#34d399" },
                          { label: "Completion tokens", value: fmt(s.completionTokens), color: "#34d399" },
                          { label: "Avg. latency", value: s.calls > 0 ? `${s.avgDurationMs}ms` : "--", color: "#e2e8f0" },
                          { label: "TTFT", value: s.avgTtftMs ? `${s.avgTtftMs}ms` : "--", color: "#e2e8f0" },
                          { label: "Chi phí", value: `$${cost.toFixed(2)}`, color: "#f59e0b" },
                        ].map((item) => (
                          <div key={item.label}>
                            <div style={{ fontSize: "10px", color: "#475569", marginBottom: "2px" }}>{item.label}</div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: item.color, fontFamily: "'JetBrains Mono', Menlo, monospace" }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Routing Settings */}
      {apiKey && (
        <Card style={{ marginBottom: "14px" }}>
          <SectionTitle>Routing</SectionTitle>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#475569" }}>Kiểm soát hành vi gọi backend cục bộ (tài khoản chính). Node con luôn được ưu tiên.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {([
              { field: "localEnabled" as const, label: "Bật backend cục bộ", desc: "Khi tắt, backend cục bộ hoàn toàn dừng, mọi request chỉ đi qua node con" },
              { field: "localFallback" as const, label: "Fallback về backend cục bộ", desc: "Khi tắt, kể cả khi tất cả node con ngoại tuyến cũng không gọi backend cục bộ (trả về 503)" },
              { field: "fakeStream" as const, label: "Fake Streaming", desc: "Khi bật, nếu backend không hỗ trợ hoặc streaming thất bại, sẽ mô phỏng phản hồi đầy đủ thành SSE streaming" },
            ]).map(({ field, label, desc }) => (
              <div key={field} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px", padding: "10px 14px",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{desc}</div>
                </div>
                <button
                  onClick={() => onToggleRouting(field, !routing[field])}
                  style={{
                    width: "40px", height: "22px", borderRadius: "11px", border: "none", cursor: "pointer",
                    background: routing[field] ? "#6366f1" : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background 0.2s", flexShrink: 0, marginLeft: "12px",
                  }}
                >
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                    position: "absolute", top: "3px",
                    left: routing[field] ? "21px" : "3px",
                    transition: "left 0.2s",
                  }} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Node */}
      <Card>
        <SectionTitle>Thêm node</SectionTitle>
        <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "#475569" }}>Có hiệu lực ngay, không cần khởi động lại hay phát hành lại. Tự động cân bằng tải giữa các node.</p>

        {!apiKey ? (
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>Vui lòng nhập API Key ở trang Tổng quan trước khi thao tác.</p>
        ) : (
          <>
            <form onSubmit={onAddBackend} style={{ display: "flex", gap: "8px" }}>
              <input
                type="url"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder="https://friend-proxy.replit.app"
                style={{
                  flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", padding: "8px 12px", color: "#e2e8f0",
                  fontFamily: "Menlo, monospace", fontSize: "13px", outline: "none",
                }}
              />
              <button type="submit" disabled={addState === "loading"} style={{
                background: addState === "loading" ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.7)",
                border: "1px solid rgba(99,102,241,0.6)", color: "#e0e7ff",
                borderRadius: "8px", padding: "8px 18px", fontSize: "13px",
                fontWeight: 600, cursor: addState === "loading" ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}>{addState === "loading" ? "Đang thêm…" : "Thêm node"}</button>
            </form>

            {/* ENV node via Replit Agent */}
            <div style={{ marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
              <div style={{ fontSize: "12.5px", color: "#94a3b8", fontWeight: 600, marginBottom: "6px" }}>
                Thêm qua biến môi trường (node vĩnh viễn)
              </div>
              <div style={{ fontSize: "11.5px", color: "#475569", lineHeight: "1.5", marginBottom: "8px" }}>
                ENV node được lưu vào Secrets, không mất sau khi Publish. Gửi nội dung bên dưới cho Replit Agent để tự động hoàn tất cấu hình.
              </div>
              {/* Copyable prompt block */}
              <div
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    color: "#a5b4fc",
                    fontSize: "12px",
                    fontFamily: "Menlo, Consolas, monospace",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    userSelect: "all",
                    wordBreak: "break-all",
                  }}
                >
                  {ENV_NODE_PROMPT}
                </span>
                <button
                  onClick={copyEnvPrompt}
                  title="Sao chép"
                  style={{
                    flexShrink: 0,
                    background: envPromptCopied ? "rgba(74,222,128,0.12)" : "rgba(99,102,241,0.1)",
                    border: `1px solid ${envPromptCopied ? "rgba(74,222,128,0.4)" : "rgba(99,102,241,0.25)"}`,
                    borderRadius: "6px",
                    padding: "4px 10px",
                    color: envPromptCopied ? "#4ade80" : "#a78bfa",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {envPromptCopied ? "✓ Đã sao chép" : "📋 Sao chép"}
                </button>
              </div>
            </div>
            {(() => {
              const raw = addUrl.trim();
              const normed = normalizeBackendUrl(raw);
              return raw && normed !== raw.replace(/\/+$/, "") ? (
                <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: "#94a3b8" }}>
                  Sẽ lưu là: <code style={{ color: "#a78bfa", fontFamily: "Menlo, monospace" }}>{normed}</code>
                </p>
              ) : null;
            })()}
            {addState === "ok" && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#4ade80" }}>{addMsg}</p>}
            {addState === "err" && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#f87171" }}>{addMsg}</p>}

            {allSubNodes.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                {/* 标题行 + 全选 + 批量操作 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                  {/* 全选复选框 */}
                  <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                      onChange={toggleSelectAll}
                      style={{ accentColor: "#818cf8", width: "14px", height: "14px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "11px", color: "#475569" }}>
                      {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      {someSelected && !allSelected ? `(Đã chọn ${selected.size} / ${allSubNodes.length})` : `(Tổng ${allSubNodes.length} node)`}
                    </span>
                  </label>

                  {/* 批量操作按钮（有选中时显示） */}
                  {someSelected && (
                    <>
                      <button
                        onClick={() => { onBatchToggle([...selected], true); setSelected(new Set()); }}
                        style={{ padding: "2px 10px", borderRadius: "5px", fontSize: "11px", border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.08)", color: "#4ade80", cursor: "pointer" }}
                      >Bật đã chọn</button>
                      <button
                        onClick={() => { onBatchToggle([...selected], false); setSelected(new Set()); }}
                        style={{ padding: "2px 10px", borderRadius: "5px", fontSize: "11px", border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.08)", color: "#fbbf24", cursor: "pointer" }}
                      >Tắt đã chọn</button>
                      {/* Chỉ xóa node động */}
                      {[...selected].some((l) => dynamicNodes.find(([dl]) => dl === l)) && (
                        <button
                          onClick={() => {
                            const dynamicSelected = [...selected].filter((l) => dynamicNodes.find(([dl]) => dl === l));
                            onBatchRemove(dynamicSelected);
                            setSelected(new Set());
                          }}
                          style={{ padding: "2px 10px", borderRadius: "5px", fontSize: "11px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer" }}
                        >Xóa node động</button>
                      )}
                    </>
                  )}
                </div>

                {/* 节点列表 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {allSubNodes.map(([label, s]) => {
                    const isEnabled = s.enabled !== false;
                    const isChecked = selected.has(label);
                    const isDynamic = !!s.dynamic;
                    return (
                      <div
                        key={label}
                        onClick={() => toggleSelect(label)}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          background: isChecked ? "rgba(99,102,241,0.1)" : "rgba(0,0,0,0.2)",
                          border: `1px solid ${isChecked ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.05)"}`,
                          borderRadius: "7px", padding: "8px 12px",
                          cursor: "pointer", transition: "all 0.15s",
                          opacity: isEnabled ? 1 : 0.5,
                        }}
                      >
                        {/* 复选框 */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(label)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "#818cf8", width: "14px", height: "14px", cursor: "pointer", flexShrink: 0 }}
                        />

                        {/* 健康状态点 */}
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                          background: isEnabled ? (s.health === "healthy" ? "#4ade80" : "#f87171") : "#475569" }} />

                        {/* 类型标签 */}
                        {!isDynamic && (
                          <span style={{ fontSize: "10px", color: "#64748b", background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)", borderRadius: "4px", padding: "1px 5px", flexShrink: 0 }}>ENV</span>
                        )}

                        {/* URL / label */}
                        <span style={{ flex: 1, fontSize: "12px", color: isEnabled ? "#94a3b8" : "#475569", fontFamily: "Menlo, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.url ?? label}
                        </span>

                        {/* Nhãn đã tắt */}
                        {!isEnabled && (
                          <span style={{ fontSize: "10px", color: "#64748b", background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", borderRadius: "4px", padding: "1px 6px", flexShrink: 0 }}>Đã tắt</span>
                        )}

                        <span style={{ fontSize: "11px", color: "#475569", flexShrink: 0 }}>{s.calls} lần</span>

                        {/* Bật/tắt từng node */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleBackend(label, !isEnabled); }}
                          style={{ background: "none", border: `1px solid ${isEnabled ? "rgba(251,191,36,0.3)" : "rgba(74,222,128,0.3)"}`, borderRadius: "4px", color: isEnabled ? "#fbbf24" : "#4ade80", fontSize: "11px", cursor: "pointer", padding: "1px 7px", flexShrink: 0 }}
                        >
                          {isEnabled ? "Tắt" : "Bật"}
                        </button>

                        {/* 移除仅动态节点可用 */}
                        {isDynamic && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveBackend(label); }}
                            style={{ background: "none", border: "none", color: "#f87171", fontSize: "13px", cursor: "pointer", padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
                          >×</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <FleetManager />
    </>
  );
}

// ---------------------------------------------------------------------------
// UpdateBar — 全局顶部更新通知条（自动检测，有更新时展示）
// ---------------------------------------------------------------------------

function UpdateBar({ baseUrl, apiKey: _apiKey }: { baseUrl: string; apiKey: string }) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVer, setLatestVer] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    try {
      const r = await fetch(`${baseUrl}/api/update/version`);
      if (!r.ok) return;
      const d = await r.json();
      setHasUpdate(!!d.hasUpdate);
      setLatestVer(d.latestVersion ?? "");
      setReleaseNotes(d.latestReleaseNotes ?? "");
    } catch {}
  }, [baseUrl]);

  useEffect(() => {
    check();
    const t = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [check]);

  const buildPrompt = (ver: string) =>
    `Hãy giúp tôi cập nhật AI Gateway lên phiên bản mới nhất ${ver}.\n` +
    `Lấy code mới nhất từ kho GitHub https://github.com/kimoanh11011998/ReplitAPI-GPT-ShopVn-, ghi đè lên các file dự án hiện tại (không cần giữ lại file cũ), ` +
    `sau đó chạy pnpm install, cuối cùng khởi động lại hai workflow "artifacts/api-server: API Server" và "artifacts/api-portal: web".`;

  const copyPrompt = async () => {
    const text = buildPrompt(latestVer);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const recheck = async () => {
    setChecking(true);
    await check();
    setChecking(false);
  };

  if (dismissed || !hasUpdate) return null;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: "rgba(251,191,36,0.1)",
      borderBottom: "1px solid rgba(251,191,36,0.3)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: "900px", margin: "0 auto", padding: "10px 24px",
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>🎉</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "13px", color: "#fbbf24" }}>
            <strong>Phát hiện phiên bản mới v{latestVer}</strong>
            {releaseNotes && <span style={{ color: "#92400e", marginLeft: "10px", fontSize: "12px" }}>{releaseNotes}</span>}
          </span>
        </div>

        {/* 复制提示词 — 粘贴给 Replit Agent 完成更新 */}
        <button
          onClick={copyPrompt}
          style={{
            padding: "5px 14px", borderRadius: "7px", fontSize: "12.5px", fontWeight: 700,
            border: `1px solid ${copied ? "rgba(74,222,128,0.5)" : "rgba(251,191,36,0.5)"}`,
            background: copied ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.18)",
            color: copied ? "#4ade80" : "#fbbf24",
            cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Đã sao chép! Dán cho Agent" : "📋 Sao chép hướng dẫn cập nhật"}
        </button>

        <button
          onClick={recheck}
          disabled={checking}
          style={{
            padding: "5px 10px", borderRadius: "7px", fontSize: "12px",
            border: "1px solid rgba(251,191,36,0.25)",
            background: "transparent", color: "#92400e",
            cursor: checking ? "not-allowed" : "pointer", flexShrink: 0,
            opacity: checking ? 0.5 : 1,
          }}
        >
          {checking ? "Đang kiểm tra…" : "Kiểm tra lại"}
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{ background: "none", border: "none", color: "#92400e", fontSize: "18px", cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
        >×</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fleet Manager
// 上游版本检测地址改为 GitHub raw，子节点从 GitHub 拉取更新，无需上游 Replit 在线
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

// Normalize user-supplied URL to the correct backend endpoint.
// Expected format: https://{project}.replit.app/api
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
  const [logTarget, setLogTarget] = useState<string | null>(null);

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
      setLogTarget(id);
    } catch (e) {
      patchInst(id, { status: "error", updateLog: `Lỗi: ${(e as Error).message}`, lastChecked: Date.now() });
      setLogTarget(id);
    }
  };

  const updateAll = async () => {
    const toUpdate = instances.filter((i) => i.updateAvailable);
    if (!toUpdate.length) return;
    for (const inst of toUpdate) await updateOne(inst.id);
  };

  const exportJson = () => {
    const data = instances.map(({ name, url, key }) => ({ name, url, key }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fleet.json";
    a.click();
  };

  const importJson = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json,application/json";
    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const arr = JSON.parse(await file.text()) as Array<{ name?: string; url?: string; key?: string }>;
        let added = 0;
        const next = [...instances];
        for (const item of arr) {
          if (!item.url || !item.key) continue;
          if (next.some((i) => i.url === item.url)) continue;
          next.push({
            id: genId(), name: item.name || item.url,
            url: item.url.replace(/\/+$/, ""), key: item.key,
            status: "unknown", version: null, latestVersion: null,
            updateAvailable: false, lastChecked: null, updateLog: null,
          });
          added++;
        }
        persist(next);
        if (added === 0) alert("Không có node mới được nhập (URL trùng lặp hoặc định dạng sai)");
      } catch (err) { alert(`Nhập thất bại: ${(err as Error).message}`); }
    };
    input.click();
  };

  const statusTag = (inst: FleetInstance) => {
    if (inst.status === "checking") return { label: "Đang kiểm tra", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
    if (inst.status === "updating") return { label: "Đang cập nhật", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
    if (inst.status === "restarting") return { label: "Đang khởi động lại", color: "#818cf8", bg: "rgba(129,140,248,0.12)" };
    if (inst.status === "error") return { label: "Kết nối thất bại", color: "#f87171", bg: "rgba(248,113,113,0.12)" };
    if (inst.status === "ok") {
      if (inst.updateAvailable) return { label: `Có phiên bản mới v${inst.latestVersion ?? ""}`, color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
      return { label: "Đã là mới nhất", color: "#4ade80", bg: "rgba(74,222,128,0.12)" };
    }
    return { label: "Chưa kiểm tra", color: "#475569", bg: "rgba(71,85,105,0.12)" };
  };

  const hasUpdates = instances.some((i) => i.updateAvailable);
  const logInst = instances.find((i) => i.id === logTarget);

  const inp: React.CSSProperties = {
    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "7px", padding: "7px 11px", color: "#e2e8f0",
    fontFamily: "Menlo, monospace", fontSize: "12.5px", outline: "none",
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <SectionTitle>Quản lý node con</SectionTitle>
        <div style={{ display: "flex", gap: "6px", marginTop: "-16px" }}>
          <button onClick={importJson} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#64748b", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}>Nhập JSON</button>
          <button onClick={exportJson} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#64748b", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}>Xuất JSON</button>
          <button onClick={checkAll} disabled={instances.length === 0} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#94a3b8", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}>Kiểm tra tất cả</button>
          {hasUpdates && (
            <button onClick={updateAll} style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: "6px", color: "#fbbf24", fontSize: "11px", padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>Cập nhật tất cả</button>
          )}
        </div>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#475569" }}>Quản lý nhiều phiên bản triển khai · Dữ liệu lưu trong trình duyệt</p>

      {/* Add form */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <input style={{ ...inp, flex: "0 0 110px" }} placeholder="Tên" value={addName} onChange={(e) => setAddName(e.target.value)} />
          <input style={{ ...inp, flex: "2 1 180px" }} placeholder="https://your-proxy.replit.app (địa chỉ gốc)" value={addUrl} onChange={(e) => setAddUrl(e.target.value)} />
          <input type="password" style={{ ...inp, flex: "1 1 130px" }} placeholder="PROXY_API_KEY" value={addKey} onChange={(e) => setAddKey(e.target.value)} />
          <button onClick={addInst} disabled={!addUrl || !addKey} style={{
            background: "rgba(99,102,241,0.7)", border: "1px solid rgba(99,102,241,0.6)",
            color: "#e0e7ff", borderRadius: "7px", padding: "7px 16px",
            fontSize: "13px", fontWeight: 600, cursor: (!addUrl || !addKey) ? "not-allowed" : "pointer",
            opacity: (!addUrl || !addKey) ? 0.5 : 1, flexShrink: 0,
          }}>Thêm</button>
        </div>
      </div>

      {/* Table */}
      {instances.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#334155", fontSize: "13px" }}>Chưa có node, hãy thêm ở trên</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {instances.map((inst) => {
            const tag = statusTag(inst);
            const busy = inst.status === "checking" || inst.status === "updating";
            const timeStr = inst.lastChecked ? new Date(inst.lastChecked).toLocaleTimeString() : null;
            return (
              <div key={inst.id} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9px", padding: "11px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {/* Dot */}
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                  {/* Name */}
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", minWidth: "80px" }}>{inst.name}</span>
                  {/* URL (truncated) */}
                  <span style={{ fontSize: "11px", color: "#334155", fontFamily: "Menlo, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, maxWidth: "240px" }}>{inst.url}</span>
                  {/* Version */}
                  {inst.version && (
                    <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "Menlo, monospace", flexShrink: 0 }}>v{inst.version}</span>
                  )}
                  {/* Status badge */}
                  <span style={{ fontSize: "11px", fontWeight: 600, color: tag.color, background: tag.bg, borderRadius: "99px", padding: "2px 9px", flexShrink: 0 }}>{tag.label}</span>
                  {/* Time */}
                  {timeStr && <span style={{ fontSize: "10px", color: "#334155", flexShrink: 0 }}>{timeStr}</span>}
                  {/* Actions */}
                  <div style={{ display: "flex", gap: "5px", flexShrink: 0, marginLeft: "auto" }}>
                    <button onClick={() => checkOne(inst.id)} disabled={busy} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#94a3b8", fontSize: "11px", padding: "3px 9px", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.4 : 1 }}>Kiểm tra</button>
                    <button onClick={() => updateOne(inst.id)} disabled={busy} style={{ background: inst.updateAvailable ? "rgba(251,191,36,0.12)" : "none", border: `1px solid ${inst.updateAvailable ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "5px", color: inst.updateAvailable ? "#fbbf24" : "#64748b", fontSize: "11px", padding: "3px 9px", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.4 : 1 }}>Cập nhật</button>
                    {inst.updateLog && (
                      <button onClick={() => setLogTarget(logTarget === inst.id ? null : inst.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "#475569", fontSize: "11px", padding: "3px 9px", cursor: "pointer" }}>Nhật ký</button>
                    )}
                    <button onClick={() => removeInst(inst.id)} style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "5px", color: "#f87171", fontSize: "11px", padding: "3px 9px", cursor: "pointer" }}>Xóa</button>
                  </div>
                </div>
                {/* Log */}
                {logTarget === inst.id && logInst?.updateLog && (
                  <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "10px 14px", fontFamily: "Menlo, monospace", fontSize: "12px", color: "#4ade80", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {logInst.updateLog}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function PageEndpoints({ displayUrl, expandedGroups, onToggleGroup, totalModels }: {
  displayUrl: string;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (g: string) => void;
  totalModels: number;
}) {
  return (
    <>
      {/* Endpoint list */}
      <Card style={{ marginBottom: "14px" }}>
        <SectionTitle>Danh sách API endpoint</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {([
            { method: "GET", path: "/v1/models", desc: "Liệt kê tất cả model khả dụng" },
            { method: "POST", path: "/v1/chat/completions", desc: "Chat Completions – OpenAI format (Tool Calling + Streaming)" },
            { method: "POST", path: "/v1/messages", desc: "Claude Messages API – native format" },
            { method: "POST", path: "/v1/models/:model:generateContent", desc: "Gemini native – non-streaming (alias: /v1beta/...)" },
            { method: "POST", path: "/v1/models/:model:streamGenerateContent", desc: "Gemini native – SSE streaming (alias: /v1beta/...)" },
            { method: "GET", path: "/v1/stats", desc: "Xem thống kê sử dụng các backend (cần API Key)" },
            { method: "GET", path: "/v1/admin/backends", desc: "Liệt kê tất cả backend node (cần API Key)" },
            { method: "POST", path: "/v1/admin/backends", desc: "Thêm node mới động (cần API Key)" },
            { method: "DELETE", path: "/v1/admin/backends/:label", desc: "Xóa node động (cần API Key)" },
          ] as { method: "GET" | "POST" | "DELETE"; path: string; desc: string }[]).map((ep) => (
            <div key={`${ep.method}:${ep.path}`} style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px", padding: "10px 14px",
            }}>
              <MethodBadge method={ep.method as "GET" | "POST"} />
              <code style={{ color: "#e2e8f0", fontFamily: "Menlo, monospace", fontSize: "12.5px", flex: 1 }}>{ep.path}</code>
              <span style={{ color: "#475569", fontSize: "12px", flexShrink: 0, maxWidth: "260px", textAlign: "right" }}>{ep.desc}</span>
              <CopyButton text={`${displayUrl}${ep.path}`} />
            </div>
          ))}
        </div>
      </Card>

      {/* Auth */}
      <Card style={{ marginBottom: "14px" }}>
        <SectionTitle>Phương thức xác thực (chọn một trong bốn)</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Authorization: Bearer (khuyến nghị, tương thích tất cả client OpenAI)", code: `Authorization: Bearer YOUR_PROXY_API_KEY` },
            { label: "x-api-key Header (tương thích client OpenAI cũ)", code: `x-api-key: YOUR_PROXY_API_KEY` },
            { label: "x-goog-api-key Header (tương thích Gemini SDK)", code: `x-goog-api-key: YOUR_PROXY_API_KEY` },
            { label: "Tham số URL ?key= (phù hợp debug đơn giản)", code: `${displayUrl}/v1/models?key=YOUR_PROXY_API_KEY` },
          ].map((auth) => (
            <div key={auth.label}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{auth.label}</div>
              <CodeBlock code={auth.code} />
            </div>
          ))}
        </div>
      </Card>

      {/* Tool Calling */}
      <Card style={{ marginBottom: "14px" }}>
        <SectionTitle>Ví dụ Tool Calling / Function Calling</SectionTitle>
        <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>
          Sử dụng định dạng <code style={{ color: "#a78bfa", background: "rgba(167,139,250,0.1)", padding: "1px 5px", borderRadius: "4px" }}>tools</code> chuẩn OpenAI, proxy tự động chuyển đổi sang định dạng từng backend.
        </p>
        <CodeBlock
          code={`curl ${displayUrl}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [{"role": "user", "content": "Thời tiết Hà Nội thế nào?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
          "type": "object",
          "properties": { "city": {"type": "string"} },
          "required": ["city"]
        }
      }
    }],
    "tool_choice": "auto"
  }'`}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
          {["OpenAI ✓ pass-through", "Anthropic ✓ chuyển đổi tool_use", "Gemini ✓ chuyển đổi functionDeclarations", "OpenRouter ✓ pass-through"].map((s) => (
            <span key={s} style={{
              fontSize: "11px", color: "#4ade80", background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)", borderRadius: "5px", padding: "3px 8px",
            }}>{s}</span>
          ))}
        </div>
      </Card>

      {/* Quick Test */}
      <Card style={{ marginBottom: "14px" }}>
        <SectionTitle>Kiểm tra nhanh</SectionTitle>
        <CodeBlock
          code={`curl ${displayUrl}/v1/models \\
  -H "Authorization: Bearer YOUR_PROXY_API_KEY"`}
          copyText={`curl ${displayUrl}/v1/models \\\n  -H "Authorization: Bearer YOUR_PROXY_API_KEY"`}
        />
        <div style={{ marginTop: "14px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Kiểm tra stream:</div>
          <CodeBlock
            code={`curl ${displayUrl}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"Hello!"}],"stream":true}'`}
          />
        </div>
      </Card>

      {/* Models */}
      <Card style={{ marginBottom: "14px" }}>
        <SectionTitle>Mô hình khả dụng ({totalModels} mô hình)</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
          {(["thinking", "thinking-visible", "tools", "reasoning"] as const).map((v) => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Badge variant={v} />
              <span style={{ fontSize: "11px", color: "#475569" }}>
                {v === "thinking" ? "Extended Thinking (ẩn)" : v === "thinking-visible" ? "Extended Thinking (hiện)" : v === "tools" ? "Tool Calling" : "Reasoning"}
              </span>
            </div>
          ))}
        </div>
        <ModelGroup title="OpenAI" models={OPENAI_MODELS} provider="openai" expanded={expandedGroups.openai} onToggle={() => onToggleGroup("openai")} />
        <ModelGroup title="Anthropic Claude" models={ANTHROPIC_MODELS} provider="anthropic" expanded={expandedGroups.anthropic} onToggle={() => onToggleGroup("anthropic")} />
        <ModelGroup title="Google Gemini" models={GEMINI_MODELS} provider="gemini" expanded={expandedGroups.gemini} onToggle={() => onToggleGroup("gemini")} />
        <ModelGroup title="OpenRouter (bất kỳ provider/model nào đều có thể định tuyến)" models={OPENROUTER_MODELS} provider="openrouter" expanded={expandedGroups.openrouter} onToggle={() => onToggleGroup("openrouter")} />
        <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>
          💡 Bất kỳ tên mô hình nào chứa <code style={{ color: "#a78bfa" }}>/</code> sẽ tự động định tuyến đến OpenRouter, không giới hạn danh sách trên.
        </p>
      </Card>

      {/* CherryStudio Guide */}
      <Card>
        <SectionTitle>Hướng dẫn kết nối CherryStudio</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { step: 1, title: "Mở Cài đặt → Model Provider", desc: "Trong CherryStudio, nhấp vào Cài đặt ở bên trái, chọn «Model Provider»." },
            { step: 2, title: "Thêm nhà cung cấp, chọn loại «OpenAI Compatible»", desc: "Nhấp «Thêm nhà cung cấp», chọn loại «OpenAI Compatible» (không chọn OpenAI gốc)." },
            {
              step: 3, title: "Nhập Base URL và API Key",
              desc: (
                <span>
                  Base URL nhập domain môi trường production, API Key nhập <code style={{ color: "#a78bfa", background: "rgba(167,139,250,0.1)", padding: "1px 5px", borderRadius: "4px" }}>PROXY_API_KEY</code>.
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#475569", flexShrink: 0 }}>Địa chỉ hiện tại</span>
                    <code style={{ flex: 1, color: "#a78bfa", fontSize: "12px", fontFamily: "Menlo, monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{displayUrl}</code>
                    <CopyButton text={displayUrl} />
                  </div>
                </span>
              ),
            },
            { step: 4, title: "Nhấp «Kiểm tra» hoặc «Thêm mô hình»", desc: `CherryStudio sẽ tự động gọi /v1/models để tải danh sách ${totalModels} mô hình, chọn mô hình cần dùng là xong.` },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: "14px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700, color: "#818cf8", flexShrink: 0, marginTop: "1px",
              }}>{item.step}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "14px", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------
// PageModels — model enable/disable management
// ---------------------------------------------------------------------------

interface ModelStatus { id: string; provider: string; enabled: boolean }

type GroupSummary = { total: number; enabled: number };

function ModelToggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: "36px", height: "20px", borderRadius: "10px", border: "none",
        background: enabled ? "rgba(99,102,241,0.7)" : "rgba(100,116,139,0.3)",
        position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
        padding: 0,
      }}
    >
      <div style={{
        width: "14px", height: "14px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "3px",
        left: enabled ? "19px" : "3px",
        transition: "left 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </button>
  );
}

function PageModels({
  baseUrl, apiKey, modelStatus, summary, onRefresh, onToggleProvider, onToggleModel,
}: {
  baseUrl: string;
  apiKey: string;
  modelStatus: ModelStatus[];
  summary: Record<string, GroupSummary>;
  onRefresh: () => void;
  onToggleProvider: (provider: string, enabled: boolean) => void;
  onToggleModel: (id: string, enabled: boolean) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    openai: true, anthropic: true, gemini: true, openrouter: true,
  });
  const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");

  const allGroups: { key: string; title: string; models: ModelEntry[]; provider: Provider }[] = [
    { key: "openai", title: "OpenAI", models: OPENAI_MODELS, provider: "openai" },
    { key: "anthropic", title: "Anthropic Claude", models: ANTHROPIC_MODELS, provider: "anthropic" },
    { key: "gemini", title: "Google Gemini", models: GEMINI_MODELS, provider: "gemini" },
    { key: "openrouter", title: "OpenRouter", models: OPENROUTER_MODELS, provider: "openrouter" },
  ];

  const statusMap = new Map(modelStatus.map((m) => [m.id, m.enabled]));

  const totalEnabled = modelStatus.filter((m) => m.enabled).length;
  const totalCount = modelStatus.length;

  if (!apiKey) {
    return (
      <Card>
        <div style={{ textAlign: "center", color: "#475569", padding: "40px 0" }}>
          <div style={{ fontSize: "24px", marginBottom: "12px" }}>🔒</div>
          <div>Vui lòng nhập API Key ở trang chủ trước khi quản lý bật/tắt mô hình</div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* 顶部统计行 */}
      <Card style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <SectionTitle>Quản lý bật/tắt mô hình</SectionTitle>
          <div style={{ fontSize: "13px", color: "#475569" }}>
            Đã bật <span style={{ color: "#a5b4fc", fontWeight: 700 }}>{totalEnabled}</span> / {totalCount} mô hình
            · Mô hình bị tắt sẽ không xuất hiện trong phản hồi <code style={{ fontFamily: "Menlo, monospace", fontSize: "12px", color: "#818cf8" }}>/v1/models</code>, trả về 403 khi gọi
          </div>
        </div>
        {/* 过滤器 */}
        <div style={{ display: "flex", gap: "4px" }}>
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)",
              background: filter === f ? "rgba(99,102,241,0.2)" : "transparent",
              color: filter === f ? "#a5b4fc" : "#475569", fontSize: "12px", cursor: "pointer",
              fontWeight: filter === f ? 600 : 400,
            }}>
              {f === "all" ? "Tất cả" : f === "enabled" ? "Đã bật" : "Đã tắt"}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} style={{
          padding: "6px 14px", borderRadius: "7px",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
          color: "#475569", fontSize: "12px", cursor: "pointer",
        }}>Làm mới</button>
      </Card>

      {/* 各组 */}
      {allGroups.map(({ key, title, models, provider }) => {
        const c = PROVIDER_COLORS[provider];
        const grpSummary = summary[key] ?? { total: models.length, enabled: models.length };
        const isExpanded = expandedGroups[key];
        const groupEnabled = grpSummary.enabled > 0;
        const allEnabled = grpSummary.enabled === grpSummary.total;

        const filteredModels = models.filter((m) => {
          const en = statusMap.get(m.id) ?? true;
          if (filter === "enabled") return en;
          if (filter === "disabled") return !en;
          return true;
        });

        return (
          <div key={key} style={{ marginBottom: "10px" }}>
            {/* Group header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px",
              padding: "10px 14px",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
              <button onClick={() => setExpandedGroups((p) => ({ ...p, [key]: !p[key] }))} style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                fontWeight: 600, color: c.text, fontSize: "13px", flex: 1, textAlign: "left",
              }}>
                {title}
              </button>
              {/* 统计 */}
              <span style={{ fontSize: "12px", color: "#475569" }}>
                {grpSummary.enabled}/{grpSummary.total} đã bật
              </span>
              {/* Nút hàng loạt */}
              <button onClick={() => onToggleProvider(key, true)} style={{
                padding: "3px 10px", borderRadius: "5px", fontSize: "11px",
                border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.08)",
                color: "#4ade80", cursor: "pointer",
              }}>Bật tất cả</button>
              <button onClick={() => onToggleProvider(key, false)} style={{
                padding: "3px 10px", borderRadius: "5px", fontSize: "11px",
                border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)",
                color: "#f87171", cursor: "pointer",
              }}>Tắt tất cả</button>
              {/* 组级总开关 */}
              <ModelToggle
                enabled={groupEnabled}
                onChange={() => onToggleProvider(key, !allEnabled)}
              />
              <button onClick={() => setExpandedGroups((p) => ({ ...p, [key]: !p[key] }))} style={{
                background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "11px",
              }}>{isExpanded ? "▲" : "▼"}</button>
            </div>

            {/* 模型列表 */}
            {isExpanded && filteredModels.length > 0 && (
              <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                {filteredModels.map((m) => {
                  const enabled = statusMap.get(m.id) ?? true;
                  return (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: enabled ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.35)",
                      border: `1px solid ${enabled ? "rgba(255,255,255,0.05)" : "rgba(248,113,113,0.12)"}`,
                      borderRadius: "7px", padding: "6px 12px",
                      opacity: enabled ? 1 : 0.55, transition: "all 0.15s",
                    }}>
                      <code style={{
                        fontFamily: "Menlo, monospace", fontSize: "11.5px",
                        color: enabled ? c.text : "#475569",
                        flex: 1, wordBreak: "break-all",
                      }}>{m.id}</code>
                      <span style={{ fontSize: "11.5px", color: "#334155", flexShrink: 0 }}>{m.desc}</span>
                      {m.context && (
                        <span style={{ fontSize: "10px", color: "#334155", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "3px", padding: "1px 5px", flexShrink: 0 }}>{m.context}</span>
                      )}
                      {m.badge && <Badge variant={m.badge} />}
                      <ModelToggle enabled={enabled} onChange={() => onToggleModel(m.id, !enabled)} />
                    </div>
                  );
                })}
              </div>
            )}
            {isExpanded && filteredModels.length === 0 && (
              <div style={{ padding: "10px 14px", color: "#334155", fontSize: "12.5px" }}>
                Không có mô hình nào khớp với bộ lọc này
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

type Tab = "home" | "stats" | "models" | "logs" | "endpoints";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [online, setOnline] = useState<boolean | null>(null);
  const [sillyTavernMode, setSillyTavernMode] = useState(false);
  const [stLoading, setStLoading] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("proxy_api_key") ?? "");
  const [showWizard, setShowWizard] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    openai: false, anthropic: false, gemini: false, openrouter: false,
  });
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
  const totalModels = OPENAI_MODELS.length + ANTHROPIC_MODELS.length + GEMINI_MODELS.length + OPENROUTER_MODELS.length;

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

  const toggleModelProvider = async (provider: string, enabled: boolean) => {
    // Optimistic update
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
    // Optimistic update
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

  const batchRemoveBackends = async (labels: string[]) => {
    await Promise.all(labels.map((l) =>
      fetch(`${baseUrl}/api/v1/admin/backends/${l}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      })
    ));
    fetchStats(apiKey);
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

  // Auto-show wizard only when server is NOT configured yet.
  // Once PROXY_API_KEY is set server-side, wizard never pops up automatically.
  // Uses sessionStorage so a manual dismiss stays dismissed for this tab's lifetime.
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

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "Tổng quan", icon: "&#127968;" },
    { id: "stats", label: "Thống kê", icon: "&#128200;" },
    { id: "models", label: "Mô hình", icon: "&#129302;" },
    { id: "logs", label: "Nhật ký", icon: "&#128203;" },
    { id: "endpoints", label: "Tài liệu", icon: "&#128214;" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "hsl(222,47%,11%)", color: "#e2e8f0", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {showWizard && (
        <SetupWizard
          baseUrl={baseUrl}
          onComplete={(key) => {
            sessionStorage.setItem("wizard_dismissed", "1");
            setShowWizard(false);
            if (key) {
              setApiKey(key);
              localStorage.setItem("proxy_api_key", key);
            }
          }}
          onDismiss={() => { sessionStorage.setItem("wizard_dismissed", "1"); setShowWizard(false); }}
        />
      )}

      <UpdateBar baseUrl={baseUrl} apiKey={apiKey} />

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Header */}
        <div style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(59,130,246,0.04) 100%)",
          border: "1px solid rgba(99,102,241,0.12)",
          borderRadius: "16px", padding: "24px 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>&#9889;</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>GPT ShopVN - Free API Gateway</h1>
              <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: "12.5px" }}>
                AI Proxy Gateway · OpenAI / Anthropic / Gemini / OpenRouter
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <UpdateBadge baseUrl={baseUrl} apiKey={apiKey} />
              <button onClick={() => setShowWizard(true)} style={{
                padding: "6px 14px", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
                border: "1px solid rgba(99,102,241,0.3)", borderRadius: "100px",
                color: "#a5b4fc", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.2s",
              }}>&#128640; Trình cấu hình</button>
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: online === null ? "rgba(100,116,139,0.15)" : online ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                border: `1px solid ${online === null ? "rgba(100,116,139,0.3)" : online ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
                borderRadius: "100px", padding: "5px 12px 5px 8px",
              }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: online === null ? "#64748b" : online ? "#4ade80" : "#f87171",
                  boxShadow: online ? "0 0 8px rgba(74,222,128,0.5)" : undefined,
                  animation: online ? "pulse 2s infinite" : undefined,
                }} />
                <span style={{ fontSize: "12px", color: online === null ? "#64748b" : online ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                  {online === null ? "..." : online ? "Trực tuyến" : "Ngoại tuyến"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: "2px", marginBottom: "24px",
          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "4px",
          backdropFilter: "blur(8px)",
        }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "9px 8px", borderRadius: "8px", border: "none",
                background: tab === t.id
                  ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))"
                  : "transparent",
                color: tab === t.id ? "#c7d2fe" : "#475569",
                fontSize: "12.5px", fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: tab === t.id
                  ? "inset 0 0 0 1px rgba(99,102,241,0.3), 0 2px 8px rgba(99,102,241,0.1)"
                  : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t.icon }} style={{ fontSize: "13px" }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Page content */}
        {tab === "home" && (
          <PageHome
            displayUrl={displayUrl}
            apiKey={apiKey}
            setApiKey={setApiKey}
            sillyTavernMode={sillyTavernMode}
            stLoading={stLoading}
            onToggleSTMode={toggleSTMode}
          />
        )}
        {tab === "stats" && (
          <PageStats
            baseUrl={baseUrl}
            apiKey={apiKey}
            stats={stats}
            statsError={statsError}
            onRefresh={() => fetchStats(apiKey)}
            addUrl={addUrl}
            setAddUrl={setAddUrl}
            addState={addState}
            addMsg={addMsg}
            onAddBackend={addBackend}
            onRemoveBackend={removeBackend}
            onToggleBackend={toggleBackend}
            onBatchToggle={batchToggleBackends}
            onBatchRemove={batchRemoveBackends}
            routing={routing}
            onToggleRouting={toggleRouting}
            modelStats={modelStats}
          />
        )}
        {tab === "models" && (
          <PageModels
            baseUrl={baseUrl}
            apiKey={apiKey}
            modelStatus={modelStatus}
            summary={modelSummary}
            onRefresh={() => fetchModels(apiKey)}
            onToggleProvider={toggleModelProvider}
            onToggleModel={toggleModelById}
          />
        )}
        {tab === "logs" && (
          <PageLogs baseUrl={baseUrl} apiKey={apiKey} />
        )}
        {tab === "endpoints" && (
          <PageDocs />
        )}

        <div style={{ marginTop: "32px", textAlign: "center", color: "#1e293b", fontSize: "12px" }}>
          Powered by Replit AI Integrations · OpenAI · Anthropic · Gemini · OpenRouter
        </div>
      </div>
    </div>
  );
}
