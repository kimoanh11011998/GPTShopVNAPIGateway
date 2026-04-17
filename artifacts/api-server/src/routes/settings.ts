import { Router, type IRouter, type Request, type Response } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Settings persistence
// ---------------------------------------------------------------------------

const SETTINGS_FILE = resolve(process.cwd(), "server_settings.json");

interface ServerSettings {
  sillyTavernMode: boolean;
  budgetUsd: number | null;
}

function loadSettings(): ServerSettings {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const raw = JSON.parse(readFileSync(SETTINGS_FILE, "utf8")) as Partial<ServerSettings>;
      return {
        sillyTavernMode: raw.sillyTavernMode ?? false,
        budgetUsd: typeof raw.budgetUsd === "number" ? raw.budgetUsd : null,
      };
    }
  } catch {}
  return { sillyTavernMode: false, budgetUsd: null };
}

function saveSettings(s: ServerSettings): void {
  try { writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2)); } catch {}
}

const settings: ServerSettings = loadSettings();

export function getSillyTavernMode(): boolean {
  return settings.sillyTavernMode;
}

// ---------------------------------------------------------------------------
// Auth helper — reuse same logic as proxy (Bearer or x-api-key)
// ---------------------------------------------------------------------------

function checkApiKey(req: Request, res: Response): boolean {
  const proxyKey = process.env.PROXY_API_KEY;
  if (!proxyKey) {
    res.status(500).json({ error: { message: "Server API key not configured", type: "server_error" } });
    return false;
  }
  const authHeader = req.headers["authorization"];
  const xApiKey = req.headers["x-api-key"];
  let provided: string | undefined;
  if (authHeader?.startsWith("Bearer ")) provided = authHeader.slice(7);
  else if (typeof xApiKey === "string") provided = xApiKey;

  if (!provided || provided !== proxyKey) {
    res.status(401).json({ error: { message: "Unauthorized", type: "invalid_request_error" } });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// GET /settings/sillytavern — 读取当前设置
// ---------------------------------------------------------------------------

router.get("/settings/sillytavern", (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  res.json({ enabled: settings.sillyTavernMode });
});

// ---------------------------------------------------------------------------
// POST /settings/sillytavern — 更新设置
// ---------------------------------------------------------------------------

router.post("/settings/sillytavern", (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  const { enabled } = req.body as { enabled?: boolean };
  if (typeof enabled !== "boolean") {
    res.status(400).json({ error: { message: "enabled 字段必须为 boolean", type: "invalid_request_error" } });
    return;
  }
  settings.sillyTavernMode = enabled;
  saveSettings(settings);
  res.json({ enabled: settings.sillyTavernMode });
});

// ---------------------------------------------------------------------------
// GET /settings/budget — đọc hạn mức USD hiện tại (null = không giới hạn)
// ---------------------------------------------------------------------------

router.get("/settings/budget", (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  res.json({ capUsd: settings.budgetUsd });
});

// ---------------------------------------------------------------------------
// POST /settings/budget — đặt hạn mức USD (gửi null hoặc 0 để bỏ giới hạn)
// ---------------------------------------------------------------------------

router.post("/settings/budget", (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  const { capUsd } = req.body as { capUsd?: number | null };
  if (capUsd !== null && (typeof capUsd !== "number" || !isFinite(capUsd) || capUsd < 0)) {
    res.status(400).json({ error: { message: "capUsd phải là số ≥ 0 hoặc null", type: "invalid_request_error" } });
    return;
  }
  settings.budgetUsd = capUsd === 0 ? null : capUsd;
  saveSettings(settings);
  res.json({ capUsd: settings.budgetUsd });
});

export default router;
