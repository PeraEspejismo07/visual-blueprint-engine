import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/pair")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { code?: string; userAgent?: string };
          const code = String(body.code ?? "").trim();
          if (!/^\d{6}$/.test(code)) {
            return Response.json({ error: "invalid_code" }, { status: 400, headers: cors });
          }
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.rpc("redeem_pairing_code", {
            p_code: code,
            p_user_agent: String(body.userAgent ?? "").slice(0, 300),
          });
          if (error) return Response.json({ error: error.message }, { status: 400, headers: cors });
          const row = Array.isArray(data) ? data[0] : data;
          return Response.json(
            {
              device_token: row.device_token,
              ingest_url: new URL("/api/public/ingest", request.url).toString(),
            },
            { headers: cors },
          );
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500, headers: cors });
        }
      },
    },
  },
});
