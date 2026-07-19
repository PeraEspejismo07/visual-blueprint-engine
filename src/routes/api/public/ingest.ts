import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Signature, X-Device-Token",
};

export const Route = createFileRoute("/api/public/ingest")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const secret = process.env.CARBOFILE_INGEST_SECRET;
          if (!secret) return new Response("misconfigured", { status: 500, headers: cors });

          const deviceToken = request.headers.get("x-device-token") ?? "";
          const signature = request.headers.get("x-signature") ?? "";
          const raw = await request.text();

          const expected = createHmac("sha256", secret).update(deviceToken + "." + raw).digest("hex");
          const a = Buffer.from(signature);
          const b = Buffer.from(expected);
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return Response.json({ error: "bad_signature" }, { status: 401, headers: cors });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: device, error: devErr } = await supabaseAdmin
            .from("devices")
            .select("id, user_id")
            .eq("device_token", deviceToken)
            .maybeSingle();
          const userId = device?.user_id;
          if (devErr || !userId) {
            return Response.json({ error: "unknown_device" }, { status: 401, headers: cors });
          }

          const payload = JSON.parse(raw) as {
            events: Array<{
              source: string;
              action_type: "eliminado" | "archivado" | "sugerido";
              file_name?: string;
              size_bytes?: number;
            }>;
          };
          if (!Array.isArray(payload.events) || payload.events.length === 0) {
            return Response.json({ ok: true, inserted: 0 }, { headers: cors });
          }

          const rows = payload.events.slice(0, 200).map((e) => {
            const bytes = Math.max(0, Number(e.size_bytes ?? 0));
            return {
              user_id: userId,
              source: String(e.source).slice(0, 64),
              action_type: e.action_type,
              file_name: e.file_name ? String(e.file_name).slice(0, 500) : null,
              size_bytes: bytes,
              co2_grams_saved: Math.round((bytes / 1_000_000_000) * 4400),
            };
          });

          const { error: insErr } = await supabaseAdmin.from("cleanup_actions").insert(rows);
          if (insErr) return Response.json({ error: insErr.message }, { status: 500, headers: cors });

          const totalGb = rows.reduce((s, r) => s + r.size_bytes / 1_000_000_000, 0);
          const totalCo2 = rows.reduce((s, r) => s + r.co2_grams_saved / 1000, 0);
          await supabaseAdmin.rpc("upsert_daily_metric", {
            p_user_id: userId,
            p_gb: totalGb,
            p_co2: totalCo2,
          });

          await supabaseAdmin.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("id", device.id);

          return Response.json({ ok: true, inserted: rows.length }, { headers: cors });
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500, headers: cors });
        }
      },
    },
  },
});
