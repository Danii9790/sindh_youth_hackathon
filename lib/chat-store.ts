export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image';
    url: string;
    name: string;
  }>;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  context?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AgentContext {
  conversationId: string;
  systemPrompt: string;
  personality: 'professional' | 'friendly' | 'clinical';
  specialty: 'general' | 'symptoms' | 'image_analysis' | 'booking';
  memory: {
    patientName?: string;
    previousSymptoms?: string[];
    appointments?: Array<{
      doctor: string;
      date: string;
      time: string;
    }>;
  };
}

export interface ChatStore {
  conversations: Map<string, Conversation>;
  currentConversationId: string | null;
  agentContext: AgentContext;

  // Conversation management
  createConversation(title?: string): string;
  getCurrentConversation(): Conversation | null;
  setCurrentConversation(id: string): void;
  updateConversation(id: string, updates: Partial<Conversation>): void;
  deleteConversation(id: string): void;

  // Message management
  addMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): void;
  updateMessage(id: string, updates: Partial<ConversationMessage>): void;
  deleteMessage(conversationId: string, messageId: string): void;

  // Context management
  updateAgentContext(updates: Partial<AgentContext>): void;
  clearContext(): void;

  // Persistence
  saveToStorage(): void;
  loadFromStorage(): void;
  exportConversation(id: string): string;
}