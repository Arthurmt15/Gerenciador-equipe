import { describe, expect, it } from "vitest";
import { Board } from "./board";

const columns = [
  { id: "todo", title: "A fazer", position: 0 },
  { id: "doing", title: "Em andamento", position: 1 },
];

const cards = [
  { id: "a", columnId: "todo", title: "Primeira", position: 0 },
  { id: "b", columnId: "todo", title: "Segunda", position: 1 },
  { id: "c", columnId: "doing", title: "Terceira", position: 0 },
];

describe("Board", () => {
  it("move um cartão para outra coluna e reordena as duas colunas", () => {
    const board = new Board("board-1", "Meu quadro", columns, cards);

    board.moveCard("a", "doing", 1);

    expect(board.cardsIn("todo").map(({ id, position }) => [id, position])).toEqual([
      ["b", 0],
    ]);
    expect(board.cardsIn("doing").map(({ id, position }) => [id, position])).toEqual([
      ["c", 0],
      ["a", 1],
    ]);
  });

  it("reordena um cartão dentro da mesma coluna", () => {
    const board = new Board("board-1", "Meu quadro", columns, cards);

    board.moveCard("b", "todo", 0);

    expect(board.cardsIn("todo").map(({ id, position }) => [id, position])).toEqual([
      ["b", 0],
      ["a", 1],
    ]);
  });

  it("rejeita um destino inexistente", () => {
    const board = new Board("board-1", "Meu quadro", columns, cards);

    expect(() => board.moveCard("a", "missing", 0)).toThrow("Coluna não encontrada");
  });
});
