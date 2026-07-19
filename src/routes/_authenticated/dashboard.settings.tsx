import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? "");
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.user!.id).maybeSingle();
      setName(p?.full_name ?? "");
    });
  }, []);

  const saveName = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", u.user.id);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  };

  const changePw = async () => {
    if (pw.length < 6) return toast.error("Mínimo 6 caracteres");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message);
    else {
      toast.success("Contraseña actualizada");
      setPw("");
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Se cerrará tu sesión y perderás acceso a tus datos. ¿Continuar?")) return;
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="mx-auto max-w-[720px] px-6 md:px-10 py-8 space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Cuenta</p>
        <h1 className="mt-2 text-3xl font-light tracking-tight">Ajustes</h1>
      </div>

      <section className="rounded-xl border border-border p-6 space-y-4">
        <p className="text-sm">Perfil</p>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Correo</label>
          <p className="mt-1 text-sm">{email}</p>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground outline-none"
          />
        </div>
        <button onClick={saveName} className="rounded-full bg-foreground text-background text-sm px-5 py-2 hover:opacity-90">
          Guardar
        </button>
      </section>

      <section className="rounded-xl border border-border p-6 space-y-4">
        <p className="text-sm">Contraseña</p>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus:border-foreground outline-none"
        />
        <button onClick={changePw} className="rounded-full border border-border text-sm px-5 py-2 hover:border-foreground">
          Cambiar
        </button>
      </section>

      <section className="rounded-xl border border-destructive/30 p-6 space-y-3">
        <p className="text-sm">Zona peligrosa</p>
        <p className="text-xs text-muted-foreground">
          Cerrar la sesión desvincula tus dispositivos hasta el próximo inicio.
        </p>
        <button
          onClick={deleteAccount}
          className="rounded-full border border-destructive/50 text-destructive text-sm px-5 py-2 hover:bg-destructive/10"
        >
          Cerrar sesión y volver al inicio
        </button>
      </section>
    </div>
  );
}
