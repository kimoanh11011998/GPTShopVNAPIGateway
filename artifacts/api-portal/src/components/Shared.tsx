import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/utils";

export type Provider = "openai" | "anthropic" | "gemini" | "openrouter";

export interface ModelEntry {
  id: string;
  label: string;
  provider: Provider;
  desc: string;
  badge?: "thinking" | "thinking-visible" | "tools" | "reasoning";
  context?: string;
}

export const OPENAI_MODELS: ModelEntry[] = [
  { id: "gpt-5.4", label: "GPT-5.4", provider: "openai", desc: "Mô hình thế hệ mới nhất hàng đầu", context: "128K", badge: "tools" },
  { id: "gpt-5.4-pro", label: "GPT-5.4 Pro", provider: "openai", desc: "Phiên bản Pro nâng cao của GPT-5.4", context: "128K", badge: "tools" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 Mini", provider: "openai", desc: "Nhanh và tiết kiệm chi phí thế hệ mới", context: "128K", badge: "tools" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 Nano", provider: "openai", desc: "Mô hình nhẹ siêu nhỏ thế hệ mới", context: "128K", badge: "tools" },
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

export const ANTHROPIC_MODELS: ModelEntry[] = [
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

export const GEMINI_MODELS: ModelEntry[] = [
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

export const OPENROUTER_MODELS: ModelEntry[] = [
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

export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-5.4": { input: 2.5, output: 10 },
  "gpt-5.4-pro": { input: 5, output: 20 },
  "gpt-5.4-mini": { input: 0.15, output: 0.6 },
  "gpt-5.4-nano": { input: 0.075, output: 0.3 },
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

export const DEFAULT_PRICING = { input: 3, output: 15 };

export function getModelPrice(model: string): { input: number; output: number } {
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

export function estimateModelCost(model: string, prompt: number, completion: number): number {
  const p = getModelPrice(model);
  return (prompt * p.input + completion * p.output) / 1_000_000;
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
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
        "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all shrink-0 border",
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

export function CodeBlock({ code, copyText }: { code: string; copyText?: string }) {
  return (
    <div className="relative group mt-2">
      <pre className="bg-[#030712] border border-border-strong rounded-lg p-3 pr-12 font-mono text-[12.5px] text-text-subtle overflow-x-auto leading-relaxed custom-scrollbar shadow-inner">
        {code}
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={copyText ?? code} />
      </div>
    </div>
  );
}

export function Card({ children, className, variant = "standard" }: { children: React.ReactNode; className?: string; variant?: "hero" | "standard" | "compact" }) {
  return (
    <div className={cn(`rounded-xl p-6 card-${variant}`, className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-text-subtle tracking-[0.1em] uppercase mb-4 mt-0 font-heading">
      {children}
    </h2>
  );
}

export function Badge({ variant }: { variant: string }) {
  const styles: Record<string, string> = {
    thinking: "text-[#c084fc] bg-[#c084fc]/10 border-[#c084fc]/30",
    "thinking-visible": "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/30",
    tools: "text-warning bg-warning/10 border-warning/30",
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

export function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span className={cn(
      "border rounded px-2 py-0.5 text-[11px] font-bold font-mono shrink-0",
      method === "GET" ? "bg-success/10 text-success border-success/30" : "bg-accent/10 text-accent border-accent/30"
    )}>
      {method}
    </span>
  );
}
