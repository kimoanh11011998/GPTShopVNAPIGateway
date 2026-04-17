import { useState } from "react";

const SECTIONS = [
  {
    title: "Tổng quan dự án",
    content: `GPT ShopVN - Free API Gateway là một cổng proxy AI API thống nhất, tích hợp bốn nhà cung cấp AI hàng đầu — OpenAI, Anthropic, Google Gemini và OpenRouter — vào một điểm truy cập duy nhất.

Phía client chỉ cần cấu hình một Base URL và một API Key để truy cập mô hình của tất cả các nhà cung cấp, không cần duy trì SDK, phương thức xác thực hay định dạng request riêng cho từng nhà cung cấp.

Tính năng chính:
- Định dạng tương thích OpenAI thống nhất, tự động chuyển đổi request và response
- Ưu tiên định tuyến qua cụm node con, tài khoản cục bộ chỉ là dự phòng
- Hỗ trợ đầy đủ streaming (SSE), tool calling, extended thinking
- Fake Streaming: tự động giả lập SSE từ JSON response không hỗ trợ streaming
- Deploy một click qua Replit Remix, không cần cấu hình`,
  },
  {
    title: "Cơ chế định tuyến request",
    content: `Cổng tự động xác định nhà cung cấp đích dựa vào tên mô hình trong request:

Mô hình OpenAI: gpt-5.2, gpt-5.1, gpt-5, gpt-4.1, gpt-4o, o3, o4-mini, v.v.
Mô hình Anthropic: claude-opus-4-7, claude-opus-4-6, claude-opus-4-5, claude-opus-4-1, claude-sonnet-4-6, claude-sonnet-4-5, claude-haiku-4-5 (mỗi base có thêm bí danh -thinking và -thinking-visible, trừ opus-4-7).
Mô hình Gemini: gemini-3.1-pro, gemini-2.5-flash, v.v.
Mô hình OpenRouter: tên mô hình chứa "/" (vd: openai/gpt-4o) hoặc các mô hình bên thứ ba đã đăng ký

Độ ưu tiên định tuyến:
1. Ưu tiên node con khỏe mạnh (round-robin)
2. Khi tất cả node con không khả dụng, fallback về local theo cài đặt "Dự phòng chính"
3. Tự động thử lại node tiếp theo khi gặp lỗi`,
  },
  {
    title: "Phương thức xác thực",
    content: `Hỗ trợ ba phương thức xác thực (chọn một):

1. Authorization: Bearer <proxy-key>  (chuẩn OpenAI)
2. x-api-key: <proxy-key>  (phong cách Anthropic)
3. Tham số URL ?key=<proxy-key>  (thích hợp để debug)

Tất cả API quản lý (/v1/admin/*) đều yêu cầu xác thực.
Endpoint chat completion (/v1/chat/completions) yêu cầu xác thực.
Health check (/healthz) không yêu cầu xác thực.`,
  },
  {
    title: "Chi tiết các API endpoint",
    content: `Chat Completion:
POST /v1/chat/completions — Giao diện chat tương thích OpenAI, tự động định tuyến đến backend phù hợp

Anthropic Native:
POST /v1/messages — Chuyển tiếp trực tiếp định dạng gốc của Claude

Danh sách mô hình:
GET /v1/models — Trả về danh sách mô hình tương thích OpenAI

Endpoint quản lý:
GET /v1/stats — Xem dữ liệu thống kê và cài đặt định tuyến
GET/PATCH /v1/admin/routing — Đọc/sửa chiến lược định tuyến
GET/POST/DELETE /v1/admin/backends — Quản lý node con động
GET/PATCH /v1/admin/models — Bật/tắt mô hình
GET /v1/admin/logs — Lấy nhật ký request
GET /v1/admin/logs/stream — Luồng nhật ký realtime qua SSE

Health check:
GET /healthz — Trạng thái hệ thống`,
  },
  {
    title: "Ma trận chuyển đổi định dạng",
    content: `Gửi đến mô hình Claude:
- OpenAI messages → Anthropic messages tự động chuyển đổi
- system message → tham số Anthropic system
- OpenAI tools → Anthropic tool_use blocks
- chế độ thinking → tham số extended_thinking

Gửi đến mô hình Gemini:
- OpenAI messages → định dạng Gemini contents
- system message → tham số systemInstruction
- chế độ thinking → thinkingConfig.thinkingBudget

Response luôn được chuyển đổi về định dạng tương thích OpenAI.`,
  },
  {
    title: "Chế độ Thinking (Extended Thinking)",
    content: `Kích hoạt bằng cách thêm hậu tố vào tên mô hình:

-thinking: Quá trình suy nghĩ bị ẩn, chỉ trả về câu trả lời cuối cùng
-thinking-visible: Quá trình suy nghĩ hiển thị, được bọc trong thẻ <thinking>

Ví dụ:
claude-sonnet-4-5-thinking → suy nghĩ ẩn
claude-sonnet-4-5-thinking-visible → suy nghĩ hiển thị
gemini-2.5-flash-thinking → chế độ thinking của Gemini

Mô hình Claude sử dụng Anthropic extended_thinking API.
Mô hình Gemini sử dụng thinkingConfig.thinkingBudget.
Mô hình o-series của OpenAI hỗ trợ suy luận gốc, không cần hậu tố.`,
  },
  {
    title: "Streaming đầu ra (SSE)",
    content: `Hỗ trợ đầy đủ Server-Sent Events streaming:

Đặt "stream": true trong request để kích hoạt.

Fake Streaming:
Khi backend không hỗ trợ streaming hoặc streaming thất bại, nếu bật tùy chọn "Fake Streaming", cổng sẽ tự động chia nhỏ JSON response thành các SSE chunk, mô phỏng hiệu ứng gõ từng ký tự (4 ký tự/chunk, 10ms giữa các chunk).

Kiểm soát qua công tắc "Fake Streaming" trong bảng chiến lược định tuyến.`,
  },
  {
    title: "Chế độ tương thích SillyTavern",
    content: `Các client nhập vai như SillyTavern có thể gửi chuỗi tin nhắn không đúng yêu cầu API của Claude (ví dụ: tin nhắn cuối không phải vai "user").

Khi bật chế độ này, cổng sẽ tự động thêm một tin nhắn user rỗng ở cuối để khắc phục yêu cầu thứ tự vai của Claude.

Bật/tắt qua công tắc trên trang Tổng quan.`,
  },
  {
    title: "Ví dụ tích hợp SDK",
    content: `Node.js (thư viện openai):
const openai = new OpenAI({
  baseURL: "https://your-app.replit.app/v1",
  apiKey: "your-proxy-key",
});
const response = await openai.chat.completions.create({
  model: "claude-sonnet-4-5",
  messages: [{ role: "user", content: "Hello!" }],
});

Python (thư viện openai):
from openai import OpenAI
client = OpenAI(
    base_url="https://your-app.replit.app/v1",
    api_key="your-proxy-key",
)
response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{"role": "user", "content": "Hello!"}],
)`,
  },
];

export default function PageDocs() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 8px" }}>
        Toàn bộ thông tin kỹ thuật của AI Proxy Gateway này.
      </p>
      {SECTIONS.map((sec, i) => (
        <div key={i} style={{
          background: "rgba(0,0,0,0.25)", borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          <button
            onClick={() => toggle(i)}
            style={{
              width: "100%", padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none", cursor: "pointer",
              color: "#e2e8f0", fontSize: "14px", fontWeight: 600,
              textAlign: "left",
            }}
          >
            <span>{sec.title}</span>
            <span style={{
              transform: expanded.has(i) ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s", fontSize: "12px", color: "#64748b",
            }}>&#9654;</span>
          </button>
          {expanded.has(i) && (
            <div style={{
              padding: "0 16px 16px",
              color: "#94a3b8", fontSize: "13px", lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              {sec.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
