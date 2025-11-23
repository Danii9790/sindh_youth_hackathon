import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Use the real Gemini AI service for image analysis
    const analysis = await analyzeImage(image, prompt || 'Please analyze this medical image and provide your insights.');

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}