export interface BoardColumn {
  readonly id: string;
  readonly title: string;
  readonly position: number;
}

export interface Card {
  readonly id: string;
  readonly columnId: string;
  readonly title: string;
  readonly position: number;
  readonly description?: string;
  readonly priority?: "low" | "medium" | "high";
  readonly dueDate?: string;
  readonly labels?: readonly string[];
}

export interface CardMove {
  readonly cardId: string;
  readonly columnId: string;
  readonly position: number;
}

export class Board {
  private cards: Card[];

  constructor(
    readonly id: string,
    readonly title: string,
    readonly columns: readonly BoardColumn[],
    cards: readonly Card[],
  ) {
    this.cards = [...cards];
  }

  cardsIn(columnId: string): readonly Card[] {
    return this.cards
      .filter((card) => card.columnId === columnId)
      .sort((left, right) => left.position - right.position);
  }

  moveCard(cardId: string, destinationColumnId: string, destinationIndex: number): CardMove[] {
    if (!this.columns.some((column) => column.id === destinationColumnId)) {
      throw new Error("Coluna não encontrada");
    }

    const card = this.cards.find((candidate) => candidate.id === cardId);
    if (!card) throw new Error("Cartão não encontrado");

    const sourceColumnId = card.columnId;
    const sourceCards = this.cardsIn(sourceColumnId).filter((candidate) => candidate.id !== cardId);
    const destinationCards = sourceColumnId === destinationColumnId
      ? sourceCards
      : [...this.cardsIn(destinationColumnId)];
    const safeIndex = Math.max(0, Math.min(destinationIndex, destinationCards.length));

    destinationCards.splice(safeIndex, 0, { ...card, columnId: destinationColumnId });
    const affected = sourceColumnId === destinationColumnId
      ? destinationCards
      : [...sourceCards, ...destinationCards];
    const nextCards = this.cards.filter(
      (candidate) => candidate.columnId !== sourceColumnId && candidate.columnId !== destinationColumnId,
    );

    const normalizedSource = sourceColumnId === destinationColumnId
      ? []
      : sourceCards.map((candidate, position) => ({ ...candidate, position }));
    const normalizedDestination = destinationCards.map((candidate, position) => ({ ...candidate, position }));
    this.cards = [...nextCards, ...normalizedSource, ...normalizedDestination];

    return affected.map((candidate) => {
      const updated = this.cards.find((current) => current.id === candidate.id)!;
      return { cardId: updated.id, columnId: updated.columnId, position: updated.position };
    });
  }
}

export interface BoardRepository {
  findById(boardId: string): Promise<Board | null>;
  saveCardMoves(boardId: string, moves: readonly CardMove[]): Promise<void>;
}
