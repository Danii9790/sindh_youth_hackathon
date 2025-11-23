import { NextRequest, NextResponse } from 'next/server';
import { ConversationDatabaseService } from '@/services/conversationDatabaseService';

// GET: Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const messages = await ConversationDatabaseService.getConversationMessages(conversationId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, sender, fileName, fileType, fileSize } = body;

    if (!conversationId || !content || !sender) {
      return NextResponse.json({ error: 'conversationId, content, and sender are required' }, { status: 400 });
    }

    const message = await ConversationDatabaseService.createMessage(
      conversationId,
      content,
      sender,
      fileName,
      fileType,
      fileSize
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}