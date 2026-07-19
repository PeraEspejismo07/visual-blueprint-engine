chrome.storage.local.get(["deviceToken", "paused", "dashboardUrl"]).then((s) => {
  const status = document.getElementById("status");
  status.innerHTML = s.deviceToken
    ? (s.paused ? '<span class="dot" style="background:#8b8b84"></span> En pausa' : '<span class="dot"></span> Agente activo')
    : '<span class="dot" style="background:#c6b4e6"></span> Sin vincular';
});
document.getElementById("pause").addEventListener("click", async () => {
  const { paused } = await chrome.storage.local.get("paused");
  await chrome.runtime.sendMessage({ type: "carbofile:pause", value: !paused });
  window.close();
});
document.getElementById("opts").addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
document.getElementById("dash").addEventListener("click", async (e) => {
  e.preventDefault();
  const { dashboardUrl } = await chrome.storage.local.get("dashboardUrl");
  chrome.tabs.create({ url: dashboardUrl || "https://carbofile.app/dashboard" });
});
