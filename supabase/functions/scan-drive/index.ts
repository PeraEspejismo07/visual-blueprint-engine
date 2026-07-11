// ============================================================
// CarboFile — Edge Function: scan-drive
// Escanea Google Drive del usuario (solo metadata) y detecta
// duplicados + archivos sin modificar hace 12+ meses.
// ============================================================
import { serve } from "https://deno.land/std@0.203.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CO2_KG_PER_GB_YEAR = 0.02 // factor conservador, reemplazar con fuente citada (ej. The Shift Project)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id es requerido" }), {
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
      .select("access_token, refresh_token")
      .eq("user_id", user_id)
      .eq("provider", "google_drive")
      .eq("status", "active")
      .single()

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "No hay conexión activa de Google Drive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Llamada a Google Drive API — solo metadata (nombre, tamaño, fecha, hash)
    const driveRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?pageSize=1000&fields=files(id,name,size,modifiedTime,md5Checksum,trashed)",
      { headers: { Authorization: `Bearer ${connection.access_token}` } }
    )

    if (!driveRes.ok) {
      return new Response(JSON.stringify({ error: "Token de Google inválido o expirado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { files } = await driveRes.json()
    const activeFiles = (files || []).filter((f: any) => !f.trashed)

    const hashMap: Record<string, any[]> = {}
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    let totalBytes = 0
    const candidates: any[] = []

    for (const file of activeFiles) {
      const size = Number(file.size || 0)

      if (new Date(file.modifiedTime) < oneYearAgo) {
        candidates.push({ id: file.id, name: file.name, size, reason: "old" })
        totalBytes += size
      }

      if (file.md5Checksum) {
        hashMap[file.md5Checksum] = hashMap[file.md5Checksum] || []
        hashMap[file.md5Checksum].push(file)
      }
    }

    for (const dupes of Object.values(hashMap)) {
      if (dupes.length > 1) {
        // Se conserva el primero, el resto se marca como duplicado
        dupes.slice(1).forEach((f) => {
          const size = Number(f.size || 0)
          candidates.push({ id: f.id, name: f.name, size, reason: "duplicate" })
          totalBytes += size
        })
      }
    }

    const gbFound = totalBytes / 1024 ** 3
    const co2Estimate = gbFound * CO2_KG_PER_GB_YEAR

    await supabase
      .from("connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", user_id)
      .eq("provider", "google_drive")

    return new Response(
      JSON.stringify({
        candidates,
        totalCandidates: candidates.length,
        gbFound: Number(gbFound.toFixed(3)),
        co2EstimateKg: Number(co2Estimate.toFixed(3)),
        methodology: "Estimación basada en 0.02 kg CO2 por GB almacenado/año (factor conservador, sujeto a revisión con fuentes públicas citadas)",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
