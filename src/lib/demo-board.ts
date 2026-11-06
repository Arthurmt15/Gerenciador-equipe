import type { BoardColumn, Card } from "@/domain/board/board";

export interface BoardSnapshot {
  id: string;
  title: string;
  columns: BoardColumn[];
  cards: Card[];
}

export const demoBoard: BoardSnapshot = {
  id: "demo-board",
  title: "Lançamento do produto",
  columns: [
    { id: "backlog", title: "Ideias", position: 0 },
    { id: "todo", title: "A fazer", position: 1 },
    { id: "doing", title: "Em andamento", position: 2 },
    { id: "done", title: "Concluído", position: 3 },
  ],
  cards: [
    { id: "1", columnId: "backlog", title: "Entrevistar primeiros clientes", position: 0, priority: "medium", labels: ["Pesquisa"] },
    { id: "2", columnId: "todo", title: "Definir identidade visual", position: 0, priority: "high", dueDate: "12 nov", labels: ["Design"] },
    { id: "3", columnId: "todo", title: "Preparar página de lançamento", position: 1, priority: "medium", labels: ["Marketing"] },
    { id: "4", columnId: "doing", title: "Implementar autenticação Google", position: 0, priority: "high", labels: ["Produto"] },
    { id: "5", columnId: "doing", title: "Validar fluxo no celular", position: 1, priority: "low", labels: ["QA"] },
    { id: "6", columnId: "done", title: "Mapear jornada do usuário", position: 0, labels: ["Pesquisa"] },
  ],
};
