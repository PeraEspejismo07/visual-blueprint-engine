chrome.storage.local.get(["server", "ingestSecret"]).then((s) => {
  if (s.server) document.getElementById("server").value = s.server;
  if (s.ingestSecret) document.getElementById("ingestSecret").value = s.ingestSecret;
});

document.getElementById("pair").addEventListener("click", async () => {
  const server = document.getElementById("server").value.trim().replace(/\/$/, "");
  const secret = document.getElementById("secret").value.trim();
  const code = document.getElementById("code").value.trim();
  const msg = document.getElementById("msg");
  if (!server || !secret || !/^\d{6}$/.test(code)) {
    msg.textContent = "Rellena servidor, secreto y un código de 6 dígitos.";
    return;
  }
  msg.textContent = "Vinculando…";
  try {
    const res = await fetch(server + "/api/public/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userAgent: navigator.userAgent }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error");
    await chrome.storage.local.set({
      server,
      ingestSecret: secret,
      deviceToken: data.device_token,
      ingestUrl: data.ingest_url,
      dashboardUrl: server + "/dashboard",
      paused: false,
    });
    msg.textContent = "Vinculado. Ya puedes cerrar esta ventana.";
  } catch (e) {
    msg.textContent = "Error: " + e.message;
  }
});
