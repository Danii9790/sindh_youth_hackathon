import { Conversation, ConversationMessage, AgentContext } from './chat-store';

// Re-export the types for components that need them
export type { Conversation, ConversationMessage, AgentContext };

export interface AuthenticatedChatStore {
  userId: string;
  conversations: Map<string, Conversation>;
  currentConversationId: string | null;
  agentContext: AgentContext;

  // User-specific methods
  initializeUser(userId: string): Promise<void>;
  syncWithServer(): Promise<void>;

  // Conversation management
  createConversation(title?: string): Promise<string>;
  getCurrentConversation(): Conversation | null;
  setCurrentConversation(id: string): Promise<void>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  renameConversation(id: string, newTitle: string): Promise<void>;

  // Message management
  addMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<void>;
  updateMessage(id: string, updates: Partial<ConversationMessage>): Promise<void>;
  deleteMessage(conversationId: string, messageId: string): Promise<void>;

  // Context management
  updateAgentContext(updates: Partial<AgentContext>): void;
  clearContext(): void;

  // Search and filtering
  searchConversations(query: string): Conversation[];
  getConversationByTopic(topic: string): Conversation[];

  // Export functionality
  exportConversation(id: string): string;
  exportAllConversations(): string;
}

export class AuthenticatedChatStoreImpl implements AuthenticatedChatStore {
  userId: string = '';
  conversations: Map<string, Conversation> = new Map();
  currentConversationId: string | null = null;
  agentContext: AgentContext;

  private apiUrl: string;
  private localStorageKey: string;

  constructor() {
    this.apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://your-api-domain.com'
      : 'http://localhost:3000/api';
    this.localStorageKey = 'medai-pro-authenticated-store';

    this.agentContext = {
      conversationId: '',
      systemPrompt: `You are MediAI, an advanced medical AI assistant with specialized knowledge in:

• General medical information and symptom analysis
• Medical image interpretation (reports, test results, visual symptoms)
• Preventive care and health education
• Appointment coordination and healthcare navigation

Your personality is:
- Professional yet warm and approachable
- Empathetic and patient-focused
- Clear and thorough in explanations
- Always prioritizing patient safety

Guidelines:
- Provide accurate medical information with appropriate disclaimers
- Ask clarifying questions when symptoms are unclear
- Recommend appropriate medical specialties when needed
- For emergencies: Immediately advise calling emergency services
- For appointments: Guide through the booking process
- Never definitively diagnose - always suggest professional consultation
- Consider conversation context and patient history

Remember: You are a supportive tool that complements, not replaces, professional medical care.`,
      personality: 'professional',
      specialty: 'general',
      memory: {}
    };
  }

  async initializeUser(userId: string): Promise<void> {
    this.userId = userId;
    this.localStorageKey = `medai-pro-store-${userId}`;
    await this.loadFromStorage();
    await this.syncWithServer();
  }

