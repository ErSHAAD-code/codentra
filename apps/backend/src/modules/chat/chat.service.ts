import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { AI_PROVIDER, AIProvider, ChatMessage } from '@/modules/ai-provider/ai-provider.interface';
import { RepositoriesService } from '@/modules/repositories/repositories.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repositories: RepositoriesService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
  ) {}

  async createChat(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId); // asserts access
    return this.prisma.chat.create({ data: { repositoryId, userId } });
  }

  async listChats(userId: string, repositoryId: string) {
    await this.repositories.findOne(userId, repositoryId);
    return this.prisma.chat.findMany({ where: { repositoryId, userId }, orderBy: { updatedAt: 'desc' } });
  }

  async listMessages(userId: string, chatId: string) {
    const chat = await this.getChatOrThrow(userId, chatId);
    return this.prisma.message.findMany({ where: { chatId: chat.id }, orderBy: { createdAt: 'asc' } });
  }

  /** Streams the assistant's reply token-by-token, then persists both the
   * user message and the completed assistant message once streaming ends. */
  async *sendMessage(userId: string, chatId: string, content: string): AsyncIterable<string> {
    const chat = await this.getChatOrThrow(userId, chatId);
    await this.prisma.message.create({ data: { chatId: chat.id, role: 'USER', content } });

    const context = await this.prisma.aIContext.findUnique({ where: { repositoryId: chat.repositoryId } });
    const history = await this.prisma.message.findMany({ where: { chatId: chat.id }, orderBy: { createdAt: 'asc' } });

    const systemPrompt = `You are Codentra AI, an elite expert-level software engineer and architecture consultant. 
Your goal is to act exactly like an advanced ChatGPT or Gemini assistant, specifically trained for the user's codebase.

${context?.summary ? `--- REPOSITORY CONTEXT ---\n${context.summary}\n--------------------------` : 'No specific repository context is available yet.'}

CRITICAL INSTRUCTIONS:
1. When asked to write code, always provide production-ready, clean, and well-structured code.
2. ALWAYS use proper Markdown formatting. Wrap all code in \`\`\`language blocks.
3. If asked to find bugs, thoroughly analyze the context and suggest concrete, actionable fixes.
4. Be concise but highly technical. Do not write filler text.`;

    const messages: ChatMessage[] = history.map((m) => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
    }));

    let fullReply = '';
    for await (const chunk of this.aiProvider.stream(messages, systemPrompt)) {
      fullReply += chunk;
      yield chunk;
    }

    await this.prisma.message.create({ data: { chatId: chat.id, role: 'ASSISTANT', content: fullReply } });
  }

  private async getChatOrThrow(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    await this.repositories.findOne(userId, chat.repositoryId); // asserts access
    return chat;
  }

  async deleteChat(userId: string, chatId: string) {
    const chat = await this.getChatOrThrow(userId, chatId);
    return this.prisma.chat.delete({ where: { id: chat.id } });
  }
}
