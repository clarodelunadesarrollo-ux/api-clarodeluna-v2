import { MessageSenderType } from '../enums/message-sender-type.enum';
import { MessageType } from '../enums/message-type.enum';
import { InvalidMessageException } from '../exceptions/invalid-message.exception';

export const MAX_MESSAGE_BODY_LENGTH = 2000;

// Image upload constraints shared by client and admin image sends.
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface MessageSnapshot {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string;
  type: MessageType;
  body: string | null;
  imageUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export class Message {
  private constructor(
    private readonly _id: string,
    private readonly _conversationId: string,
    private readonly _senderType: MessageSenderType,
    private readonly _senderId: string,
    private readonly _type: MessageType,
    private readonly _body: string | null,
    private readonly _imageUrl: string | null,
    private readonly _readAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static rehydrate(snapshot: MessageSnapshot): Message {
    return new Message(
      snapshot.id,
      snapshot.conversationId,
      snapshot.senderType,
      snapshot.senderId,
      snapshot.type,
      snapshot.body,
      snapshot.imageUrl,
      snapshot.readAt,
      snapshot.createdAt,
    );
  }

  // Normalizes and validates the text body shared by client and admin sends.
  // Rejects empty or whitespace-only content (400) and enforces the max length.
  static normalizeTextBody(rawBody: string): string {
    const body = rawBody.trim();
    if (body.length === 0) {
      throw new InvalidMessageException(
        'body must not be empty',
        'El mensaje no puede estar vacío.',
      );
    }
    if (body.length > MAX_MESSAGE_BODY_LENGTH) {
      throw new InvalidMessageException(
        `body must not exceed ${MAX_MESSAGE_BODY_LENGTH} characters`,
        'El mensaje es demasiado largo.',
      );
    }
    return body;
  }

  // Validates an incoming image upload before it reaches storage. Rejects
  // unsupported formats and oversized files (400) so we never spend an upload
  // on invalid content.
  static validateImageUpload(mimeType: string, sizeBytes: number): void {
    if (
      !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)
    ) {
      throw new InvalidMessageException(
        `unsupported image type: ${mimeType}`,
        'Formato de imagen no soportado. Usá JPG, PNG o WEBP.',
      );
    }
    if (sizeBytes <= 0) {
      throw new InvalidMessageException(
        'image must not be empty',
        'La imagen está vacía.',
      );
    }
    if (sizeBytes > MAX_IMAGE_BYTES) {
      throw new InvalidMessageException(
        `image must not exceed ${MAX_IMAGE_BYTES} bytes`,
        'La imagen supera el tamaño máximo de 5 MB.',
      );
    }
  }

  get id(): string {
    return this._id;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  get senderType(): MessageSenderType {
    return this._senderType;
  }

  get senderId(): string {
    return this._senderId;
  }

  get type(): MessageType {
    return this._type;
  }

  get body(): string | null {
    return this._body;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get readAt(): Date | null {
    return this._readAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
