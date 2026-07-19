
# Carbofile B2C — Plan de construcción

## 1. Qué le falta hoy al lado B2C

Estado actual: landing + `/auth` (email+password) + `/dashboard` con datos hardcodeados. Tablas ya creadas en Cloud (`profiles`, `connections`, `daily_metrics`, `cleanup_actions`) pero **no se usan** desde la UI. No hay extensión. No hay onboarding. No hay pairing con la extensión. No hay Google OAuth.

Gaps críticos para un producto real:

**Autenticación y cuenta**
- Google Sign-In (hoy solo email/password). Es la fricción #1 en un producto que promete conectarse a Google Drive / Gmail.
- Página `/reset-password` + flujo "olvidé contraseña".
- Ruta `_authenticated/` real (hoy `/dashboard` es pública y hace redirect en cliente → flashea).
- Trigger `on_auth_user_created` para crear `profiles` automáticamente (la función `handle_new_user` existe pero no está enganchada).

**Onboarding B2C (primer minuto del usuario)**
- Wizard de 3 pasos: (1) instala la extensión, (2) conecta tu primer servicio (Drive/OneDrive/Dropbox/Gmail), (3) elige nivel de agresividad del agente (Conservador / Equilibrado / Agresivo).
- Estado "Aún no hay actividad" vs "Agente activo".

**Pairing extensión ↔ cuenta**
- Endpoint público `/api/public/pair` que canjea un `pairing_code` de 6 dígitos (ya hay columnas `pairing_code` + `expires_at` en `connections`).
- Server fn `generatePairingCode` que devuelve código + QR.
- Endpoint público `/api/public/ingest` con firma HMAC para que la extensión envíe eventos (`cleanup_actions` + `upsert_daily_metric`).

**Conexiones OAuth reales** (fase 2, se puede stub primero)
- Google Drive / Gmail vía App User Connectors (`connector_app_user`).
- OneDrive / Dropbox igual cuando el usuario lo pida.
- Por ahora: UI de "Conectar" que crea fila mock en `connections` para demo, marcada como `status='pending'`.

**Datos reales en el Dashboard**
- Reemplazar `seedEvents` y `stats` hardcodeados por queries a `cleanup_actions` + `daily_metrics` con TanStack Query + realtime de Supabase (canal `cleanup_actions:user_id=eq.X`).
- Racha (`streak_days`) visible + llamada a `update_streak` al abrir el dashboard.

**Configuración / Ajustes**
- `/dashboard/settings`: reglas del agente (tamaños, tipos de archivo, carpetas excluidas, ventana de reversión 7/30/90 días), notificaciones, cuenta, borrar cuenta.
- Nueva tabla `agent_rules` (user_id, aggressiveness, min_size_mb, excluded_paths[], undo_window_days).

**Papelera / Reversión**
- `/dashboard/trash`: lista de `cleanup_actions` con acción `eliminado` en los últimos N días, botón "Restaurar" que emite evento a la extensión.

**Facturación (fase 2)**
- Free hasta 5 GB liberados / mes, Pro ilimitado + multi-dispositivo. Stripe vía `payments--enable_stripe_payments`. No lo incluimos en esta primera iteración salvo que lo pidas.

**Legal / trust**
- `/privacy`, `/terms`, badge "Tus archivos nunca salen de tu equipo — el agente corre local en la extensión".

## 2. Rediseño del Dashboard — nivel unicornio

Referencias: Linear, Vercel, Arc, Raycast, Superhuman. Denso, tipográfico, dark-first, sin emojis, sin gradientes purpuras, sin cards infladas.

**Layout**
```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar (72px collapsed / 240px)                            │
│  · Logo Carbofile                                            │
│  · Overview                                                  │
│  · Actividad                                                 │
│  · Fuentes                                                   │
│  · Reglas del agente                                         │
│  · Papelera (reversible)                                     │
│  · Ajustes                                                   │
│  ─────                                                       │
│  · Estado extensión ● conectada · MacBook Pro                │
│  · Avatar + email                                            │
├──────────────────────────────────────────────────────────────┤
│  Topbar: breadcrumb · buscador ⌘K · racha 🜲 12 días · +Nuevo│
├──────────────────────────────────────────────────────────────┤
│  Contenido                                                   │
└──────────────────────────────────────────────────────────────┘
```

