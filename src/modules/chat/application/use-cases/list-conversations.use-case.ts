import { ListConversationsUseCasePort } from '../ports/in/list-conversations.port';
import {
    ConversationRepositoryPort,
    ConversationSummaryView,
} from '../ports/out/conversation-repository.port';

export class ListConversationsUseCase implements ListConversationsUseCasePort {
  constructor(private readonly conversations: ConversationRepositoryPort) {}

  async execute(limit: number): Promise<ConversationSummaryView[]> {
    return this.conversations.findSummaries(limit);
  }
}
