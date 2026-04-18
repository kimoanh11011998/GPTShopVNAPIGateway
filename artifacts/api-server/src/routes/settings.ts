import { Router, type IRouter, type Request, type Response } from "express";
import { readJson, writeJson } from "../lib/cloudPersist";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Settings persistence — backed by cloudPersist (GCS in prod, local in dev)
// ---------------------------------------------------------------------------

const SETTINGS_FILE = "server_settings.json";

interface ServerSettings {
  sillyTavernMode: boolean;
  budgetUsd: number | null;
}

const DEFAULT_SETTINGS: ServerSettings = { sillyTavernMode: false, budgetUsd: null };

// In-memory cache — loaded once at startup, written through on every change
let settings: ServerSettings = { ...DEFAULT_SETTINGS };
let settingsLoaded = false;

async function ensureLoaded(): Promise<void> {
  if (settingsLoaded) return;
  try {
    const saved = await readJson<Partial<ServerSettings>>(SETTINGS_FILE);
    if (saved) {
      settings = {
        sillyTavernMode: saved.sillyTavernMode ?? false,
        budgetUsd: typeof saved.budgetUsd === "number" ? saved.budgetUsd : null,
      };
    }
  } catch {}
  settingsLoaded = true;
}

async function persistSettings(): Promise<void> {
  writeJson(SETTINGS_FILE, settings).catch((err) => {
    console.error("[settings] failed to persist:", err);
  });
}

// Bootstrap load — best-effort, non-blocking
ensureLoaded().catch(() => {});

export function getSillyTavernMode(): boolean {
  return settings.sillyTavernMode;
}

// ---------------------------------------------------------------------------
// Auth helper — Bearer token or x-api-key
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
// GET /settings/sillytavern
// ---------------------------------------------------------------------------

router.get("/settings/sillytavern", async (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  await ensureLoaded();
  res.json({ enabled: settings.sillyTavernMode });
});

// ---------------------------------------------------------------------------
// POST /settings/sillytavern
// ---------------------------------------------------------------------------

router.post("/settings/sillytavern", async (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  const { enabled } = req.body as { enabled?: boolean };
  if (typeof enabled !== "boolean") {
    res.status(400).json({ error: { message: "enabled phải là boolean", type: "invalid_request_error" } });
    return;
  }
  await ensureLoaded();
  settings.sillyTavernMode = enabled;
  await persistSettings();
  res.json({ enabled: settings.sillyTavernMode });
});

// ---------------------------------------------------------------------------
// GET /settings/budget
// ---------------------------------------------------------------------------

router.get("/settings/budget", async (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  await ensureLoaded();
  res.json({ capUsd: settings.budgetUsd });
});

// ---------------------------------------------------------------------------
// POST /settings/budget
// ---------------------------------------------------------------------------

router.post("/settings/budget", async (req: Request, res: Response) => {
  if (!checkApiKey(req, res)) return;
  const { capUsd } = req.body as { capUsd?: number | null };
  if (capUsd !== null && (typeof capUsd !== "number" || !isFinite(capUsd) || capUsd < 0)) {
    res.status(400).json({ error: { message: "capUsd phải là số ≥ 0 hoặc null", type: "invalid_request_error" } });
    return;
  }
  await ensureLoaded();
  settings.budgetUsd = capUsd === 0 ? null : (capUsd ?? null);
  await persistSettings();
  res.json({ capUsd: settings.budgetUsd });
});

export default router;
