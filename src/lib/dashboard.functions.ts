import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceIso = since.toISOString().slice(0, 10);

    const [metricsRes, profileRes, connRes, devRes, rulesRes] = await Promise.all([
      supabase
        .from("daily_metrics")
        .select("date, gb_freed, co2_kg_saved, actions_count")
        .eq("user_id", userId)
        .gte("date", sinceIso)
        .order("date", { ascending: true }),
      supabase.from("profiles").select("full_name, email, streak_days, last_active_at").eq("id", userId).maybeSingle(),
      supabase.from("connections").select("id, provider, status").eq("user_id", userId),
      supabase.from("devices").select("id, name, paired_at, last_seen_at").eq("user_id", userId).not("paired_at", "is", null),
      supabase.from("agent_rules").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const metrics = metricsRes.data ?? [];
    const totalGb = metrics.reduce((s, m) => s + Number(m.gb_freed ?? 0), 0);
    const totalCo2 = metrics.reduce((s, m) => s + Number(m.co2_kg_saved ?? 0), 0);
    const totalActions = metrics.reduce((s, m) => s + Number(m.actions_count ?? 0), 0);

    // Fill days
    const days: { date: string; gb: number; co2: number; actions: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = metrics.find((m) => m.date === key);
      days.push({
        date: key,
        gb: Number(row?.gb_freed ?? 0),
        co2: Number(row?.co2_kg_saved ?? 0),
        actions: Number(row?.actions_count ?? 0),
      });
    }

    return {
      profile: profileRes.data,
      totals: { gb: totalGb, co2: totalCo2, actions: totalActions },
      series: days,
      connections: connRes.data ?? [],
      devices: devRes.data ?? [],
      rules: rulesRes.data,
    };
  });

export const listRecentActions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("cleanup_actions")
      .select("id, source, action_type, file_name, size_bytes, co2_grams_saved, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  });

export const listTrash = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("cleanup_actions")
      .select("id, source, file_name, size_bytes, created_at")
      .eq("user_id", context.userId)
      .eq("action_type", "eliminado")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const restoreAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: { id: string }) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("restore_action", { p_action_id: data.id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createPairingCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("create_pairing_code");
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return { code: row.code as string, expiresAt: row.expires_at as string };
  });

export const updateRules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: {
    aggressiveness?: "conservative" | "balanced" | "aggressive";
    min_size_mb?: number;
    undo_window_days?: 7 | 30 | 90;
    auto_delete?: boolean;
    notifications_enabled?: boolean;
    excluded_paths?: string[];
    excluded_extensions?: string[];
  }) =>
    z
      .object({
        aggressiveness: z.enum(["conservative", "balanced", "aggressive"]).optional(),
        min_size_mb: z.number().min(0).max(10000).optional(),
        undo_window_days: z.union([z.literal(7), z.literal(30), z.literal(90)]).optional(),
        auto_delete: z.boolean().optional(),
        notifications_enabled: z.boolean().optional(),
        excluded_paths: z.array(z.string()).optional(),
        excluded_extensions: z.array(z.string()).optional(),
      })
      .parse(v),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("agent_rules")
      .upsert({ user_id: context.userId, ...data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addMockConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: { provider: string }) => z.object({ provider: z.string().min(1).max(64) }).parse(v))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("connections")
      .insert({ user_id: context.userId, provider: data.provider, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: { id: string }) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("connections").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const pingStreak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.rpc("update_streak", { p_user_id: context.userId });
    return { ok: true };
  });

export const getUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const FREE_LIMIT = 500 * 1_000_000;
    const { data, error } = await (context.supabase as any).rpc("month_cleanup_usage", {
      p_user_id: context.userId,
    });
    if (error) {
      return { plan: "free" as const, usedBytes: 0, limitBytes: FREE_LIMIT, blocked: false };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const plan = (row?.plan ?? "free") as "free" | "pro";
    const usedBytes = Number(row?.used_bytes ?? 0);
    const limitBytes = Number(row?.limit_bytes ?? FREE_LIMIT);
    return {
      plan,
      usedBytes,
      limitBytes,
      blocked: plan !== "pro" && limitBytes > 0 && usedBytes >= limitBytes,
    };
  });