  async syncWithServer(): Promise<void> {
    try {
      // Fetch conversations from server
      const response = await fetch(`${this.apiUrl}/conversations/${this.userId}`);
      if (response.ok) {
        const serverConversations = await response.json();

        // Merge server conversations with local ones
        serverConversations.forEach((conv: any) => {
          const localConv = this.conversations.get(conv.id);
          if (!localConv || new Date(conv.updatedAt) > new Date(localConv.updatedAt)) {
            this.conversations.set(conv.id, {
              ...conv,
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.updatedAt),
              messages: conv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            });
          }
        });

        // Push local changes to server
        await this.pushToServer();
      }
    } catch (error) {
      console.warn('Failed to sync with server:', error);
    }
  }

  private async pushToServer(): Promise<void> {
    try {
      const conversationsArray = Array.from(this.conversations.entries()).map(([id, conv]) => ({
        ...conv,
        userId: this.userId
      }));

      await fetch(`${this.apiUrl}/conversations/${this.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversations: conversationsArray,
          currentConversationId: this.currentConversationId
        })
      });
    } catch (error) {
      console.warn('Failed to push to server:', error);
    }
  }

  async createConversation(title?: string): Promise<string> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const conversation: Conversation = {
      id,
      title: title || this.generateConversationTitle(),
      messages: [],
      createdAt: now,
      updatedAt: now,
      model: 'gemini-1.5-flash-latest',
      context: {
        systemPrompt: this.agentContext.systemPrompt,
        temperature: 0.7,
        maxTokens: 1000
      }
    };

    this.conversations.set(id, conversation);
    this.currentConversationId = id;
    this.agentContext.conversationId = id;

    // Add system message
    await this.addMessage({
      role: 'system',
      content: this.agentContext.systemPrompt
    });

    await this.saveToStorage();
    await this.pushToServer();
    return id;
  }

  getCurrentConversation(): Conversation | null {
    if (!this.currentConversationId) return null;
    return this.conversations.get(this.currentConversationId) || null;
  }

  async setCurrentConversation(id: string): Promise<void> {
    if (this.conversations.has(id)) {
      this.currentConversationId = id;
      this.agentContext.conversationId = id;
      await this.saveToStorage();
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      this.conversations.set(id, {
        ...conversation,
        ...updates,
        updatedAt: new Date()
      });
      await this.saveToStorage();
      await this.pushToServer();
    }
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
    if (this.currentConversationId === id) {
      this.currentConversationId = Array.from(this.conversations.keys())[0] || null;
    }
    await this.saveToStorage();
    await this.pushToServer();
  }

  async renameConversation(id: string, newTitle: string): Promise<void> {
    await this.updateConversation(id, { title: newTitle });
  }

  async addMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<void> {
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    const newMessage: ConversationMessage = {
      ...message,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    conversation.messages.push(newMessage);

    // Update conversation title based on first user message
    if (message.role === 'user' && conversation.messages.filter(m => m.role === 'user').length === 1) {
      const newTitle = this.generateConversationTitle(message.content);
      conversation.title = newTitle;
    }

    await this.updateConversation(conversation.id, {
      messages: conversation.messages,
      title: conversation.title
    });

    // Update context with user information
    if (message.role === 'user') {
      this.extractAndStoreContextInfo(message.content);
    }
  }

  async updateMessage(id: string, updates: Partial<ConversationMessage>): Promise<void> {
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    const messageIndex = conversation.messages.findIndex(m => m.id === id);
    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = {
        ...conversation.messages[messageIndex],
        ...updates
      };
      await this.updateConversation(conversation.id, {
        messages: conversation.messages
      });
    }
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    conversation.messages = conversation.messages.filter(m => m.id !== messageId);
    await this.updateConversation(conversationId, {
      messages: conversation.messages
    });
  }

  updateAgentContext(updates: Partial<AgentContext>): void {
    this.agentContext = {
      ...this.agentContext,
      ...updates
    };
  }

  clearContext(): void {
    this.agentContext.memory = {};
    this.agentContext.specialty = 'general';
  }

  searchConversations(query: string): Conversation[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.conversations.values()).filter(conv =>
      conv.title.toLowerCase().includes(lowercaseQuery) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(lowercaseQuery))
    );
  }

  getConversationByTopic(topic: string): Conversation[] {
    const topicKeywords = topic.toLowerCase().split(' ');
    return Array.from(this.conversations.values()).filter(conv => {
      const content = conv.messages.map(m => m.content).join(' ').toLowerCase();
      return topicKeywords.some(keyword => content.includes(keyword));
    });
  }

  exportConversation(id: string): string {
    const conversation = this.conversations.get(id);
    if (!conversation) return '';

    return JSON.stringify({
      ...conversation,
      exportedAt: new Date().toISOString(),
      exportedBy: this.userId
    }, null, 2);
  }

  exportAllConversations(): string {
    return JSON.stringify({
      userId: this.userId,
      conversations: Array.from(this.conversations.values()),
      currentConversationId: this.currentConversationId,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  private generateConversationTitle(content?: string): string {
    if (content) {
      const words = content.split(' ').slice(0, 5).join(' ');
      return words.length > 40 ? words.substring(0, 40) + '...' : words;
    }
    const now = new Date();
    return `Medical Consultation - ${now.toLocaleDateString()}`;
  }

  private extractAndStoreContextInfo(content: string): void {
    // Extract patient name
    const nameMatch = content.match(/(?:my name is|i am|i'm)\s+([a-zA-Z\s]+)/i);
    if (nameMatch && !this.agentContext.memory.patientName) {
      this.agentContext.memory.patientName = nameMatch[1].trim();
    }

    // Extract symptoms for context
    const symptomKeywords = ['pain', 'fever', 'cough', 'headache', 'rash', 'dizzy', 'nausea', 'vomit', 'swollen', 'fatigue'];
    const foundSymptoms = symptomKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    );

    if (foundSymptoms.length > 0) {
      this.agentContext.memory.previousSymptoms = [
        ...(this.agentContext.memory.previousSymptoms || []),
        ...foundSymptoms
      ].slice(-10);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        conversations: Array.from(this.conversations.entries()),
        currentConversationId: this.currentConversationId,
        agentContext: this.agentContext,
        userId: this.userId
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save chat store to localStorage:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        const data = JSON.parse(stored);

        this.conversations = new Map(data.conversations || []);
        this.currentConversationId = data.currentConversationId;

        if (data.agentContext) {
          this.agentContext = { ...this.agentContext, ...data.agentContext };
        }

        // Convert dates back to Date objects
        this.conversations.forEach((conversation, id) => {
          conversation.createdAt = new Date(conversation.createdAt);
          conversation.updatedAt = new Date(conversation.updatedAt);
          conversation.messages = conversation.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
      }
    } catch (error) {
      console.warn('Failed to load chat store from localStorage:', error);
    }
  }
}

// Singleton instance
export const authenticatedChatStore = new AuthenticatedChatStoreImpl();