/**
 * Base class for all pure domain exceptions across modules (shared kernel).
 * Optional `status` (HTTP) and `userMessage` (Spanish) let the global
 * DomainExceptionFilter map exceptions generically, without a per-case branch.
 * Auth exceptions omit them and keep their existing explicit mapping.
 */
export abstract class DomainException extends Error {
  readonly status?: number;
  readonly userMessage?: string;

  protected constructor(
    message: string,
    status?: number,
    userMessage?: string,
  ) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.userMessage = userMessage;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
