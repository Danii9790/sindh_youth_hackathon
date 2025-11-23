import { NextRequest, NextResponse } from 'next/server';
import { chatWithMediAI } from '@/services/openai_model';

export async function POST(request: NextRequest) {
  try {
    const { history, message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await chatWithMediAI(history || [], message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
