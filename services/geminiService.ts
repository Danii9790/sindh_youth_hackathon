// 'use server';

// import { GoogleGenAI } from "@google/genai";

// // Initialize the client using the server-side environment variable.
// // 'use server' at the top ensures this code only runs on the server.
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// /**
//  * Analyzes text symptoms using Gemini 3 Pro Preview
//  */
// export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: `
//         You are Dr. AI, a senior physician with 25 years of experience.
//         Analyze the following symptoms: "${symptoms}".
        
//         Provide a response in this EXACT format:
        
//         1. Most Likely Condition: [Name]
//         2. Safe OTC Medicines: [List 2-3 common options with dosage]
//         3. Home Remedies: [List 2 options]
//         4. Urgency Level: [Mild / Moderate / Urgent / Emergency]
//         5. Recommended Specialist: [Type]
        
//         DISCLAIMER: This is preliminary advice only. Always consult a qualified doctor.
//         End with: "Would you like to book an appointment now?"
//       `,
//       config: {
//         temperature: 0.7,
//       }
//     });
    
//     return response.text || "I apologize, I could not complete the analysis. Please consult a doctor immediately.";
//   } catch (error) {
//     console.error("Error analyzing symptoms:", error);
//     return "I am having trouble connecting to the medical database. Please describe your symptoms again or call emergency services if urgent.";
//   }
// };

// /**
//  * Analyzes a medical image or report using Gemini 2.5 Flash (optimized for multimodal)
//  */
// export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
//   try {
//     // We strip the data:image/...;base64, prefix if present for the API
//     const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: {
//         parts: [
//           {
//             inlineData: {
//               mimeType: 'image/jpeg', // Assuming jpeg/png compatible
//               data: cleanBase64
//             }
//           },
//           {
//             text: `You are an expert medical diagnostic assistant. 
//             Analyze this image (which may be a visual symptom like a rash, or a medical report). 
//             ${prompt}
            
//             Provide a detailed analysis including:
//             1. Observations from the image.
//             2. Potential medical context.
//             3. Analysis What the disease is & what the test report is negavtive or positive.
            
//             Keep the tone professional, calm, and reassuring. Always include a disclaimer that you are an AI.`
//           }
//         ]
//       }
//     });

//     return response.text || "Unable to analyze image.";
//   } catch (error) {
//     console.error("Error analyzing image:", error);
//     return "I could not process the image. Please ensure it is clear and try again.";
//   }
// };

// /**
//  * Chat function for general conversation and booking flow
//  */
// export const chatWithMediAI = async (history: {role: string, content: string}[], message: string): Promise<string> => {
//   try {
//     // Note: history is passed but we use a simple single-turn prompt for this demo logic.
//     // In a full implementation, you would map 'history' to the `contents` array or use `ai.chats.create`.
    
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: `
//         You are a helpful medical receptionist named "MediAI Receptionist".
        
//         Current User Message: "${message}"
        
//         Context: The user is chatting with a hospital triage bot.
//         If they want to book an appointment, guide them to use the "Book Appointment" button in the interface, 
//         or ask for their Name, Doctor preference, and Time to simulate a chat booking.
        
//         Keep responses short, warm, and professional.
//       `
//     });

//     return response.text || "I didn't catch that. Could you repeat?";
//   } catch (error) {
//     console.error("Chat error:", error);
//     return "I'm currently offline. Please try again later.";
//   }
// };

'use server';

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* ============================================================
   1️⃣ TEXT-BASED SYMPTOM ANALYSIS (Gemini 2.5 Flash)
   ============================================================ */
export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      contents: `
        You are **Dr. AI**, a senior physician with 25 years experience.
        Your job is to analyze the following symptoms clearly:

        Symptoms: "${symptoms}"

        Follow this EXACT output format:

        1. Most Likely Condition: ...
        2. Safe OTC Medicines: ...
        3. Home Remedies: ...
        4. Urgency Level: ...
        5. Recommended Specialist: ...

        Rules:
        - Keep answers simple.
        - No complex medical terms.
        - No long paragraphs.
        - Add a disclaimer at the end.
        - End with: "Would you like to book an appointment now?"
      `,

      config: {
        temperature: 0.4,   // more accurate
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 400,
      }
    });

    return response.text ||
      "I apologize, I couldn't analyze the symptoms.";
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    return "I am having trouble right now. Please try again.";
  }
};



/* ============================================================
   2️⃣ IMAGE ANALYSIS (Multimodal)
   ============================================================ */
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(",")[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `
              You are an Expert Medical Imaging Assistant.
              Analyze the image and follow these steps:

              1. What do you observe? (simple words)
              2. Possible medical meaning.
              3. Is this positive or negative (if report)?
              4. Give helpful guidance.
              5. Add a safety disclaimer.

              User prompt: ${prompt}
            `
          }
        ]
      },

      config: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 500,
      }
    });

    return response.text || "Could not analyze this image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Image processing failed. Please try again.";
  }
};



/* ============================================================
   3️⃣ CHAT ASSISTANT (Context-Aware Medical Assistant)
   ============================================================ */
export const chatWithMediAI = async (
  history: { role: string; content: string }[],
  message: string
): Promise<string> => {
  try {
    // Build conversation context
    const conversationHistory = history.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      contents: `You are MediAI, an advanced medical AI assistant. You are compassionate, professional, and always prioritize patient safety.

Recent conversation context:
${conversationHistory}

Current user message: "${message}"

Guidelines:
- Provide helpful, medically-informed responses
- Be empathetic and professional
- Always include appropriate disclaimers
- For emergencies, advise calling emergency services
- If appointment booking is needed, guide through the process
- Consider previous context in your responses
- Keep responses concise but comprehensive

Remember: You are not a substitute for professional medical care, but you can provide helpful guidance and support.`,

      config: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 800
      }
    });

    return response.text || "I apologize, but I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm experiencing technical difficulties right now. Please try again in a moment, or contact emergency services if this is an urgent medical matter.";
  }
};
