# GPT ShopVN — Free API Gateway

> **Cổng proxy AI tự lưu trữ trên Replit · Self-hosted AI Proxy Gateway**
>
> Một endpoint thống nhất cho OpenAI, Anthropic Claude, Google Gemini và OpenRouter.
> Không cần tự nhập API key của bất kỳ nhà cung cấp nào.

[![Version](https://img.shields.io/badge/version-1.0-6366f1?style=flat-square)](./version.json)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](./LICENSE)
[![Demo](https://img.shields.io/badge/Demo-Trực%20tuyến-10b981?style=flat-square)](https://replit-2-api-kimoanh11011998.replit.app)
[![GitHub](https://img.shields.io/badge/GitHub-GPTShopVN-24292e?style=flat-square&logo=github)](https://github.com/kimoanh11011998/GPTShopVnAPIGateway)

---

## Triển khai trong 3 bước

### Bước 1 — Import vào Replit

Trong Replit, tạo Repl mới → chọn **"Import from GitHub"** → dán link sau:

```
https://github.com/kimoanh11011998/GPTShopVnAPIGateway
```

Hoặc mở hộp chat **Replit Agent** và dán đúng đoạn sau:

---

**AGENT SETUP PROMPT — copy toàn bộ đoạn dưới và dán vào Replit Agent:**

```
Hãy triển khai dự án AI Gateway từ GitHub này: https://github.com/kimoanh11011998/GPTShopVnAPIGateway

Làm theo đúng thứ tự sau:

1. Import source code từ GitHub về dự án hiện tại (clone hoặc import).

2. Cài đặt tất cả dependencies bằng lệnh: pnpm install

3. Tạo Secret (biến môi trường) tên là PROXY_API_KEY với một chuỗi ngẫu nhiên mạnh (ít nhất 20 ký tự, gồm chữ và số). Ghi lại giá trị này cho tôi sau khi tạo xong.

4. Kích hoạt các Replit AI Integrations sau (vào mục Integrations trong sidebar):
   - OpenAI
   - Anthropic
   - Google Gemini
   - OpenRouter

5. Khởi động server bằng lệnh: pnpm run dev

6. Sau khi server chạy thành công, báo lại:
   - Giá trị PROXY_API_KEY đã tạo
   - URL preview đang dùng (dạng https://xxxxx.repl.co)

Lưu ý: Không cần nhập API key của OpenAI, Anthropic, Gemini hay OpenRouter — tất cả được cấp tự động qua Replit AI Integrations.
```

---

### Bước 2 — Cấu hình qua giao diện Portal

Sau khi Agent báo server đã chạy:

1. Mở tab preview (cửa sổ bên phải trong Replit).
2. Trong portal, nhấn **"Trợ lý cấu hình"** ở góc trên bên phải.
3. Làm theo các bước hướng dẫn hiện ra — hoặc sao chép lệnh và dán tiếp vào Agent để tự động hoàn tất.
4. Nhập `PROXY_API_KEY` vào ô **API Key** ở trang Tổng quan để mở khóa đầy đủ tính năng.

### Bước 3 — Publish để lấy URL cố định

1. Nhấn **Deploy → Publish** trong Replit.
2. Chờ 1–3 phút để hoàn tất.
3. Bạn nhận được địa chỉ cố định dạng:

```
https://[tên-dự-án].replit.app
```

4. Endpoint đầy đủ để dùng với mọi client:

```
https://[tên-dự-án].replit.app/v1
```

> Sau khi Publish, cập nhật Base URL trong portal sang địa chỉ production này.

---

## Giới thiệu

**GPT ShopVN — Free API Gateway** là cổng proxy AI tự lưu trữ chạy trên Replit. Nó thống nhất OpenAI, Anthropic Claude, Google Gemini và OpenRouter thành **một điểm truy cập duy nhất tương thích chuẩn OpenAI**, cho phép bất kỳ client nào (CherryStudio, SillyTavern, OpenWebUI, LibreChat…) dùng tất cả mô hình mà không cần thay đổi cấu hình.

**Không cần tự cung cấp API key** của bất kỳ nhà cung cấp nào. Gateway hoạt động thông qua **Replit AI Integrations** — tín dụng AI tích hợp sẵn của nền tảng, được cấp tự động cho mỗi tài khoản Replit có gói hàng tháng.

---

## Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| Định tuyến đa backend | Tự động định tuyến theo tên mô hình đến OpenAI, Anthropic, Gemini hoặc OpenRouter |
| Chuyển đổi định dạng | Request/response tự động chuyển đổi giữa OpenAI ↔ Claude ↔ Gemini |
| Tool Calling | Hỗ trợ đầy đủ OpenAI `tools` + `tool_calls`, tự động chuyển đổi cho từng backend |
| Extended Thinking | Hậu tố `-thinking` / `-thinking-visible` để bật chế độ suy nghĩ sâu |
| Streaming SSE | Tất cả endpoint đều hỗ trợ SSE streaming |
| Đa phương thức xác thực | Bearer Token / x-api-key / x-goog-api-key / URL query param `?key=` |
| Tương thích SillyTavern | Tự động sửa thứ tự role Claude, thêm user message trống |
| Giao diện quản trị | Web UI 5 tab: Tổng quan / Thống kê / Mô hình / Endpoint / Nhật ký |
| Fleet Manager | Quản lý hàng loạt node con: kiểm tra phiên bản và cập nhật một click |
| Hạn mức ngân sách | Đặt giới hạn chi phí USD, cảnh báo theo ngưỡng 70% / 90% / 100% |
| Cập nhật nóng | Đẩy cập nhật qua file bundle, không cần triển khai lại |

---

## API Endpoints

Tất cả endpoint đều yêu cầu xác thực.

| Endpoint | Phương thức | Mô tả |
|----------|-------------|-------|
| `/v1/chat/completions` | POST | OpenAI Chat Completions — endpoint chính |
| `/v1/models` | GET | Danh sách tất cả mô hình khả dụng |
| `/v1/messages` | POST | Anthropic Claude Messages định dạng native |
| `/v1/models/{model}:generateContent` | POST | Gemini native — non-streaming |
| `/v1/models/{model}:streamGenerateContent` | POST | Gemini native — SSE streaming |
| `/v1beta/models/{model}:generateContent` | POST | Alias Gemini native — non-streaming |
| `/v1beta/models/{model}:streamGenerateContent` | POST | Alias Gemini native — SSE streaming |
| `/api/healthz` | GET | Kiểm tra trạng thái hoạt động |
| `/api/update/version` | GET | Truy vấn phiên bản hiện tại |
| `/api/update/apply` | POST | Kích hoạt cập nhật nóng |

---

## Xác thực

Hỗ trợ 4 phương thức, chọn một:

```bash
# 1. Bearer Token (khuyến nghị — tương thích tất cả client OpenAI)
curl https://your-app.replit.app/v1/models \
  -H "Authorization: Bearer YOUR_PROXY_API_KEY"

# 2. Header x-api-key (tương thích client OpenAI cũ)
curl https://your-app.replit.app/v1/models \
  -H "x-api-key: YOUR_PROXY_API_KEY"

# 3. Header x-goog-api-key (tương thích Gemini SDK)
curl https://your-app.replit.app/v1/models \
  -H "x-goog-api-key: YOUR_PROXY_API_KEY"

# 4. URL query param ?key= (phù hợp debug nhanh)
curl "https://your-app.replit.app/v1/models?key=YOUR_PROXY_API_KEY"
```

`YOUR_PROXY_API_KEY` là mật khẩu bạn tự chọn khi cấu hình, **không phải** API key của OpenAI hay bất kỳ nhà cung cấp AI nào.

---

## Kiểm tra nhanh sau khi deploy

```bash
curl https://your-app.replit.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Xin chào!"}]
  }'
```

Nhận được JSON response với `choices[0].message.content` → gateway đang hoạt động.

---

## Định tuyến mô hình

Định tuyến tự động hoàn toàn dựa trên tên mô hình — không cần cấu hình thêm.

| Tiền tố / đặc điểm tên mô hình | Định tuyến đến |
|--------------------------------|----------------|
| `gpt-*`, `o1`, `o3`, `o4-*`, `text-*` | OpenAI |
| `claude-*` | Anthropic |
| `gemini-*` | Google Gemini |
| Tên chứa `/` (ví dụ `provider/model`) | OpenRouter |

### Extended Thinking

Thêm hậu tố vào tên mô hình bất kỳ hỗ trợ chức năng suy nghĩ sâu:

```
claude-opus-4-5-thinking              → Chế độ suy nghĩ, ẩn quá trình
claude-opus-4-5-thinking-visible      → Chế độ suy nghĩ, hiển thị quá trình
gemini-2.5-pro-thinking               → Gemini chế độ suy nghĩ
```

---

## Tool Calling

Hỗ trợ đầy đủ OpenAI `tools` + `tool_calls`, tự động chuyển đổi sang định dạng native từng backend:

| Backend | Quy tắc chuyển đổi |
|---------|-------------------|
| Anthropic | `tools` → `input_schema`; `tool_choice: "required"` → `{type:"any"}`; `tool_calls` → `tool_use` blocks |
| Gemini | `tools` → `functionDeclarations`; `tool_calls` → `functionCall` parts |
| OpenAI / OpenRouter | Truyền thẳng không thay đổi |

Streaming tool calls hỗ trợ đầy đủ `input_json_delta` chuyển tiếp từng chunk, `finish_reason` ánh xạ đúng thành `"tool_calls"`.

---

## Kết nối client

### CherryStudio

1. Cài đặt → Nhà cung cấp mô hình → Thêm nhà cung cấp → Chọn **OpenAI Compatible**
2. Base URL: địa chỉ production của bạn
3. API Key: `PROXY_API_KEY` của bạn
4. Nhấn "Kiểm tra" — tất cả mô hình tự động tải về

### SillyTavern

1. Vào tab **Tổng quan** trong portal → bật **Chế độ tương thích SillyTavern**
2. Trong SillyTavern: Loại API = **OpenAI**, Base URL = địa chỉ production
3. API Key: `PROXY_API_KEY` của bạn

### OpenWebUI / LibreChat / LobeChat

- Base URL: `https://your-app.replit.app`
- API Key: `PROXY_API_KEY` của bạn
- Không cần thay đổi gì thêm

### Python / Node.js SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-app.replit.app/v1",
    api_key="YOUR_PROXY_API_KEY"
)

response = client.chat.completions.create(
    model="claude-opus-4-5",
    messages=[{"role": "user", "content": "Xin chào!"}]
)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://your-app.replit.app/v1",
  apiKey: "YOUR_PROXY_API_KEY",
});

const response = await client.chat.completions.create({
  model: "gemini-2.5-pro",
  messages: [{ role: "user", content: "Xin chào!" }],
});
```

---

## Fleet Manager — Quản lý nhiều node

Quản lý nhiều instance GPT ShopVN từ tab **Thống kê** → **Quản lý phiên bản cụm Node**:

- **Kiểm tra phiên bản hàng loạt** — Truy vấn tất cả node con trong một click
- **Cập nhật một click** — Đẩy bản mới nhất đến các node con mà không cần triển khai lại
- Dữ liệu node lưu trong localStorage của trình duyệt

```
Node chính (This instance)          Node con (Sub-node)
      │                                     │
      ├── GET /api/update/version ─────────→ So sánh phiên bản
      │                                     │
      └── POST /api/update/apply ──────────→ Tải bundle mới
                                             Giải nén & ghi đè
                                             Tự động khởi động lại
```

### Thêm node vĩnh viễn qua biến môi trường

Để node tồn tại sau khi Publish, thêm Secret vào Replit với tên:

```
FRIEND_PROXY_URL        → node thứ 1
FRIEND_PROXY_URL_2      → node thứ 2
FRIEND_PROXY_URL_3      → node thứ 3
...
FRIEND_PROXY_URL_20     → node thứ 20
```

Giá trị là địa chỉ gốc của node con sau khi Publish, ví dụ: `https://my-node.replit.app`

---

## Cập nhật dự án

### Cập nhật instance hiện tại

Nhấn vào huy hiệu phiên bản ở góc dưới sidebar trong portal → sao chép lệnh → dán vào Replit Agent. Agent sẽ tự kéo code mới nhất từ GitHub và khởi động lại server.

### Cập nhật hàng loạt node con

Thêm địa chỉ các node con vào Fleet Manager → nhấn **Cập nhật tất cả**.

---

## Xử lý sự cố

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Lỗi 401 Unauthorized | API key sai hoặc thiếu | Kiểm tra lại `PROXY_API_KEY` trong Secrets |
| Tab Mô hình trống | Integration chưa bật | Bật lại các Replit AI Integrations |
| URL preview không ổn định | Chưa Publish | Deploy lên production |
| Lỗi 429 Too Many Requests | Vượt rate limit | Chờ vài phút hoặc nâng gói Replit |
| Model không tồn tại | Sai tên model | Kiểm tra danh sách trong tab Mô hình |
| Node con không kết nối | Sai URL hoặc key | Kiểm tra URL gốc và `PROXY_API_KEY` của node con |

---

## Nhật ký thay đổi

### v1.0 — 2026-04-17

- Bản phát hành đầu tiên
- Giao diện Tiếng Việt đầy đủ, portal quản trị 5 tab
- Hỗ trợ 4 nhà cung cấp AI qua Replit AI Integrations
- OpenAI-compatible endpoint cho cả 4 provider
- Anthropic native và Gemini native endpoint
- Tool Calling, Extended Thinking, Streaming SSE
- Fleet Manager quản lý hàng loạt node con
- Hạn mức ngân sách với cảnh báo theo ngưỡng
- Cập nhật nóng không cần triển khai lại

---

## Giấy phép

MIT License — Tự do sử dụng, sửa đổi và phân phối.

Xem file [LICENSE](./LICENSE) để biết chi tiết.

---

<div align="center">
  <sub>GPTShopVN · OpenAI · Anthropic · Google Gemini · OpenRouter</sub><br/>
  <sub>Không để chi phí cao thành rào cản sử dụng AI cho người Việt.</sub>
</div>
