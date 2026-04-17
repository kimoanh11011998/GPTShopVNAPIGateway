import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Copy, Bot, TerminalSquare } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  baseUrl: string;
  onComplete: (apiKey?: string) => void;
  onDismiss: () => void;
}

interface CopyBlock {
  text: string;
}

interface Message {
  id: number;
  from: "agent" | "user";
  text: string;
  copyBlocks?: CopyBlock[];
  actions?: Action[];
}

interface Action {
  label: string;
  value: string;
  primary?: boolean;
}

interface SetupStatus {
  configured: boolean;
  integrationsReady: boolean;
  storageReady: boolean;
}

function buildSetupPrompt(
  apiKey: string,
  opts: { needIntegrations: boolean; needStorage: boolean } = { needIntegrations: true, needStorage: true }
): string {
  const steps: string[] = [];
  let stepNum = 0;

  steps.push(`Bước ${++stepNum}: Thêm Secret — PROXY_API_KEY
   Tôi đã chọn mật khẩu truy cập của mình, hãy ghi chính xác giá trị sau vào Secrets, không được thay đổi hay tự tạo ngẫu nhiên:
   PROXY_API_KEY = ${apiKey}`);

  if (opts.needIntegrations) {
    steps.push(`Bước ${++stepNum}: Kích hoạt Replit AI Integrations (cần cả bốn provider)
   【Quan trọng】Đây là tính năng tích hợp sẵn của nền tảng Replit, hoàn toàn không cần tôi cung cấp API Key của bên thứ ba (OpenAI, Anthropic, Gemini, OpenRouter đều được nền tảng cung cấp miễn phí).
   Hãy thực thi lần lượt bốn lệnh sau trong công cụ code_execution (phải thực thi từng lệnh theo thứ tự, chờ lệnh trước xong rồi mới thực hiện lệnh sau):

   const r1 = await setupReplitAIIntegrations({ providerSlug: "openai", providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL", providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY" });
   console.log("OpenAI:", JSON.stringify(r1));

   const r2 = await setupReplitAIIntegrations({ providerSlug: "anthropic", providerUrlEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_BASE_URL", providerApiKeyEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_API_KEY" });
   console.log("Anthropic:", JSON.stringify(r2));

   const r3 = await setupReplitAIIntegrations({ providerSlug: "gemini", providerUrlEnvVarName: "AI_INTEGRATIONS_GEMINI_BASE_URL", providerApiKeyEnvVarName: "AI_INTEGRATIONS_GEMINI_API_KEY" });
   console.log("Gemini:", JSON.stringify(r3));

   const r4 = await setupReplitAIIntegrations({ providerSlug: "openrouter", providerUrlEnvVarName: "AI_INTEGRATIONS_OPENROUTER_BASE_URL", providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENROUTER_API_KEY" });
   console.log("OpenRouter:", JSON.stringify(r4));

   Sau khi tất cả bốn lệnh thành công, biến môi trường sẽ tự động được thiết lập, không cần thao tác thủ công.`);
  }

  if (opts.needStorage) {
    steps.push(`Bước ${++stepNum}: Kích hoạt lưu trữ đám mây (App Storage)
   Thực thi JavaScript sau trong công cụ code_execution để tạo GCS bucket riêng cho dự án này, đảm bảo cấu hình node con không bị mất sau khi publish:

   const result = await setupObjectStorage();
   console.log(JSON.stringify(result));

   Sau khi thực thi thành công, Replit sẽ tự động ghi các biến môi trường như DEFAULT_OBJECT_STORAGE_BUCKET_ID, không cần thao tác thủ công.`);
  }

  return `Hãy giúp tôi hoàn tất cấu hình ban đầu cho GPT ShopVN - Free API Gateway, thực hiện chính xác theo các bước sau:

【Tuyệt đối không được】Không được yêu cầu tôi cung cấp API Key của OpenAI, Anthropic, Gemini hoặc OpenRouter — cả bốn đều được nền tảng Replit cung cấp tự động qua AI Integrations, người dùng không cần có và không cần nhập bất kỳ khóa bên thứ ba nào.

${steps.join("\n\n")}

Sau khi hoàn thành các bước trên, hãy khởi động lại hai Workflow sau rồi thông báo cho tôi, tôi sẽ nhấn nút "Đã khởi động lại, kiểm tra lại" trên cổng để xác nhận cấu hình:
- artifacts/api-server: API Server
- artifacts/api-portal: web`;
}

