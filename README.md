# GPT ShopVN - Free API Gateway

> **Cổng proxy AI tự lưu trữ · Self-hosted AI Proxy Gateway**
>
> Remix về tài khoản Replit của bạn — dùng tín dụng AI tích hợp sẵn của Replit, không cần tự nhập API key.

[![Phiên bản](https://img.shields.io/badge/phiên_bản-1-6366f1?style=flat-square)](./version.json)
[![GitHub](https://img.shields.io/badge/GitHub-kimoanh11011998%2FReplitAPI--GPT--ShopVn--blue?style=flat-square&logo=github)](https://github.com/kimoanh11011998/ReplitAPI-GPT-ShopVn-)
[![Demo](https://img.shields.io/badge/Demo-Trực%20tuyến-10b981?style=flat-square)](https://replit-2-api-kimoanh11011998.replit.app)
[![Giấy phép](https://img.shields.io/badge/giấy_phép-MIT-10b981?style=flat-square)](./LICENSE)

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [API Endpoints](#api-endpoints)
- [Xác thực](#xác-thực)
- [Định tuyến mô hình](#định-tuyến-mô-hình)
- [Tool Calling](#tool-calling)
- [Extended Thinking](#extended-thinking)
- [Kết nối client](#kết-nối-client)
- [Fleet Manager — Quản lý nhiều node](#fleet-manager--quản-lý-nhiều-node)
- [Tự động cập nhật](#tự-động-cập-nhật)
- [Nhật ký thay đổi](#nhật-ký-thay-đổi)
- [Giấy phép](#giấy-phép)

---

## Giới thiệu

**GPT ShopVN - Free API Gateway** là một cổng proxy AI tự lưu trữ chạy trên Replit. Nó thống nhất OpenAI, Anthropic Claude, Google Gemini và OpenRouter thành một điểm truy cập duy nhất tương thích OpenAI, cho phép bất kỳ client nào hỗ trợ định dạng OpenAI (CherryStudio, SillyTavern, OpenWebUI, ...) sử dụng tất cả mô hình mà không cần thay đổi cấu hình.

> **Không cần tự cung cấp API key** của OpenAI, Anthropic, Gemini hay OpenRouter.
> Gateway sử dụng **Replit AI Integrations** — tín dụng AI tích hợp sẵn của nền tảng Replit,
> được cấp tự động cho mỗi tài khoản. Bạn chỉ cần tài khoản Replit là đủ.

Triển khai một click bằng cách paste link GitHub vào Replit Agent. Hỗ trợ cập nhật nóng mà không cần triển khai lại.

---

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🔀 Định tuyến đa backend | Tự động định tuyến theo tên mô hình đến nhà cung cấp tương ứng |
| 📐 Tự động chuyển đổi định dạng | Request/response tự động chuyển đổi giữa OpenAI ↔ Claude ↔ Gemini |
| 🔧 Tool Calling | Hỗ trợ đầy đủ OpenAI `tools` + `tool_calls`, tự động chuyển đổi cho từng backend |
| 🧠 Extended Thinking | Hậu tố `-thinking` / `-thinking-visible` để bật chế độ suy nghĩ |
| ⚡ Streaming (SSE) | Tất cả endpoint đều hỗ trợ SSE streaming |
| 🔑 Đa phương thức xác thực | Bearer Token / x-api-key / x-goog-api-key / URL query param `?key=` |
| 🎭 Tương thích SillyTavern | Tự động sửa thứ tự role Claude, thêm user message trống |
| 🖥️ Giao diện quản trị | Web UI 5 tab: Tổng quan / Thống kê / Mô hình / Nhật ký / Tài liệu |
| 🛥️ Fleet Manager | Quản lý hàng loạt node con: kiểm tra phiên bản & cập nhật một click |
| 📦 Cập nhật nóng | Đẩy cập nhật qua file bundle, không cần GitHub |

---

## Bắt đầu nhanh

### Bước 1 — Triển khai từ GitHub

Paste link sau vào hộp chat **Replit Agent** và nhờ Agent triển khai:

```
https://github.com/kimoanh11011998/ReplitAPI-GPT-ShopVn-
```

Agent sẽ tự động clone source code, cài đặt dependencies và khởi động server.

### Bước 2 — Cấu hình ban đầu

Mở trang portal, nhấn nút **Trình cấu hình** ở góc trên bên phải. Sao chép lệnh được tạo ra và dán vào hộp chat Replit Agent — Agent sẽ tự động:
- Thiết lập `PROXY_API_KEY` (mật khẩu truy cập gateway của bạn)
- Kích hoạt **Replit AI Integrations** cho OpenAI, Anthropic, Gemini và OpenRouter
- Khởi động lại server

> Replit AI Integrations cung cấp API key của tất cả nhà cung cấp tự động — bạn không cần tự đăng ký hay nhập bất kỳ key nào từ OpenAI, Anthropic, Google hay OpenRouter.

### Bước 3 — Publish và sử dụng

Nhấn **Deploy → Publish** trên Replit để phát hành ra môi trường production. Bạn sẽ nhận được địa chỉ dạng `https://your-app.replit.app` — đây là **Base URL** dùng cho tất cả client.

> Demo trực tuyến: **[https://replit-2-api-kimoanh11011998.replit.app](https://replit-2-api-kimoanh11011998.replit.app)**

---

## API Endpoints

Tất cả endpoint đều yêu cầu xác thực (xem phần bên dưới).

| Endpoint | Phương thức | Mô tả |
|----------|-------------|-------|
| `/v1/chat/completions` | POST | OpenAI Chat Completions (endpoint chính) |
| `/v1/models` | GET | Danh sách tất cả mô hình khả dụng |
| `/v1/messages` | POST | Anthropic Claude Messages định dạng native |
| `/v1/models/{model}:generateContent` | POST | Gemini native – non-streaming |
| `/v1/models/{model}:streamGenerateContent` | POST | Gemini native – SSE streaming |
| `/v1beta/models/{model}:generateContent` | POST | Alias Gemini native – non-streaming |
| `/v1beta/models/{model}:streamGenerateContent` | POST | Alias Gemini native – SSE streaming |
| `/api/healthz` | GET | Kiểm tra trạng thái hoạt động |
| `/api/update/version` | GET | Truy vấn phiên bản hiện tại |
| `/api/update/apply` | POST | Kích hoạt cập nhật nóng |

---

## Xác thực

Hỗ trợ 4 phương thức, chọn một trong bốn:

```bash
# 1. Bearer Token (khuyến nghị, tương thích tất cả client OpenAI)
curl https://your-app.replit.app/v1/models \
  -H "Authorization: Bearer YOUR_PROXY_API_KEY"

# 2. Header x-api-key (tương thích client OpenAI cũ)
curl https://your-app.replit.app/v1/models \
  -H "x-api-key: YOUR_PROXY_API_KEY"

# 3. Header x-goog-api-key (tương thích client Gemini SDK)
curl https://your-app.replit.app/v1/models \
  -H "x-goog-api-key: YOUR_PROXY_API_KEY"

# 4. URL query param ?key= (phù hợp debug đơn giản)
curl "https://your-app.replit.app/v1/models?key=YOUR_PROXY_API_KEY"
```

`YOUR_PROXY_API_KEY` là mật khẩu bạn tự chọn khi cấu hình, **không phải** API key của OpenAI hay bất kỳ nhà cung cấp AI nào.

---

## Định tuyến mô hình

Định tuyến hoàn toàn tự động dựa trên tên mô hình — không cần chuyển đổi thủ công.

| Tiền tố / đặc điểm tên mô hình | Định tuyến đến |
|--------------------------------|---------------|
| `gpt-*`, `o1`, `o3`, `o4-*`, `text-*` | OpenAI |
| `claude-*` | Anthropic |
| `gemini-*` | Google Gemini |
| Tên chứa `/` (ví dụ `provider/model`) | OpenRouter |

### Alias Extended Thinking

Thêm hậu tố vào tên mô hình bất kỳ có hỗ trợ chức năng suy nghĩ:

```
claude-opus-4-5-thinking            → Chế độ suy nghĩ, ẩn quá trình
claude-opus-4-5-thinking-visible    → Chế độ suy nghĩ, hiển thị quá trình
gemini-2.5-pro-thinking             → Gemini chế độ suy nghĩ
```

---

## Tool Calling

Cổng hỗ trợ đầy đủ định dạng OpenAI `tools` + `tool_calls`, tự động chuyển đổi sang định dạng native của từng backend:

| Backend | Quy tắc chuyển đổi |
|---------|-------------------|
| **Anthropic** | `tools` → `input_schema`; `tool_choice: "required"` → `{type:"any"}`; `tool_calls` → `tool_use` blocks |
| **Gemini** | `tools` → `functionDeclarations`; `tool_calls` → `functionCall` parts |
| **OpenAI / OpenRouter** | Truyền thẳng không thay đổi |

Streaming tool calls hỗ trợ đầy đủ `input_json_delta` chuyển tiếp từng chunk, `finish_reason` ánh xạ đúng thành `"tool_calls"`.

```jsonc
// Ví dụ request
{
  "model": "claude-opus-4-5",
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Lấy thông tin thời tiết hiện tại",
      "parameters": {
        "type": "object",
        "properties": { "city": { "type": "string" } },
        "required": ["city"]
      }
    }
  }],
  "messages": [{ "role": "user", "content": "Hôm nay Hà Nội thời tiết thế nào?" }]
}
```

---

## Extended Thinking

```jsonc
// Bật chế độ suy nghĩ (ẩn quá trình)
{ "model": "claude-opus-4-5-thinking", ... }

// Bật chế độ suy nghĩ (hiển thị quá trình)
{ "model": "claude-opus-4-5-thinking-visible", ... }

// Hoặc truyền trực tiếp trong request body
{
  "model": "claude-opus-4-5",
  "thinking": { "type": "enabled", "budget_tokens": 8000 }
}
```

---

## Kết nối client

### CherryStudio

1. Cài đặt → Nhà cung cấp mô hình → Thêm nhà cung cấp → Chọn loại **OpenAI Compatible**
2. Base URL: địa chỉ production của bạn; API Key: `PROXY_API_KEY`
3. Nhấn "Kiểm tra" — tất cả mô hình tự động tải về

### SillyTavern

1. Bật **Chế độ tương thích SillyTavern** ở tab Tổng quan trong giao diện quản trị
2. Loại API: **OpenAI**, Base URL: địa chỉ production của bạn
3. Tên mô hình: ví dụ `claude-opus-4-5`

### OpenWebUI / LobeChat / Bất kỳ client tương thích OpenAI

- Base URL: `https://your-app.replit.app`
- API Key: `YOUR_PROXY_API_KEY`
- Không cần thay đổi gì thêm

---

## Fleet Manager — Quản lý nhiều node

Quản lý nhiều instance GPT ShopVN - Free API Gateway từ tab **Thống kê** trong giao diện quản trị:

- **Kiểm tra phiên bản hàng loạt** — Truy vấn phiên bản hiện tại của tất cả node con trong một click
- **Cập nhật một click** — Đẩy file bundle mới nhất đến các node con mà không cần triển khai lại
- **Import/Export** — Sao lưu và khôi phục danh sách node ở định dạng JSON
- Dữ liệu node lưu trong localStorage của trình duyệt; URL upstream không bao giờ hiển thị trên UI

```
Node chính (This instance)          Node con (Sub-node)
      │                                     │
      ├── GET /api/update/version ─────────→ So sánh phiên bản
      │                                     │
      └── POST /api/update/apply ──────────→ Tải file bundle
                                             Giải nén & ghi đè
                                             Tự động khởi động lại
```

---

## Tự động cập nhật

### Cập nhật instance hiện tại

Nhấn vào huy hiệu phiên bản ở góc trên bên phải portal → **Sao chép lệnh** → Dán vào hộp chat Replit Agent. Agent sẽ tự động kéo code mới nhất từ GitHub và khởi động lại server.

### Cập nhật hàng loạt node con (Fleet Manager)

Thêm địa chỉ các node con vào Fleet Manager, sau đó nhấn **Cập nhật tất cả** để đẩy file bundle mới nhất đến tất cả node cùng một lúc.

---

## Nhật ký thay đổi

### v.1 — 2026-04-17
- Bản đầu tiên của GPT ShopVN - Free API Gateway
- Giao diện Tiếng Việt đầy đủ, hướng dẫn bắt đầu nhanh ở trang Tổng quan
- Hỗ trợ 4 phương thức auth: Bearer, x-api-key, x-goog-api-key, ?key=
- OpenAI-compatible `/v1/chat/completions` cho cả 4 provider (OpenAI, Anthropic, Gemini, OpenRouter)
- Anthropic native `/v1/messages` và Gemini native `/v1/models/:model:generateContent` (+ `/v1beta` alias, streaming)
- Danh sách Claude đã verify thực tế: 19 model có callback (7 base + 12 thinking variants)

---

## Giấy phép

MIT License — Tự do sử dụng, sửa đổi và phân phối.

Xem file [LICENSE](./LICENSE) để biết chi tiết.

---

<div align="center">
  <sub>Powered by Replit · OpenAI · Anthropic · Google Gemini · OpenRouter</sub><br/>
  <sub>Phát triển bởi GPT ShopVn</sub>
</div>
