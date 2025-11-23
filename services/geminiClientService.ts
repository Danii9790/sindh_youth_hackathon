// Client-side service for Gemini AI interactions
// This file calls the API routes which then use the server-side geminiService

export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
  try {
    const response = await fetch('/api/ai/analyze-symptoms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
};

export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/ai/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        prompt
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const chatWithMediAI = async (history: { role: string; content: string }[], message: string): Promise<string> => {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        message
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};