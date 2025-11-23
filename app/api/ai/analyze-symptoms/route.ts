import { NextRequest, NextResponse } from 'next/server';
import { analyzeSymptoms } from '@/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    // Use the real Gemini AI service for symptom analysis
    const analysis = await analyzeSymptoms(symptoms);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}