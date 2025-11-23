import { Conversation, Message, Sender } from '@/types';
import { ConversationDatabaseService } from './conversationDatabaseService';

// Conversation service that now uses real database operations
export class ConversationService {
  // Generate conversation title from first message
  static generateTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  }

  // Create a new conversation
  static async createConversation(userId: string, firstMessage: string): Promise<Conversation> {
    return await ConversationDatabaseService.createConversation(userId, firstMessage);
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Conversation[]> {
    return await ConversationDatabaseService.getConversations(userId);
  }

  // Get a specific conversation
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    return await ConversationDatabaseService.getConversation(conversationId);
  }

  // Update conversation title
  static async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    try {
      return await ConversationDatabaseService.updateConversationTitle(conversationId, newTitle);
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }

  // Archive/unarchive conversation
  static async archiveConversation(conversationId: string, isArchived: boolean): Promise<boolean> {
    try {
      return await ConversationDatabaseService.archiveConversation(conversationId, isArchived);
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  }

  // Delete conversation
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      return await ConversationDatabaseService.deleteConversation(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Create a message in a conversation
  static async createMessage(
    conversationId: string,
    content: string,
    sender: Sender,
    fileName?: string,
    fileType?: string,
    fileSize?: number
  ): Promise<Message> {
    return await ConversationDatabaseService.createMessage(
      conversationId,
      content,
      sender,
      fileName,
      fileType,
      fileSize
    );
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await ConversationDatabaseService.getConversationMessages(conversationId);
  }
}