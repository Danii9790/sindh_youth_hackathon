import { Client } from '@neondatabase/serverless';
import { Conversation, Message, Sender } from '@/types';

const DB_URL = process.env.NEON_POSTGRES_URL;

if (!DB_URL) {
  throw new Error('NEON_POSTGRES_URL environment variable is not set');
}

// Create a new client for each request to avoid connection reuse issues
function createClient() {
  return new Client(DB_URL);
}

// Helper function to execute database operations with proper connection management
async function withDatabase<T>(operation: (client: Client) => Promise<T>): Promise<T> {
  const client = createClient();
  await client.connect();

  try {
    return await operation(client);
  } finally {
    await client.end();
  }
}

export class ConversationDatabaseService {
  // Generate conversation title from first message
  static generateTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  }

  // Create a new conversation
  static async createConversation(userId: string, firstMessage: string): Promise<Conversation> {
    return withDatabase(async (client) => {
      const title = this.generateTitle(firstMessage);

      const query = `
        INSERT INTO conversations (user_id, title, message_count, last_message)
        VALUES ($1, $2, 1, $3)
        RETURNING id, user_id, title, message_count, last_message, is_archived, created_at, updated_at
      `;

      const result = await client.query(query, [userId, title, firstMessage]);
      const conversation = result.rows[0];

      // Create the welcome message
      await this.createMessage(conversation.id, firstMessage, Sender.BOT);

      return {
        id: conversation.id,
        userId: conversation.user_id,
        title: conversation.title,
        createdAt: new Date(conversation.created_at),
        updatedAt: new Date(conversation.updated_at),
        messageCount: conversation.message_count,
        lastMessage: conversation.last_message,
        isArchived: conversation.is_archived
      };
    });
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Conversation[]> {
    return withDatabase(async (client) => {
      const query = `
        SELECT id, user_id, title, message_count, last_message, is_archived, created_at, updated_at
        FROM conversations
        WHERE user_id = $1
        ORDER BY updated_at DESC
      `;

      const result = await client.query(query, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        messageCount: row.message_count,
        lastMessage: row.last_message,
        isArchived: row.is_archived
      }));
    });
  }

  // Get a specific conversation
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    return withDatabase(async (client) => {
      const query = `
        SELECT id, user_id, title, message_count, last_message, is_archived, created_at, updated_at
        FROM conversations
        WHERE id = $1
      `;

      const result = await client.query(query, [conversationId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        messageCount: row.message_count,
        lastMessage: row.last_message,
        isArchived: row.is_archived
      };
    });
  }

  // Update conversation title
  static async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    return withDatabase(async (client) => {
      const query = `
        UPDATE conversations
        SET title = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      const result = await client.query(query, [newTitle, conversationId]);
      return result.rowCount > 0;
    });
  }

  // Archive/unarchive conversation
  static async archiveConversation(conversationId: string, isArchived: boolean): Promise<boolean> {
    return withDatabase(async (client) => {
      const query = `
        UPDATE conversations
        SET is_archived = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      const result = await client.query(query, [isArchived, conversationId]);
      return result.rowCount > 0;
    });
  }

  // Delete conversation
  static async deleteConversation(conversationId: string): Promise<boolean> {
    return withDatabase(async (client) => {
      const query = 'DELETE FROM conversations WHERE id = $1';
      const result = await client.query(query, [conversationId]);
      return result.rowCount > 0;
    });
  }

  // Create a message
  static async createMessage(
    conversationId: string,
    content: string,
    sender: Sender,
    fileName?: string,
    fileType?: string,
    fileSize?: number
  ): Promise<Message> {
    return withDatabase(async (client) => {
      const query = `
        INSERT INTO messages (conversation_id, content, sender, file_name, file_type, file_size)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, conversation_id, content, sender, file_name, file_type, file_size, created_at
      `;

      const result = await client.query(query, [
        conversationId,
        content,
        sender,
        fileName || null,
        fileType || null,
        fileSize || null
      ]);

      const row = result.rows[0];
      return {
        id: row.id,
        text: row.content,
        sender: row.sender as Sender,
        timestamp: new Date(row.created_at),
        conversationId: row.conversation_id
      };
    });
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    return withDatabase(async (client) => {
      const query = `
        SELECT id, conversation_id, content, sender, file_name, file_type, file_size, created_at
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
      `;

      const result = await client.query(query, [conversationId]);

      return result.rows.map(row => ({
        id: row.id,
        text: row.content,
        sender: row.sender as Sender,
        timestamp: new Date(row.created_at),
        conversationId: row.conversation_id,
        fileName: row.file_name,
        fileType: row.file_type,
        fileSize: row.file_size
      }));
    });
  }
}