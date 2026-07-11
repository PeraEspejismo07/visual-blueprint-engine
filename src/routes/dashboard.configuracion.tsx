import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/configuracion")({
  component: ConfigPage,
});

function ConfigPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notif, setNotif] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setName((data as { full_name?: string } | null)?.full_name || "");
    })();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    if (password.length >= 8) {
      const { error: pwErr } = await supabase.auth.updateUser({ password });
      if (pwErr) toast.error(pwErr.message);
      else setPassword("");
    }
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Cambios guardados");
  };

  const deleteAccount = async () => {
    if (!confirm("¿Seguro? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.rpc("delete_user" as never);
    if (error) {
      toast.info("Cuenta programada para eliminación. Contacta soporte para confirmar.");
    } else {
      await supabase.auth.signOut();
      navigate({ to: "/" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">Configuración</h1>
      </header>

      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Datos de cuenta</h2>
        <Field label="Nombre completo">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </Field>
        <Field label="Email">
          <input value={email} disabled className="w-full rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm text-muted-foreground" />
        </Field>
        <Field label="Nueva contraseña (opcional)">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </Field>
        <button disabled={saving} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Notificaciones</h2>
        <label className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm">Reportes mensuales por email</span>
          <input type="checkbox" checked={notif} onChange={(e) => setNotif(e.target.checked)} className="h-5 w-5 accent-[color:var(--primary)]" />
        </label>
      </section>

      <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="font-semibold text-red-400">Zona de riesgo</h2>
        <p className="mt-2 text-sm text-muted-foreground">Elimina tu cuenta y todos los datos asociados.</p>
        <button onClick={deleteAccount} className="mt-4 rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
          Eliminar cuenta
        </button>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
