export interface UserSnapshot {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User domain entity: identity + email only. No password is ever stored.
 */
export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: UserSnapshot): User {
    return new User(
      snapshot.id,
      snapshot.email,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
