import { Conversation, Message, Sender } from '@/types';

// Client-safe conversation service that uses API routes
export class ConversationApiService {
  // Generate conversation title from first message
  static generateTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  }

  // Create a new conversation
  static async createConversation(userId: string, firstMessage: string): Promise<Conversation> {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, firstMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Get a specific conversation
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`/api/conversations?conversationId=${encodeURIComponent(conversationId)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Update conversation title
  static async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          action: 'updateTitle',
          value: newTitle
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }

  // Archive/unarchive conversation
  static async archiveConversation(conversationId: string, isArchived: boolean): Promise<boolean> {
    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          action: 'archive',
          value: isArchived
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  }

  // Delete conversation
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/conversations?conversationId=${encodeURIComponent(conversationId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
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
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content,
          sender,
          fileName,
          fileType,
          fileSize
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }
}