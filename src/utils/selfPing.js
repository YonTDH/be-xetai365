function toBoolean(value, fallback = false) {
  if (typeof value === "undefined") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch (_error) {
    return "";
  }
}

function startSelfPing() {
  const enabled = toBoolean(process.env.SELF_PING_ENABLED, false);
  if (!enabled) {
    return null;
  }

  const targetUrl = normalizeUrl(process.env.SELF_PING_URL);
  if (!targetUrl) {
    console.warn("Self-ping is enabled but SELF_PING_URL is missing or invalid.");
    return null;
  }

  const intervalMs = toNumber(process.env.SELF_PING_INTERVAL_MS, 14 * 60 * 1000);
  const timeoutMs = toNumber(process.env.SELF_PING_TIMEOUT_MS, 10 * 1000);

  console.log(`Self-ping enabled: ${targetUrl} every ${intervalMs}ms`);

  const timer = setInterval(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "xetai365-self-ping",
          "X-Self-Ping": "true",
        },
        signal: controller.signal,
      });

      console.log(`Self-ping status: ${response.status}`);
    } catch (error) {
      console.warn(`Self-ping failed: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }, intervalMs);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  return timer;
}

module.exports = {
  startSelfPing,
};
