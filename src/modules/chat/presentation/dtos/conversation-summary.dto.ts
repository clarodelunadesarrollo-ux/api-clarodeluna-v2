import { ConversationSummaryView } from '../../application/ports/out/conversation-repository.port';

class ConversationSummaryResponseDto {
  readonly id: string;
  readonly clientId: string;
  readonly clientName: string | null;
  readonly clientEmail: string;
  readonly lastMessageAt: string | null;
  readonly lastMessagePreview: string | null;
  readonly unreadCount: number;

  constructor(view: ConversationSummaryView) {
    this.id = view.id;
    this.clientId = view.clientId;
    this.clientName = view.clientName;
    this.clientEmail = view.clientEmail;
    this.lastMessageAt = view.lastMessageAt
      ? view.lastMessageAt.toISOString()
      : null;
    this.lastMessagePreview = view.lastMessagePreview;
    this.unreadCount = view.unreadCount;
  }
}

export class ConversationSummaryListResponseDto {
  readonly conversations: ConversationSummaryResponseDto[];

  constructor(views: ConversationSummaryView[]) {
    this.conversations = views.map(
      (view) => new ConversationSummaryResponseDto(view),
    );
  }
}