const STORAGE_ONLY_PROMPT = `Hãy giúp tôi khởi tạo lưu trữ đám mây cho GPT ShopVN - Free API Gateway:

Thực thi JavaScript sau trong công cụ code_execution để tạo GCS bucket riêng cho dự án này (đảm bảo cấu hình node con không bị mất sau khi publish):

const result = await setupObjectStorage();
console.log(JSON.stringify(result));

Sau khi thực thi thành công, hãy khởi động lại server rồi thông báo cho tôi, tôi sẽ nhấn "Đã khởi động lại, kiểm tra lại" để xác nhận.`;

let msgId = 0;
const makeMsg = (
  from: Message["from"],
  text: string,
  extras: Partial<Omit<Message, "id" | "from" | "text">> = {}
): Message => ({ id: ++msgId, from, text, ...extras });

function CopyableBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-black/40 border border-border-strong rounded-lg p-3 flex flex-col gap-3 mt-3 shadow-inner">
      <span className="flex-1 text-accent/90 text-xs font-mono leading-relaxed whitespace-pre-wrap select-all break-words max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {text}
      </span>
      <div className="flex justify-end">
        <button
          onClick={copy}
          className={cn(
            "px-3 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all border",
            copied
              ? "bg-success/10 text-success border-success/40"
              : "bg-surface-2 text-text hover:bg-border-strong border-border-strong"
          )}
        >
          {copied ? <><Check className="w-3.5 h-3.5" /> Đã sao chép</> : <><Copy className="w-3.5 h-3.5" /> Sao chép prompt</>}
        </button>
      </div>
    </div>
  );
}

