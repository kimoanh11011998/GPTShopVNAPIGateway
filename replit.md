# GPT ShopVN - Free API Gateway — v.1

## Tổng quan

Self-hosted AI Proxy Gateway chạy trên Replit. Thống nhất OpenAI, Anthropic Claude, Google Gemini và OpenRouter thành một điểm truy cập tương thích OpenAI duy nhất.

## Cấu trúc Workspace

```
artifacts/
  api-portal/     — Giao diện quản trị (React + Vite, port 24927)
  api-server/     — API Gateway backend (Express 5, port 8080)
  mockup-sandbox/ — Canvas design tool (Replit internal, không deploy)

lib/
  api-zod/        — Zod schema dùng bởi api-server (HealthCheckResponse)

scripts/
  post-merge.sh   — Script chạy sau khi merge task agent

README.md         — Tài liệu dự án (Tiếng Việt)
LICENSE           — MIT License
version.json      — Phiên bản hiện tại (dùng bởi auto-update)
```

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **API framework**: Express 5
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4
- **Build**: esbuild (bundle api-server thành single file)
- **Validation**: Zod

## API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/v1/chat/completions` | POST | Chat Completions — OpenAI format (endpoint chính) |
| `/v1/messages` | POST | Claude Messages API — native format |
| `/v1/models` | GET | Danh sách model khả dụng |
| `/v1/stats` | GET | Thống kê sử dụng theo node + model |
| `/v1/admin/backends` | GET/POST/DELETE | Quản lý node con động |
| `/v1/admin/logs` | GET | Nhật ký request gần nhất |
| `/api/healthz` | GET | Health check |
| `/api/update/version` | GET | Kiểm tra phiên bản |
| `/api/update/apply` | POST | Kích hoạt cập nhật nóng |
| `/api/settings/*` | GET/POST | Cài đặt server (routing, SillyTavern mode) |

## Định tuyến Model

| Tên model | Backend |
|-----------|---------|
| `gpt-*`, `o1`, `o3`, `o4-*` | OpenAI |
| `claude-*` | Anthropic |
| `gemini-*` | Google Gemini |
| Tên chứa `/` | OpenRouter |
| Hậu tố `-thinking` / `-thinking-visible` | Extended Thinking mode |

## Xác thực

Tất cả endpoint public đều chấp nhận 4 phương thức (áp dụng cho mọi route kể cả Gemini native):

- `Authorization: Bearer <PROXY_API_KEY>` (khuyến nghị, tương thích tất cả client OpenAI)
- `x-api-key: <PROXY_API_KEY>` (tương thích client OpenAI cũ)
- `x-goog-api-key: <PROXY_API_KEY>` (tương thích Gemini SDK)
- `?key=<PROXY_API_KEY>` (URL query param, phù hợp debug)

## Biến môi trường

| Biến | Mô tả |
|------|-------|
| `PROXY_API_KEY` | Bắt buộc — mật khẩu truy cập proxy |
| `AI_INTEGRATIONS_OPENAI_API_KEY` / `BASE_URL` | Tự động inject bởi Replit AI Integrations |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` / `BASE_URL` | Tự động inject bởi Replit AI Integrations |
| `AI_INTEGRATIONS_GEMINI_API_KEY` / `BASE_URL` | Tự động inject bởi Replit AI Integrations |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` / `BASE_URL` | Tự động inject bởi Replit AI Integrations |
| `FRIEND_PROXY_URL` ... `FRIEND_PROXY_URL_20` | Node con tĩnh (ENV-based, vĩnh viễn) |
| `UPDATE_CHECK_URL` | URL `version.json` để kiểm tra cập nhật |

## File dữ liệu runtime (không commit)

- `usage_stats.json` — Thống kê sử dụng (auto-save)
- `server_settings.json` — Cài đặt server (routing, SillyTavern)
- `dynamic_backends.json` — Node con động

## Workflows

- **Start application** — Khởi động cả api-portal + api-server (chính)
- **artifacts/api-portal: web** — Chỉ portal (dev độc lập)
- **artifacts/api-server: API Server** — Chỉ server (dev độc lập, bị conflict port nếu Start application đang chạy)
- **artifacts/mockup-sandbox** — Canvas design tool (Replit internal)

## Lệnh thường dùng

```bash
pnpm install                                    # Cài đặt dependencies
pnpm --filter @workspace/api-server run build   # Build api-server
pnpm --filter @workspace/api-server run dev     # Dev api-server
pnpm --filter @workspace/api-portal run dev     # Dev portal
```

## Phiên bản

**v.1** — Bản đầu tiên của GPT ShopVN: giao diện Tiếng Việt, danh sách Claude đã verify (19 model có callback thật), 4 phương thức auth, OpenAI/Anthropic/Gemini native endpoints.
