"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export function GoogleLoginButton({ configured }: { configured: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login() {
    if (!configured) { router.push("/board"); return; }
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    setLoading(false);
  }

  return <button className="google-button" onClick={login} disabled={loading}><span className="google-mark">G</span>{loading ? "Conectando..." : configured ? "Continuar com Google" : "Abrir demonstração"}</button>;
}
