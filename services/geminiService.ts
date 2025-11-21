'use server';

import { GoogleGenAI } from "@google/genai";

// Initialize the client using the server-side environment variable.
// 'use server' at the top ensures this code only runs on the server.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes text symptoms using Gemini 3 Pro Preview
 */
export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are Dr. AI, a senior physician with 25 years of experience.
        Analyze the following symptoms: "${symptoms}".
        
        Provide a response in this EXACT format:
        
        1. Most Likely Condition: [Name]
        2. Safe OTC Medicines: [List 2-3 common options with dosage]
        3. Home Remedies: [List 2 options]
        4. Urgency Level: [Mild / Moderate / Urgent / Emergency]
        5. Recommended Specialist: [Type]
        
        DISCLAIMER: This is preliminary advice only. Always consult a qualified doctor.
        End with: "Would you like to book an appointment now?"
      `,
      config: {
        temperature: 0.7,
      }
    });
    
    return response.text || "I apologize, I could not complete the analysis. Please consult a doctor immediately.";
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    return "I am having trouble connecting to the medical database. Please describe your symptoms again or call emergency services if urgent.";
  }
};

/**
 * Analyzes a medical image or report using Gemini 2.5 Flash (optimized for multimodal)
 */
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    // We strip the data:image/...;base64, prefix if present for the API
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png compatible
              data: cleanBase64
            }
          },
          {
            text: `You are an expert medical diagnostic assistant. 
            Analyze this image (which may be a visual symptom like a rash, or a medical report). 
            ${prompt}
            
            Provide a detailed analysis including:
            1. Observations from the image.
            2. Potential medical context.
            3. Recommended next steps.
            
            Keep the tone professional, calm, and reassuring. Always include a disclaimer that you are an AI.`
          }
        ]
      }
    });

    return response.text || "Unable to analyze image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "I could not process the image. Please ensure it is clear and try again.";
  }
};

/**
 * Chat function for general conversation and booking flow
 */
export const chatWithMediAI = async (history: {role: string, content: string}[], message: string): Promise<string> => {
  try {
    // Note: history is passed but we use a simple single-turn prompt for this demo logic.
    // In a full implementation, you would map 'history' to the `contents` array or use `ai.chats.create`.
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a helpful medical receptionist named "MediAI Receptionist".
        
        Current User Message: "${message}"
        
        Context: The user is chatting with a hospital triage bot.
        If they want to book an appointment, guide them to use the "Book Appointment" button in the interface, 
        or ask for their Name, Doctor preference, and Time to simulate a chat booking.
        
        Keep responses short, warm, and professional.
      `
    });

    return response.text || "I didn't catch that. Could you repeat?";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm currently offline. Please try again later.";
  }
};