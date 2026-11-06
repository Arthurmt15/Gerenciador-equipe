"use client";

import type { Card } from "@/domain/board/board";
import type { BoardSnapshot } from "@/lib/demo-board";
import { createBrowserClient } from "@/lib/supabase/client";
import { KanbanBoard } from "./kanban-board";

export function BoardClient({ board, connected }: { board: BoardSnapshot; connected: boolean }) {
  async function moveCard(cardId: string, columnId: string, position: number) {
    if (!connected) return;
    const { error } = await createBrowserClient().from("cards").update({ column_id: columnId, position }).eq("id", cardId);
    if (error) throw error;
  }

  async function createCard(columnId: string, title: string): Promise<Card> {
    const position = board.cards.filter((card) => card.columnId === columnId).length;
    const { data, error } = await createBrowserClient().from("cards").insert({ board_id: board.id, column_id: columnId, title, position, created_by: (await createBrowserClient().auth.getUser()).data.user?.id }).select("id").single();
    if (error) throw error;
    return { id: data.id, columnId, title, position };
  }

  return <KanbanBoard initialBoard={board} onMoveCard={connected ? moveCard : undefined} onCreateCard={connected ? createCard : undefined} />;
}
