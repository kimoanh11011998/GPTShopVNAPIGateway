import { useState, useEffect, useRef, useCallback } from "react";

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
    <div
      style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "8px",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "8px",
      }}
    >
      <span
        style={{
          flex: 1,
          color: "#a5b4fc",
          fontSize: "13px",
          fontFamily: "Menlo, monospace",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          userSelect: "all",
        }}
      >
        {text}
      </span>
      <button
        onClick={copy}
        style={{
          padding: "5px 12px",
          borderRadius: "6px",
          border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "rgba(99,102,241,0.4)"}`,
          background: copied ? "rgba(74,222,128,0.12)" : "rgba(99,102,241,0.15)",
          color: copied ? "#4ade80" : "#818cf8",
          fontSize: "11.5px",
          fontWeight: 700,
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.2s",
        }}
      >
        {copied ? "Đã sao chép ✓" : "Sao chép"}
      </button>
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

  // ── Key input submit ────────────────────────────────────────────────────
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          background: "hsl(222,47%,12%)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "520px",
          height: "min(640px, 88vh)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "17px", flexShrink: 0,
            }}
          >🤖</div>
          <div>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "13.5px" }}>Trợ lý cấu hình</div>
            <div style={{ fontSize: "11px", color: "#4ade80", display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
              Trực tuyến
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            {checking && (
              <span style={{ fontSize: "11px", color: "#6366f1", animation: "pulse 1.5s ease-in-out infinite" }}>
                Đang kiểm tra…
              </span>
            )}
            <button
              onClick={onDismiss}
              style={{ background: "none", border: "none", color: "#334155", fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "4px" }}
            >×</button>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "16px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}
        >
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <div style={{
                display: "flex",
                justifyContent: m.from === "agent" ? "flex-start" : "flex-end",
                gap: "8px", alignItems: "flex-end",
              }}>
                {m.from === "agent" && (
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", flexShrink: 0,
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "86%",
                  padding: "10px 13px",
                  borderRadius: m.from === "agent" ? "4px 13px 13px 13px" : "13px 4px 13px 13px",
                  background: m.from === "agent" ? "rgba(99,102,241,0.14)" : "rgba(74,222,128,0.1)",
                  border: `1px solid ${m.from === "agent" ? "rgba(99,102,241,0.22)" : "rgba(74,222,128,0.18)"}`,
                  color: m.from === "agent" ? "#cbd5e1" : "#a7f3d0",
                  fontSize: "13.5px", lineHeight: "1.65", whiteSpace: "pre-line",
                }}>
                  {m.text}
                  {m.copyBlocks?.map((cb, i) => (
                    <CopyableBlock key={i} text={cb.text} />
                  ))}
                </div>
              </div>

              {m.actions && (
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", paddingLeft: "34px" }}>
                  {m.actions.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => handleAction(a.value, a.label)}
                      disabled={checking}
                      style={{
                        padding: "6px 14px", borderRadius: "20px",
                        border: `1px solid ${a.primary ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.1)"}`,
                        background: a.primary ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                        color: a.primary ? "#a5b4fc" : "#64748b",
                        fontSize: "12.5px", fontWeight: 600,
                        cursor: checking ? "not-allowed" : "pointer",
                        opacity: checking ? 0.5 : 1,
                      }}
                    >{a.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", flexShrink: 0,
              }}>🤖</div>
              <div style={{
                padding: "10px 14px", borderRadius: "4px 13px 13px 13px",
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)",
                display: "flex", gap: "4px", alignItems: "center",
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1",
                    animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer — key input form or static hint */}
        {keyInputStep ? (
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(99,102,241,0.2)",
            background: "rgba(99,102,241,0.06)",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "8px" }}>
              Đặt mật khẩu truy cập (chuỗi bất kỳ, ví dụ <code style={{ color: "#a78bfa" }}>my-secret-123</code>)
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                autoFocus
                type="text"
                value={keyInputValue}
                onChange={(e) => setKeyInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleKeySubmit(); }}
                placeholder="Nhập mật khẩu bạn muốn…"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(99,102,241,0.35)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#f1f5f9",
                  fontSize: "13.5px",
                  outline: "none",
                  fontFamily: "Menlo, monospace",
                }}
              />
              <button
                onClick={handleKeySubmit}
                disabled={!keyInputValue.trim()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(99,102,241,0.5)",
                  background: keyInputValue.trim() ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.06)",
                  color: keyInputValue.trim() ? "#a5b4fc" : "#334155",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: keyInputValue.trim() ? "pointer" : "not-allowed",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                Xác nhận →
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            padding: "10px 18px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            fontSize: "11px", color: "#1e293b", textAlign: "center", flexShrink: 0,
          }}>
            Toàn bộ cấu hình được thực hiện an toàn qua Replit Agent, khóa bí mật không đi qua trang này
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
