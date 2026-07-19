// Carbofile — background service worker
// Watches downloads, applies local rules, and forwards events (HMAC-signed) to Carbofile.

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const REDUNDANT_PATTERNS = [
  /\(\d+\)\.(dmg|exe|zip|pkg|msi)$/i,
  /-final(-v?\d+)?\./i,
  /duplicate/i,
  /copy( \d+)?\./i,
  /screenshot.*\.(png|jpg|jpeg)$/i,
];

function classify(filename, bytes) {
  const name = (filename || "").split(/[\\/]/).pop() || "";
  if (REDUNDANT_PATTERNS.some((r) => r.test(name))) return "eliminado";
  if (bytes > 500 * 1024 * 1024) return "sugerido";
  return "sugerido";
}

async function sendEvent(evt) {
  const { deviceToken, ingestSecret, ingestUrl, paused } = await chrome.storage.local.get([
    "deviceToken",
    "ingestSecret",
    "ingestUrl",
    "paused",
  ]);
  if (paused) return;
  if (!deviceToken || !ingestSecret || !ingestUrl) return;
  const body = JSON.stringify({ events: [evt] });
  const sig = await hmacHex(ingestSecret, deviceToken + "." + body);
  try {
    await fetch(ingestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Device-Token": deviceToken, "X-Signature": sig },
      body,
    });
  } catch (e) {
    console.warn("Carbofile ingest failed", e);
  }
}

chrome.downloads.onCreated.addListener(async (item) => {
  const action = classify(item.filename, item.fileSize || item.totalBytes || 0);
  await sendEvent({
    source: "Descargas",
    action_type: action,
    file_name: (item.filename || "").split(/[\\/]/).pop() || item.url,
    size_bytes: item.fileSize || item.totalBytes || 0,
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg?.type === "carbofile:paired") {
    chrome.storage.local.set(msg.data).then(() => respond({ ok: true }));
    return true;
  }
  if (msg?.type === "carbofile:pause") {
    chrome.storage.local.set({ paused: !!msg.value }).then(() => respond({ ok: true }));
    return true;
  }
});