**Overview (home del dashboard)**
- Hero-métrica gigante tipográfica: `2,84 GB` liberados este mes, con delta vs mes anterior y micro-sparkline SVG.
- 4 KPIs secundarios en fila: Archivos gestionados · CO₂ evitado (kg) · Fuentes activas · Racha.
- **Gráfica principal**: área stacked de últimos 30 días (GB liberados por fuente) — Recharts, tema mono, sin leyenda pesada, tooltip minimal.
- **Live feed** a la derecha: eventos de `cleanup_actions` en tiempo real (Supabase Realtime), con animación de entrada tipo Linear (slide+fade 200ms), agrupados por hora.
- **Command palette ⌘K**: buscar archivos, ejecutar acciones ("conectar Drive", "pausar agente 1h", "vaciar papelera").
- **Panel de sugerencias del agente**: card con propuestas ("42 capturas duplicadas — 128 MB · Revisar / Aprobar / Ignorar"), estilo inbox.
- **Impacto ambiental**: bloque editorial abajo — "Has evitado el equivalente a X km en coche" con ilustración generativa Three.js miniatura (reutilizar shader del planeta a 128px).

**Micro-detalles unicornio**
- Tipografía: mantener la de la landing (serif display + sans body).
- Números tabular-nums, siempre.
- Skeleton loaders, no spinners.
- Toasts abajo-derecha estilo Vercel.
- Empty states ilustrados con una frase con carácter, no "No data".
- Atajos de teclado visibles (⌘K, G+O, G+A, ⌘.).
- Modo enfoque: `⌘.` oculta sidebar.
- Motion: framer-motion, easing `[0.22, 1, 0.36, 1]`, 180–240ms.

## 3. Extensión de navegador (MV3)

Estructura en `/extension/`:
- `manifest.json` MV3, permisos `downloads`, `storage`, `alarms`, `notifications`, host permissions para drive/dropbox/onedrive.
- `background.js` (service worker): escucha `chrome.downloads.onCreated`, aplica reglas locales, decide con heurística + llamada opcional a Lovable AI Gateway, envía evento firmado a `/api/public/ingest`.
- `popup.html` + `popup.js`: estado del agente, pausar, ver últimas 10 acciones, link al dashboard.
- `options.html`: pairing con código de 6 dígitos → guarda `device_id` + token.
- `content/drive.js`, `content/gmail.js`: inyectan botón "Limpiar con Carbofile" en la UI de esos servicios.
- Empaquetado con `nix run nixpkgs#zip` a `/public/carbofile-extension.zip`, botón de descarga en el dashboard con el patrón fetch+blob.

## 4. Orden de ejecución (esta iteración)

1. **Backend base**
   - Migración: trigger `on_auth_user_created`, tabla `agent_rules`, tabla `devices` (para pairing), RLS + GRANTs.
   - Server fns: `generatePairingCode`, `getOverviewStats`, `listRecentActions`, `listConnections`, `updateAgentRules`.
   - Server routes públicas: `POST /api/public/pair`, `POST /api/public/ingest` (HMAC).

2. **Auth**
   - Google OAuth (`configure_social_auth`), botón en `/auth`.
   - Layout `_authenticated/` gestionado por la integración.
   - `/reset-password`.

3. **Dashboard rediseño completo**
   - Sidebar + Topbar + ⌘K.
   - Rutas: `/dashboard` (overview), `/dashboard/activity`, `/dashboard/sources`, `/dashboard/rules`, `/dashboard/trash`, `/dashboard/settings`.
   - Recharts, framer-motion, Supabase Realtime, TanStack Query.
   - Onboarding wizard modal la primera vez.

4. **Extensión**
   - Carpeta `/extension/`, MV3, pairing, ingest firmado.
   - ZIP + botón descarga en `/dashboard/sources`.

5. **Pulido**
   - Empty states, skeletons, toasts, atajos, modo enfoque.
   - Meta tags SEO en cada ruta.

## 5. Detalles técnicos

- Stack ya fijado: TanStack Start + React 19 + Tailwind v4 + shadcn + Lovable Cloud (Supabase).
- Realtime: `supabase.channel('cleanup:'+userId).on('postgres_changes', ...)` en un hook `useLiveActions`.
- Todas las lecturas del dashboard vía `createServerFn` + `requireSupabaseAuth`, expuestas con `queryOptions` y `useSuspenseQuery`.
- HMAC del ingest: secreto `CARBOFILE_INGEST_SECRET` generado con `generate_secret`; la extensión lo recibe una sola vez al parear y lo guarda en `chrome.storage.local`.
- Google OAuth de la app: managed por Cloud (sin pedir credenciales). Los OAuth de Drive/Gmail para leer archivos van por **App User Connectors** en fase 2.

## 6. Fuera de alcance de esta iteración

- Facturación Stripe.
- Conectores OAuth reales a Drive/Gmail (se dejan como "Conectar (próximamente)" excepto Google Drive si me confirmas).
- App móvil.
- Panel admin B2B.

---

Si te parece bien, arranco por el bloque **1 (backend) + 2 (auth Google) + 3 (dashboard rediseñado)** en la primera tanda, y la extensión + pairing en la segunda. Dime si quieres cambiar prioridad o si algún módulo sobra/falta.
