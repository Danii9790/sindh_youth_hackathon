-- =====================================================
-- MediAI Pro - Conversations & Messages Tables Schema
-- Database: PostgreSQL (Neon)
-- Created: 2025-11-22
-- =====================================================

-- Drop tables if they exist (for fresh creation)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
    -- Primary Identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User Information
    user_id VARCHAR(255) NOT NULL,                     -- Clerk User ID

    -- Conversation Details
    title VARCHAR(255) NOT NULL,
    message_count INTEGER DEFAULT 0,
    last_message TEXT,

    -- Status
    is_archived BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints and Indexes
    CONSTRAINT conversations_user_id_check CHECK (user_id IS NOT NULL AND length(user_id) > 0)
);

-- Create messages table
CREATE TABLE messages (
    -- Primary Identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Message Content
    content TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),

    -- Optional file attachment
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints and Indexes
    CONSTRAINT messages_content_check CHECK (content IS NOT NULL AND length(content) > 0)
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_is_archived ON conversations(is_archived);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_sender ON messages(sender);

-- Create a trigger to automatically update the conversation's updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP,
        message_count = (SELECT COUNT(*) FROM messages WHERE conversation_id = NEW.conversation_id),
        last_message = NEW.content
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Create a trigger to update message count when messages are deleted
CREATE OR REPLACE FUNCTION update_conversation_on_message_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP,
        message_count = (SELECT COUNT(*) FROM messages WHERE conversation_id = OLD.conversation_id),
        last_message = (SELECT content FROM messages WHERE conversation_id = OLD.conversation_id ORDER BY created_at DESC LIMIT 1)
    WHERE id = OLD.conversation_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message_delete
    AFTER DELETE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message_delete();

-- Insert sample conversation with messages for testing
DO $$
DECLARE
    conv_id UUID;
BEGIN
    -- Insert sample conversation
    INSERT INTO conversations (
        user_id,
        title,
        is_archived
    ) VALUES (
        'user_35npFOqQxE1Q0o7OCoyeUHVTmhw',
        'Skin rash consultation',
        FALSE
    ) RETURNING id INTO conv_id;

    -- Insert sample messages for the conversation
    INSERT INTO messages (
        conversation_id,
        content,
        sender
    ) VALUES
    (
        conv_id,
        'Hello! I''m experiencing some skin issues and would like your advice.',
        'user'
    ),
    (
        conv_id,
        'Hello! I''d be happy to help you with your skin concerns. Could you please describe what you''re experiencing? Is there a rash, irritation, or any specific symptoms?',
        'bot'
    );
END $$;

-- Output success message
SELECT 'Conversations and messages tables created successfully!' as message,
       (SELECT COUNT(*) FROM conversations) as conversations_created,
       (SELECT COUNT(*) FROM messages) as messages_created;