"use client";

import { Bell, ChevronDown, CircleHelp, LayoutDashboard, Menu, Moon, Palette, Plus, Search, Settings, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

const accents = ["#3558f5", "#7c3aed", "#0f8a6a", "#d14f32"];

export function DashboardShell({ children, boardTitle, userName, demo }: { children: React.ReactNode; boardTitle: string; userName: string; demo: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function setAccent(color: string) {
    document.documentElement.style.setProperty("--accent", color);
    localStorage.setItem("ritmo-accent", color);
  }
  useEffect(() => { const accent = localStorage.getItem("ritmo-accent"); if (accent) document.documentElement.style.setProperty("--accent", accent); }, []);

  return (
    <div className="app-shell">
      {sidebarOpen ? <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} /> : null}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-top"><Link className="brand" href="/"><span>R</span>ritmo</Link><button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)}><X /></button></div>
        <button className="workspace-switch"><span className="workspace-avatar">EA</span><span><strong>Espaço de {userName.split(" ")[0]}</strong><small>{demo ? "Modo demonstração" : "Meu workspace"}</small></span><ChevronDown size={16} /></button>
        <nav className="side-nav"><a className="active" href="#"><LayoutDashboard />Quadros</a><a href="#"><Search />Buscar</a></nav>
        <div className="side-section"><div><span>Seus quadros</span><button aria-label="Novo quadro"><Plus /></button></div><a className="board-link active" href="#"><i />{boardTitle}</a></div>
        <div className="sidebar-footer"><a href="#"><CircleHelp />Ajuda</a><button onClick={() => setSettingsOpen(true)}><Settings />Configurações</button><div className="user-chip"><span>{userName.slice(0, 2).toUpperCase()}</span><div><strong>{userName}</strong><small>{demo ? "demo@ritmo.app" : "Conta Google"}</small></div><ChevronDown /></div></div>
      </aside>
      <div className="workspace-main">
        <header className="topbar"><button className="icon-button mobile-only" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)}><Menu /></button><div className="mobile-brand">ritmo</div><label className="global-search"><Search /><input aria-label="Buscar" placeholder="Buscar tarefas, quadros..." /><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" aria-label="Notificações"><Bell /></button><button className="avatar-button">{userName.slice(0, 2).toUpperCase()}</button></div></header>
        <main className="board-page"><header className="board-heading"><div><div className="breadcrumbs">Meus quadros <span>/</span> {boardTitle}</div><h1>{boardTitle}</h1><p>Organize, priorize e mantenha o trabalho em movimento.</p></div><div className="board-actions"><button className="button button--quiet" onClick={() => setSettingsOpen(true)}><Palette />Personalizar</button><button className="button button--primary"><Plus />Nova tarefa</button></div></header>{demo ? <div className="demo-banner">Você está no modo demonstração. Configure o Supabase para salvar as alterações.</div> : null}{children}</main>
      </div>
      {settingsOpen ? <div className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="dialog-heading"><div><span>Preferências</span><h2 id="settings-title">Seu espaço, seu ritmo</h2></div><button className="icon-button" aria-label="Fechar" onClick={() => setSettingsOpen(false)}><X /></button></div><div className="settings-group"><label>Tema</label><div className="segmented"><button className={resolvedTheme === "light" ? "selected" : ""} onClick={() => setTheme("light")}><Sun />Claro</button><button className={resolvedTheme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}><Moon />Escuro</button></div></div><div className="settings-group"><label>Cor de destaque</label><div className="accent-picker">{accents.map((color) => <button key={color} aria-label={`Usar cor ${color}`} style={{ background: color }} onClick={() => setAccent(color)} />)}</div></div></div> : null}
    </div>
  );
}
