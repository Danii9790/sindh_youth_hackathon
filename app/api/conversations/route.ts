import { NextRequest, NextResponse } from 'next/server';
import { ConversationDatabaseService } from '@/services/conversationDatabaseService';

// GET: Get all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (!userId && !conversationId) {
      return NextResponse.json({ error: 'userId or conversationId is required' }, { status: 400 });
    }

    if (conversationId) {
      // Get specific conversation
      const conversation = await ConversationDatabaseService.getConversation(conversationId);
      return NextResponse.json({ conversation });
    } else {
      // Get all conversations for user
      const conversations = await ConversationDatabaseService.getConversations(userId!);
      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Error in GET /api/conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstMessage } = body;

    if (!userId || !firstMessage) {
      return NextResponse.json({ error: 'userId and firstMessage are required' }, { status: 400 });
    }

    const conversation = await ConversationDatabaseService.createConversation(userId, firstMessage);
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error in POST /api/conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update conversation (title or archive status)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, action, value } = body;

    if (!conversationId || !action) {
      return NextResponse.json({ error: 'conversationId and action are required' }, { status: 400 });
    }

    let result = false;

    switch (action) {
      case 'updateTitle':
        result = await ConversationDatabaseService.updateConversationTitle(conversationId, value);
        break;
      case 'archive':
        result = await ConversationDatabaseService.archiveConversation(conversationId, value);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Error in PUT /api/conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const result = await ConversationDatabaseService.deleteConversation(conversationId);
    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Error in DELETE /api/conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}