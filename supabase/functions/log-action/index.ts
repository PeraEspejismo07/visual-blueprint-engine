// ============================================================
// CarboFile — Edge Function: log-action
// Recibe eventos de limpieza desde la extensión de navegador
// (pestañas cerradas, descargas eliminadas, caché limpiada) y
// los guarda asociados al usuario vinculado a ese device_id.
// ============================================================
import { serve } from "https://deno.land/std@0.203.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const VALID_SOURCES = ["drive", "gmail", "browser_tabs", "downloads"]
const VALID_ACTION_TYPES = ["deleted", "archived", "tab_closed"]

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const {
      device_id,
      source,
      action_type,
      file_name,
      size_bytes = 0,
      co2_grams_saved = 0,
    } = await req.json()

    if (!device_id || !source || !action_type) {
      return new Response(
        JSON.stringify({ error: "device_id, source y action_type son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    if (!VALID_SOURCES.includes(source) || !VALID_ACTION_TYPES.includes(action_type)) {
      return new Response(JSON.stringify({ error: "source o action_type inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: connection, error: connError } = await supabase
      .from("connections")
      .select("user_id")
      .eq("extension_device_id", device_id)
      .eq("status", "active")
      .single()

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "Dispositivo no vinculado a ningún usuario" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { error: insertError } = await supabase.from("cleanup_actions").insert({
      user_id: connection.user_id,
      source,
      action_type,
      file_name,
      size_bytes,
      co2_grams_saved,
    })
    if (insertError) throw insertError

    const gb = size_bytes / 1024 ** 3
    const co2Kg = co2_grams_saved / 1000

    const { error: metricError } = await supabase.rpc("upsert_daily_metric", {
      p_user_id: connection.user_id,
      p_gb: gb,
      p_co2: co2Kg,
    })
    if (metricError) throw metricError

    const { error: streakError } = await supabase.rpc("update_streak", {
      p_user_id: connection.user_id,
    })
    if (streakError) throw streakError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
