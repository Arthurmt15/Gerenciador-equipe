import { redirect } from "next/navigation";
import { BoardClient } from "@/components/board/board-client";
import { DashboardShell } from "@/components/dashboard-shell";
import type { BoardSnapshot } from "@/lib/demo-board";
import { demoBoard } from "@/lib/demo-board";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface BoardRow {
  id: string;
  title: string;
  columns: Array<{ id: string; title: string; position: number; cards: Array<{ id: string; column_id: string; title: string; position: number; description: string | null; priority: "low" | "medium" | "high" | null; due_date: string | null }> }>;
}

export default async function BoardPage() {
  const connected = hasSupabaseEnv();
  if (!connected) return <DashboardShell boardTitle={demoBoard.title} userName="Visitante" demo><BoardClient board={demoBoard} connected={false} /></DashboardShell>;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data } = await supabase.from("boards").select("id,title,columns(id,title,position,cards(id,column_id,title,position,description,priority,due_date))").order("created_at").limit(1).single();
  const row = data as BoardRow | null;
  const board: BoardSnapshot = row ? {
    id: row.id,
    title: row.title,
    columns: row.columns.sort((a, b) => a.position - b.position).map(({ id, title, position }) => ({ id, title, position })),
    cards: row.columns.flatMap((column) => column.cards.map((card) => ({ id: card.id, columnId: card.column_id, title: card.title, position: card.position, ...(card.description ? { description: card.description } : {}), ...(card.priority ? { priority: card.priority } : {}), ...(card.due_date ? { dueDate: card.due_date } : {}) }))),
  } : demoBoard;
  const name = user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "Usuário";
  return <DashboardShell boardTitle={board.title} userName={name} demo={!row}><BoardClient board={board} connected={Boolean(row)} /></DashboardShell>;
}
