export interface ConversationSnapshot {
  id: string;
  clientId: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// A 1-to-1 support conversation. Immutable read model rehydrated from persistence;
// message writes are handled by the message repository, which also bumps
// `lastMessageAt`.
export class Conversation {
  private constructor(
    private readonly _id: string,
    private readonly _clientId: string,
    private readonly _lastMessageAt: Date | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: ConversationSnapshot): Conversation {
    return new Conversation(
      snapshot.id,
      snapshot.clientId,
      snapshot.lastMessageAt,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get clientId(): string {
    return this._clientId;
  }

  get lastMessageAt(): Date | null {
    return this._lastMessageAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
