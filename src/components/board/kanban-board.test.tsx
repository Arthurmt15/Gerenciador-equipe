import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { KanbanBoard } from "./kanban-board";
import { demoBoard } from "@/lib/demo-board";

describe("KanbanBoard", () => {
  it("mostra as colunas e os cartões do quadro", () => {
    render(<KanbanBoard initialBoard={demoBoard} />);

    expect(screen.getByRole("heading", { name: "A fazer" })).toBeInTheDocument();
    expect(screen.getByText("Definir identidade visual")).toBeInTheDocument();
  });

  it("adiciona um cartão à coluna escolhida", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialBoard={demoBoard} />);

    await user.click(screen.getAllByRole("button", { name: "Adicionar tarefa" })[0]);
    await user.type(screen.getByLabelText("Título da tarefa"), "Revisar métricas");
    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(screen.getByText("Revisar métricas")).toBeInTheDocument();
  });
});
