// ============================================================
// CarboFile — Edge Function: link-extension
// Dos acciones según el body recibido:
//  1) { action: "generate", user_id }  -> crea un código de 6 dígitos
//     que el usuario pega en el popup de la extensión.
//  2) { action: "redeem", pairing_code, device_id } -> la extensión
//     canjea el código y queda vinculada a ese user_id.
// ============================================================
import { serve } from "https://deno.land/std@0.203.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {
    const body = await req.json()

    // ---------- 1) Generar código (llamado desde el dashboard web) ----------
    if (body.action === "generate") {
      const { user_id } = body
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id es requerido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const code = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

      const { error } = await supabase.from("connections").upsert(
        {
          user_id,
          provider: "browser_extension",
          pairing_code: code,
          pairing_code_expires_at: expiresAt.toISOString(),
          status: "active",
        },
        { onConflict: "user_id,provider" }
      )

      if (error) throw error

      return new Response(JSON.stringify({ pairing_code: code, expires_at: expiresAt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // ---------- 2) Canjear código (llamado desde la extensión) ----------
    if (body.action === "redeem") {
      const { pairing_code, device_id } = body
      if (!pairing_code || !device_id) {
        return new Response(JSON.stringify({ error: "pairing_code y device_id son requeridos" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { data: connection, error: findError } = await supabase
        .from("connections")
        .select("id, user_id, pairing_code_expires_at")
        .eq("provider", "browser_extension")
        .eq("pairing_code", pairing_code)
        .single()

      if (findError || !connection) {
        return new Response(JSON.stringify({ error: "Código inválido" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (new Date(connection.pairing_code_expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Código expirado, genera uno nuevo" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { error: updateError } = await supabase
        .from("connections")
        .update({
          extension_device_id: device_id,
          pairing_code: null,
          pairing_code_expires_at: null,
          connected_at: new Date().toISOString(),
        })
        .eq("id", connection.id)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ success: true, user_id: connection.user_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "action debe ser 'generate' o 'redeem'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
