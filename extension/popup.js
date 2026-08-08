const fmt = (b) => {
  if (!b) return "0 MB";
  const mb = b / (1024 * 1024);
  return mb >= 1024 ? (mb / 1024).toFixed(2) + " GB" : mb.toFixed(1) + " MB";
};

const state = { tab: "files", recent: [], paused: false, token: null, email: null };

function row(icon, name, tag, sub, amount, amountSub) {
  return `<div class="item">
    <div class="badge">${icon}</div>
    <div class="meta">
      <div class="name">${name}${tag ? `<span class="tag">${tag}</span>` : ""}</div>
      <div class="sub">${sub}</div>
    </div>
    <div class="amt">${amount}<small>${amountSub || ""}</small></div>
  </div>`;
}

function render() {
  const list = document.getElementById("list");
  document.querySelectorAll("[data-tab]").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === state.tab),
  );

  if (state.tab === "files") {
    if (!state.token) {
      list.innerHTML = `<div class="item" style="flex-direction:column;align-items:stretch;gap:8px;padding:16px">
        <div class="name">Vincula este equipo</div>
        <div class="sub">Genera un código de 6 dígitos en tu panel de Carbofile y vincula el navegador para sincronizar tu impacto.</div>
        <button id="pair-cta" style="margin-top:6px;background:var(--moss);color:#0e110f;border:0;border-radius:999px;padding:9px 14px;font-weight:600;cursor:pointer">Vincular ahora</button>
      </div>` + (state.recent.length ? "" : `<div class="empty">Mientras tanto, Carbofile ya analiza tus descargas en local.</div>`);
      const cta = document.getElementById("pair-cta");
      if (cta) cta.addEventListener("click", () => chrome.runtime.openOptionsPage());
      if (!state.recent.length) return;
    }
    list.innerHTML += state.recent.length
      ? state.recent
          .map((f) =>
            row(
              f.action_type === "eliminado" ? "🗑" : "✨",
              f.file_name,
              f.action_type === "eliminado" ? "Eliminado" : "Sugerido",
              new Date(f.at || Date.now()).toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
              fmt(f.size_bytes),
            ),
          )
          .join("")
      : `<div class="empty">Todavía no hay actividad.<br />Descarga un archivo y Carbofile lo analizará.</div>`;
    return;
  }


  if (state.tab === "sources") {
    list.innerHTML = [
      row("⤓", "Descargas del navegador", state.token ? "Activo" : "Inactivo", "Análisis local en tiempo real", state.recent.length + "", "eventos"),
      row("☁", "Google Drive", "Pro", "Conecta desde el panel web", "—", ""),
      row("✉", "Gmail adjuntos", "Pro", "Conecta desde el panel web", "—", ""),
      row("☁", "OneDrive / Dropbox", "Pro", "Conecta desde el panel web", "—", ""),
    ].join("");
    return;
  }

  const bytes = state.recent.reduce((a, f) => a + (f.size_bytes || 0), 0);
  const co2 = ((bytes / (1024 * 1024 * 1024)) * 0.06).toFixed(3);
  list.innerHTML = [
    row("💾", "Espacio liberado", "", "Desde la instalación", fmt(bytes), ""),
    row("🌍", "CO₂ evitado", "", "Estimación por GB/año", co2 + " kg", ""),
    row("🧹", "Limpiezas", "", "Acciones del agente", String(state.recent.length), ""),
  ].join("");
}

async function boot() {
  const s = await chrome.storage.local.get(["deviceToken", "paused", "recent", "dashboardUrl", "email"]);
  state.token = s.deviceToken || null;
  state.paused = !!s.paused;
  state.recent = (s.recent || []).slice(0, 20);
  document.getElementById("mail").textContent = s.email || (s.deviceToken ? "Equipo vinculado" : "Sin vincular");
  document.getElementById("state").textContent = !s.deviceToken ? "Sin vincular" : s.paused ? "En pausa" : "Activo";
  render();
}

document.querySelectorAll("[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    state.tab = b.dataset.tab;
    render();
  }),
);

document.getElementById("banner-close").addEventListener("click", () => {
  document.getElementById("banner").remove();
});
document.getElementById("close").addEventListener("click", () => window.close());
document.getElementById("opts").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("pause").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "carbofile:pause", value: !state.paused });
  boot();
});
const openDash = async () => {
  const { dashboardUrl } = await chrome.storage.local.get("dashboardUrl");
  chrome.tabs.create({ url: dashboardUrl || "https://carbofile.app/dashboard" });
};
document.getElementById("dash").addEventListener("click", openDash);
document.getElementById("nav-dash").addEventListener("click", openDash);

boot();
