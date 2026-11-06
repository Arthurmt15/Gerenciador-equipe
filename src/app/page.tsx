import { ArrowUpRight, CheckCircle2, Layers3 } from "lucide-react";
import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default function Home() {
  return (
    <main className="login-page">
      <nav className="login-nav"><Link className="brand" href="/"><span>R</span>ritmo</Link><Link href="/board" className="text-link">Ver demonstração <ArrowUpRight size={16} /></Link></nav>
      <section className="login-grid">
        <div className="login-copy">
          <span className="product-note"><Layers3 size={16} />O trabalho, no seu ritmo</span>
          <h1>Clareza para tirar ideias do lugar.</h1>
          <p>Organize projetos sem perder tempo organizando a ferramenta. Um quadro direto, flexível e feito para o seu fluxo.</p>
          <div className="benefit-list"><span><CheckCircle2 />Quadros privados por usuário</span><span><CheckCircle2 />Funciona em qualquer tela</span><span><CheckCircle2 />Seus dados protegidos no Supabase</span></div>
        </div>
        <div className="login-card">
          <div className="mini-board" aria-hidden="true"><div><i /><i /><i /></div><div><i /><i /></div><div><i /></div></div>
          <h2>Entre no seu espaço</h2>
          <p>Use sua conta Google. Leva menos de um minuto.</p>
          <GoogleLoginButton configured={hasSupabaseEnv()} />
          <small>Ao continuar, você concorda com os termos de uso e privacidade.</small>
        </div>
      </section>
    </main>
  );
}
