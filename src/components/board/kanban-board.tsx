"use client";

import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, GripVertical, MoreHorizontal, Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { Card } from "@/domain/board/board";
import type { BoardSnapshot } from "@/lib/demo-board";

interface KanbanBoardProps {
  initialBoard: BoardSnapshot;
  onMoveCard?: (cardId: string, columnId: string, position: number) => Promise<void>;
  onCreateCard?: (columnId: string, title: string) => Promise<Card>;
}

function TaskCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`task-card ${isDragging ? "task-card--dragging" : ""}`}
    >
      <button className="drag-handle" aria-label={`Mover ${card.title}`} {...listeners} {...attributes}>
        <GripVertical size={15} />
      </button>
      {card.labels?.length ? <span className="task-label">{card.labels[0]}</span> : null}
      <h3>{card.title}</h3>
      <div className="task-meta">
        {card.dueDate ? <span><CalendarDays size={14} />{card.dueDate}</span> : <span />}
        {card.priority ? <span className={`priority priority--${card.priority}`}>{card.priority === "high" ? "Alta" : card.priority === "medium" ? "Média" : "Baixa"}</span> : null}
      </div>
    </article>
  );
}

function Column({ title, id, cards, onAdd }: { title: string; id: string; cards: Card[]; onAdd: (columnId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? "kanban-column--over" : ""}`}>
      <header className="column-header">
        <div><span className="column-dot" /><h2>{title}</h2><span className="count">{cards.length}</span></div>
        <button className="icon-button" aria-label={`Opções de ${title}`}><MoreHorizontal size={18} /></button>
      </header>
      <div className="card-list">
        {cards.map((card) => <TaskCard key={card.id} card={card} />)}
      </div>
      <button className="add-card" onClick={() => onAdd(id)}><Plus size={17} />Adicionar tarefa</button>
    </section>
  );
}

export function KanbanBoard({ initialBoard, onMoveCard, onCreateCard }: KanbanBoardProps) {
  const [cards, setCards] = useState<Card[]>(initialBoard.cards);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const destination = initialBoard.columns.find((column) => column.id === over.id)?.id
      ?? cards.find((card) => card.id === over.id)?.columnId;
    if (!destination) return;
    const position = cards.filter((card) => card.columnId === destination && card.id !== active.id).length;
    setCards((current) => current.map((card) => card.id === active.id ? { ...card, columnId: destination, position } : card));
    await onMoveCard?.(String(active.id), destination, position);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!addingTo || !title.trim()) return;
    const localCard: Card = await onCreateCard?.(addingTo, title.trim()) ?? {
      id: crypto.randomUUID(), columnId: addingTo, title: title.trim(),
      position: cards.filter((card) => card.columnId === addingTo).length,
    };
    setCards((current) => [...current, localCard]);
    setTitle("");
    setAddingTo(null);
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="kanban" aria-label="Quadro Kanban">
          {initialBoard.columns.map((column) => (
            <Column key={column.id} id={column.id} title={column.title} cards={cards.filter((card) => card.columnId === column.id).sort((a, b) => a.position - b.position)} onAdd={setAddingTo} />
          ))}
        </div>
      </DndContext>
      {addingTo ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAddingTo(null)}>
          <form className="task-dialog" role="dialog" aria-modal="true" aria-labelledby="new-task-title" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
            <div className="dialog-heading"><div><span>Nova tarefa</span><h2 id="new-task-title">Capture o próximo passo</h2></div><button type="button" className="icon-button" aria-label="Fechar" onClick={() => setAddingTo(null)}><X size={18} /></button></div>
            <label htmlFor="task-title">Título da tarefa</label>
            <input id="task-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Revisar proposta comercial" />
            <div className="dialog-actions"><button type="button" className="button button--quiet" onClick={() => setAddingTo(null)}>Cancelar</button><button className="button button--primary" type="submit">Criar tarefa</button></div>
          </form>
        </div>
      ) : null}
    </>
  );
}
