import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { getOverview, pingStreak } from "@/lib/dashboard.functions";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
  head: () => ({ meta: [{ title: "Carbofile — Panel" }] }),
});

function DashboardLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_OUT" || !s) navigate({ to: "/auth", replace: true });
      else setEmail(s.user.email ?? null);
    });
    // fire and forget
    pingStreak().catch(() => {});
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const { data } = useQuery({
    queryKey: ["overview"],
    queryFn: () => getOverview(),
    refetchInterval: 30_000,
  });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar email={email} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar streak={data?.profile?.streak_days ?? 0} onCmd={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
      <Toaster />
    </div>
  );
}