export default function SetupWizard({ baseUrl, onComplete, onDismiss }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [checking, setChecking] = useState(false);
  const [keyInputStep, setKeyInputStep] = useState(false);
  const [keyInputValue, setKeyInputValue] = useState("");
  const [chosenKey, setChosenKey] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const addAgent = useCallback(
    (text: string, extras: Partial<Omit<Message, "id" | "from" | "text">> = {}, delay = 600) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, makeMsg("agent", text, extras)]);
      }, delay);
    },
    []
  );

  const addUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, makeMsg("user", text)]);
  }, []);

  const clearActions = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, actions: undefined })));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setMessages([
        makeMsg(
          "agent",
          "Xin chào! Tôi là trợ lý cấu hình.\n\nAI Gateway này tích hợp sẵn tất cả các mô hình OpenAI, Claude, Gemini và nhiều hơn nữa. Lần chạy đầu tiên cần hoàn tất khởi tạo đơn giản, toàn bộ thực hiện qua Replit Agent, không cần nhập bất kỳ khóa nào thủ công.\n\n(Tôi sẽ tự động phát hiện những phần đã sẵn sàng và chỉ tạo các bước bạn thực sự cần)",
          {
            actions: [
              { label: "Bắt đầu cấu hình", value: "start", primary: true },
              { label: "Đã cấu hình rồi", value: "already_done" },
            ],
          }
        ),
      ]);
    }, 300);
  }, []);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, typing]);

  const checkSetupStatus = useCallback(async (): Promise<SetupStatus> => {
    try {
      const res = await fetch(`${baseUrl}/api/setup-status`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { configured: false, integrationsReady: false, storageReady: false };
      return (await res.json()) as SetupStatus;
    } catch {
      return { configured: false, integrationsReady: false, storageReady: false };
    }
  }, [baseUrl]);

  const runCheck = useCallback(async () => {
    clearActions();
    setChecking(true);
    addUser("Kiểm tra thử");
    addAgent("Đang kiểm tra trạng thái cấu hình server…", {}, 300);

    const status = await checkSetupStatus();
    setChecking(false);
    setMessages((prev) => prev.filter((m) => m.text !== "Đang kiểm tra trạng thái cấu hình server…"));

    const baseOk = status.configured && status.integrationsReady;

    if (baseOk && status.storageReady) {
      addAgent(
        "Cấu hình thành công!\n\n✓ Mật khẩu truy cập đã được thiết lập\n✓ AI Integrations đã sẵn sàng\n✓ Lưu trữ đám mây đã kích hoạt\n\nCấu hình node con của bạn sẽ không bị mất sau khi publish lại.",
        {
          actions: [
            { label: "Hoàn tất, bắt đầu sử dụng 🚀", value: "finish", primary: true },
          ],
        },
        300
      );
    } else if (baseOk && !status.storageReady) {
      addAgent(
        "Mật khẩu và AI Integrations đã sẵn sàng!\n\nChỉ còn một bước cuối: kích hoạt lưu trữ đám mây (App Storage) để đảm bảo cấu hình node con thêm sau khi publish sẽ không bị mất khi deploy lại.\n\nHãy sao chép hướng dẫn bên dưới và gửi cho Replit Agent:",
        {
          copyBlocks: [{ text: STORAGE_ONLY_PROMPT }],
          actions: [{ label: "Đã khởi động lại, kiểm tra lại", value: "check", primary: true }],
        },
        300
      );
    } else if (chosenKey) {
      const needIntegrations = !status.integrationsReady;
      const needStorage = !status.storageReady;
      addAgent(
        "Cấu hình chưa hoàn tất. Hãy sao chép hướng dẫn bên dưới và gửi cho Replit Agent, nó sẽ giúp bạn hoàn tất phần còn lại:",
        {
          copyBlocks: [{ text: buildSetupPrompt(chosenKey, { needIntegrations, needStorage }) }],
          actions: [{ label: "Đã khởi động lại, kiểm tra lại", value: "check", primary: true }],
        },
        300
      );
    } else {
      addAgent(
        "Cấu hình chưa hoàn tất, cần thiết lập mật khẩu truy cập trước. Hãy nhập mật khẩu bạn muốn bên dưới:",
        {},
        300
      );
      setKeyInputStep(true);
    }
  }, [clearActions, addUser, addAgent, checkSetupStatus, chosenKey]);

  const handleAction = useCallback(
    async (value: string, label: string) => {
      clearActions();

      if (value === "start") {
        addUser(label);
        addAgent(
          "Được rồi! Đầu tiên, hãy thiết lập mật khẩu truy cập bên dưới.\n\nMật khẩu này chính là API Key bạn sẽ nhập trên trang Tổng quan sau này, do bạn tự định nghĩa, ví dụ my-secret-123. Sau khi đặt xong tôi sẽ tạo hướng dẫn cấu hình đầy đủ cho bạn.",
          {},
        );
        setKeyInputStep(true);
        return;
      }

      if (value === "already_done") {
        addUser(label);
        addAgent("Được, tôi sẽ kiểm tra trạng thái server.", {}, 300);
        setTimeout(() => runCheck(), 900);
        return;
      }

      if (value === "check") {
        await runCheck();
        return;
      }

      if (value === "finish") {
        onComplete(chosenKey || undefined);
        return;
      }
    },
    [clearActions, addUser, addAgent, runCheck, onComplete, chosenKey]
  );

  const handleKeySubmit = useCallback(async () => {
    const key = keyInputValue.trim();
    if (!key) return;
    setChosenKey(key);
    setKeyInputStep(false);
    setKeyInputValue("");
    addUser(`Mật khẩu truy cập của tôi là: ${"*".repeat(Math.max(0, key.length - 3))}${key.slice(-3)}`);

    const status = await checkSetupStatus();
    const needIntegrations = !status.integrationsReady;
    const needStorage = !status.storageReady;

    const skippedParts: string[] = [];
    if (!needIntegrations) skippedParts.push("AI Integrations");
    if (!needStorage) skippedParts.push("lưu trữ đám mây");
    const skippedNote = skippedParts.length
      ? `\n\n(Đã tự động phát hiện ${skippedParts.join(" và ")} đã sẵn sàng, các bước này đã được bỏ qua trong hướng dẫn)`
      : "";

    addAgent(
      `Tốt, mật khẩu đã được ghi nhận! Hãy sao chép toàn bộ hướng dẫn bên dưới và gửi cho Replit Agent. Nó sẽ hoàn tất toàn bộ cấu hình trong một lần (mật khẩu đã được ghi vào hướng dẫn, Agent sẽ thiết lập trực tiếp, bạn không cần nhập lại):${skippedNote}`,
      {
        copyBlocks: [{ text: buildSetupPrompt(key, { needIntegrations, needStorage }) }],
        actions: [{ label: "Đã khởi động lại, kiểm tra thử", value: "check", primary: true }],
      }
    );
  }, [keyInputValue, addUser, addAgent, checkSetupStatus]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-surface border border-border-strong rounded-[16px] w-full max-w-[540px] h-[min(680px,90vh)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-2/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <TerminalSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-text text-[15px] m-0">Trợ lý cấu hình</h2>
              <div className="text-[11px] text-success flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Đang hoạt động
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {checking && (
              <span className="text-[11px] text-accent animate-pulse font-medium">
                Đang kiểm tra…
              </span>
            )}
            <button
              onClick={onDismiss}
              className="text-text-subtle hover:text-text text-2xl leading-none px-2 transition-colors"
            >×</button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col gap-2.5">
              <div className={cn(
                "flex items-end gap-3",
                m.from === "agent" ? "justify-start" : "justify-end"
              )}>
                {m.from === "agent" && (
                  <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-accent shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[85%] p-3.5 text-[13px] leading-relaxed whitespace-pre-line shadow-sm border",
                  m.from === "agent" 
                    ? "rounded-[2px_16px_16px_16px] bg-surface-2 border-border-strong text-text" 
                    : "rounded-[16px_2px_16px_16px] bg-accent/10 border-accent/20 text-accent"
                )}>
                  {m.text}
                  {m.copyBlocks?.map((cb, i) => (
                    <CopyableBlock key={i} text={cb.text} />
                  ))}
                </div>
              </div>

              {m.actions && (
                <div className="flex gap-2 flex-wrap pl-11 mt-1">
                  {m.actions.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => handleAction(a.value, a.label)}
                      disabled={checking}
                      className={cn(
                        "px-4 py-2 rounded-full text-[12px] font-semibold transition-all border",
                        a.primary
                          ? "bg-accent/15 text-accent border-accent/30 hover:bg-accent/25 hover:border-accent/50"
                          : "bg-surface-2 text-text-muted border-border hover:bg-border-strong hover:text-text",
                        checking && "opacity-50 cursor-not-allowed pointer-events-none"
                      )}
                    >{a.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex items-end gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-accent shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-[2px_16px_16px_16px] bg-surface-2 border border-border-strong flex gap-1.5 items-center shadow-sm h-[46px]">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-[bounce_1s_ease-in-out_infinite]" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Footer Area */}
        {keyInputStep ? (
          <div className="p-4 border-t border-border bg-surface-2/50 shrink-0">
            <div className="text-[11px] text-text-muted mb-2 font-medium">
              Đặt mật khẩu truy cập (chuỗi bất kỳ, ví dụ <code className="text-accent font-mono ml-1 px-1.5 py-0.5 bg-accent/10 rounded">my-secret-123</code>)
            </div>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={keyInputValue}
                onChange={(e) => setKeyInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleKeySubmit(); }}
                placeholder="Nhập mật khẩu bạn muốn…"
                className="flex-1 px-3 py-2.5 rounded-lg border border-border-strong bg-bg text-text text-[13px] outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 font-mono transition-all"
              />
              <button
                onClick={handleKeySubmit}
                disabled={!keyInputValue.trim()}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all border shrink-0 flex items-center gap-2",
                  keyInputValue.trim() 
                    ? "bg-accent text-accent-foreground border-accent hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                    : "bg-surface-2 text-text-muted border-border cursor-not-allowed"
                )}
              >
                Xác nhận
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-border text-[11px] text-text-subtle text-center shrink-0 bg-bg">
            Toàn bộ cấu hình được thực hiện an toàn qua Replit Agent, khóa bí mật không đi qua trang này
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border-strong);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-subtle);
        }
      `}</style>
    </div>
  );
}