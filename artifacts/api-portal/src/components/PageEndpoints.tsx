import { MethodBadge, CopyButton, Card } from "./Shared";

export default function PageEndpoints({ baseUrl }: { baseUrl: string }) {
  const endpoints = [
    { method: "POST" as const, path: "/v1/chat/completions", desc: "Chat Completions API (OpenAI format, tự động định tuyến)", code: `curl -X POST ${baseUrl}/v1/chat/completions \\\n  -H "Authorization: Bearer <your-proxy-key>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"claude-sonnet-4-6","messages":[{"role":"user","content":"Hello"}],"stream":true}'` },
    { method: "POST" as const, path: "/v1/messages", desc: "Anthropic Messages API", code: `curl -X POST ${baseUrl}/v1/messages \\\n  -H "x-api-key: <your-proxy-key>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"claude-sonnet-4-6","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'` },
    { method: "GET" as const, path: "/v1/models", desc: "Danh sách mô hình khả dụng", code: `curl -X GET ${baseUrl}/v1/models \\\n  -H "Authorization: Bearer <your-proxy-key>"` }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {endpoints.map((ep, i) => (
        <Card key={i} variant="standard" className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <MethodBadge method={ep.method} />
            <code className="font-mono text-[13px] text-text bg-surface-2/50 px-2 py-1 rounded border border-border">{baseUrl}{ep.path}</code>
            <CopyButton text={`${baseUrl}${ep.path}`} label="" />
          </div>
          <div className="text-[13px] text-text-subtle">{ep.desc}</div>
          <div className="relative group mt-2">
            <pre className="bg-[#030712] border border-border-strong rounded-lg p-4 pr-12 font-mono text-[12.5px] text-text-subtle overflow-x-auto leading-relaxed custom-scrollbar shadow-inner">
              {ep.code}
            </pre>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={ep.code} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}