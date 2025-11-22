import { Conversation, Message } from '@/types';

// Mock service for now - replace with actual database operations
export class ConversationService {
  // Generate conversation title from first message
  static generateTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  }

  // Create a new conversation
  static async createConversation(userId: string, firstMessage: string): Promise<Conversation> {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      userId,
      title: this.generateTitle(firstMessage),
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 1,
      lastMessage: firstMessage,
      isArchived: false
    };

    // In a real implementation, save to database
    console.log('Creating conversation:', newConversation);
    return newConversation;
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Conversation[]> {
    // Mock implementation - replace with database query
    const mockConversations: Conversation[] = [
      {
        id: '1',
        userId,
        title: 'Skin rash consultation',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        messageCount: 8,
        lastMessage: 'Thank you for the advice!',
        isArchived: false
      },
      {
        id: '2',
        userId,
        title: 'Headache symptoms discussion',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messageCount: 12,
        lastMessage: 'Should I schedule an appointment?',
        isArchived: false
      },
      {
        id: '3',
        userId,
        title: 'Medical report analysis',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        messageCount: 6,
        lastMessage: 'Here is my blood test report',
        isArchived: true
      }
    ];

    return mockConversations;
  }

  // Get a specific conversation
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    // Mock implementation
    const conversations = await this.getConversations('user123'); // Would pass actual userId
    return conversations.find(c => c.id === conversationId) || null;
  }

  // Update conversation title
  static async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    try {
      // Mock implementation - replace with database update
      console.log(`Updating conversation ${conversationId} title to: ${newTitle}`);
      return true;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }

  // Archive/unarchive conversation
  static async archiveConversation(conversationId: string, isArchived: boolean): Promise<boolean> {
    try {
      // Mock implementation - replace with database update
      console.log(`${isArchived ? 'Archiving' : 'Unarchiving'} conversation: ${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  }

  // Delete conversation
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      // Mock implementation - replace with database delete
      console.log('Deleting conversation:', conversationId);
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Update conversation when new message is added
  static async updateConversationOnMessage(
    conversationId: string,
    newMessage: string,
    messageCount: number
  ): Promise<boolean> {
    try {
      // Mock implementation - replace with database update
      console.log(`Updating conversation ${conversationId} with new message, count: ${messageCount}`);
      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    // Mock implementation - replace with database query
    const mockMessages: Message[] = [
      {
        id: '1',
        text: "Hello! I'm experiencing some skin issues and would like your advice.",
        sender: 'user' as any,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        conversationId
      },
      {
        id: '2',
        text: "Hello! I'd be happy to help you with your skin concerns. Could you please describe what you're experiencing? Is there a rash, irritation, or any specific symptoms?",
        sender: 'bot' as any,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000),
        conversationId
      }
    ];

    return mockMessages;
  }
}