
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Rate limiting to prevent quota exhaustion
const requestCache = new Map<string, { timestamp: number; count: number }>();
const QUOTA_LIMITS = {
  REQUESTS_PER_MINUTE: parseInt(process.env.GEMINI_REQUESTS_PER_MINUTE || '15'),  // Conservative limit for free tier
  REQUESTS_PER_HOUR: 100,   // Daily quota spread across hours
  COOLDOWN_PERIOD: 60000    // 1 minute cooldown when approaching limits
};

// Enhanced rate limiting function
function checkRateLimit(): { allowed: boolean; waitTime?: number; fallbackMessage?: string } {
  // Check if rate limiting is disabled
  if (process.env.GEMINI_RATE_LIMIT_ENABLED !== 'true') {
    return { allowed: true };
  }

  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window

  // Clean old entries
  for (const [key, data] of requestCache.entries()) {
    if (data.timestamp < windowStart) {
      requestCache.delete(key);
    }
  }

  // Count recent requests
  const recentRequests = Array.from(requestCache.values()).filter(
    data => data.timestamp >= windowStart
  ).length;

  if (recentRequests >= QUOTA_LIMITS.REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      waitTime: 60000,
      fallbackMessage: "I'm experiencing high demand and have reached my usage limit for this minute. Please wait a moment before trying again."
    };
  }

  // Track this request
  const requestKey = now.toString();
  requestCache.set(requestKey, { timestamp: now, count: 1 });

  return { allowed: true };
}

// Fallback responses for when AI is unavailable
const FALLBACK_RESPONSES = {
  greeting: [
    "Hello! I'm MediAI, your medical assistant. I'm currently experiencing high demand, but I'm here to help with basic questions. For urgent medical concerns, please contact emergency services.",
    "Hi there! I'm MediAI. Due to high demand, my AI capabilities are temporarily limited. How can I assist you with general health information today?"
  ],
  symptoms: [
    "I understand you're experiencing symptoms. Due to current usage limits, I recommend: 1) Monitoring your symptoms closely, 2) Consulting a healthcare professional for personalized advice, 3) Calling emergency services if symptoms are severe. Would you like help booking an appointment?",
    "For symptom analysis, I'm currently experiencing high demand. Please consult with a qualified healthcare provider for proper medical evaluation. If this is an emergency, please call emergency services immediately."
  ],
  general: [
    "I'm currently experiencing high demand and have reached my usage limit. Please try again in a few hours. For medical concerns, please consult with a healthcare professional.",
    "Due to overwhelming demand, my AI services are temporarily unavailable. Please try again later or speak with a healthcare professional for your medical needs."
  ],
  appointment: [
    "I'd be happy to help you book an appointment! You can use the Book Appointment button in the interface, or tell me your preferred doctor type and time slot.",
    "For appointment booking, please use the Book Appointment feature or let me know what type of specialist you need and your preferred time."
  ],
  emergency: [
    "If this is a medical emergency, please call emergency services immediately or go to the nearest emergency room. Do not wait for AI assistance.",
    "For emergency medical situations, please contact emergency services right away at [emergency number] or go to your nearest hospital."
  ]
};

function getFallbackResponse(message: string, history: any[] = []): string {
  const lowerMessage = message.toLowerCase();

  // Check for emergency keywords
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') ||
      lowerMessage.includes('chest pain') || lowerMessage.includes('difficulty breathing') ||
      lowerMessage.includes('severe') || lowerMessage.includes('bleeding')) {
    return FALLBACK_RESPONSES.emergency[Math.floor(Math.random() * FALLBACK_RESPONSES.emergency.length)];
  }

  // Check for appointment related
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') ||
      lowerMessage.includes('schedule') || lowerMessage.includes('doctor')) {
    return FALLBACK_RESPONSES.appointment[Math.floor(Math.random() * FALLBACK_RESPONSES.appointment.length)];
  }

  // Check for symptom description
  if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') ||
      lowerMessage.includes('hurt') || lowerMessage.includes('feeling') ||
      lowerMessage.includes('sick')) {
    return FALLBACK_RESPONSES.symptoms[Math.floor(Math.random() * FALLBACK_RESPONSES.symptoms.length)];
  }

  // Check for greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') ||
      lowerMessage.includes('hey') || history.length === 0) {
    return FALLBACK_RESPONSES.greeting[Math.floor(Math.random() * FALLBACK_RESPONSES.greeting.length)];
  }

  // Default response
  return FALLBACK_RESPONSES.general[Math.floor(Math.random() * FALLBACK_RESPONSES.general.length)];
}

/* ============================================================
   1️⃣ TEXT-BASED SYMPTOM ANALYSIS (Gemini 1.5 Flash)
   ============================================================ */
export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
  // Check rate limit first
  const rateLimitResult = checkRateLimit();
  if (!rateLimitResult.allowed) {
    return rateLimitResult.fallbackMessage || "Please try again in a moment.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 400,
      }
    });

    const prompt = `You are **Dr. AI**, a senior physician with 25 years of clinical experience.
Your job is to carefully analyze the patient's symptoms and give clear, helpful medical guidance.

Patient Symptoms: "${symptoms}"

Follow this EXACT structured format:

1. Most Likely Condition:
   - Give one simple and clear possibility.
   - Add 1–2 alternative possibilities if needed.

2. Suggested Medicines (OTC):
   - Give safe over-the-counter medicines.
   - Explain dosage in simple words.
   - Mention if a medicine should NOT be taken with certain conditions.

3. Helpful Home Remedies:
   - List 2–4 easy remedies the patient can try at home.

4. What You Should Do Now:
   - Give step-by-step advice.
   - Explain when they should visit a doctor.

5. Urgency Level:
   - Choose one: Low / Moderate / High

6. Recommended Specialist:
   - Suggest the correct doctor type.

Rules:
- Use simple language.
- No heavy medical terms.
- No long paragraphs.
- Make the answer friendly and supportive.
- Add a safety disclaimer at the end.
- End with: "Would you like to book an appointment now?"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "I apologize, I couldn't analyze the symptoms.";
  } catch (error: any) {
    console.error("Error analyzing symptoms:", error);

    // Handle specific API quota error
    const errorMessage = error?.message || error?.toString() || '';
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      return "I'm currently experiencing high demand and have reached my usage limit. Please try again in a few hours, or consult with a healthcare professional for immediate concerns.";
    }

    return "I am having trouble connecting to the medical analysis service right now. Please try again later or consult a healthcare professional if you have immediate concerns.";
  }
};



/* ============================================================
   2️⃣ IMAGE ANALYSIS (Multimodal)
   ============================================================ */
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  // Check rate limit first (image processing uses more quota)
  const rateLimitResult = checkRateLimit();
  if (!rateLimitResult.allowed) {
    return rateLimitResult.fallbackMessage || "Please try again in a moment for image analysis.";
  }

  try {
    const cleanBase64 = base64Image.split(",")[1] || base64Image;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 500,
      }
    });

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/jpeg"
      }
    };

    const textPart = `
You are an **Expert Medical Imaging Specialist** with deep experience in X-rays, scans, lab reports, and medical images.

Analyze the uploaded image/report and follow this exact structure:

1. What I See:
   - Describe what is visible in simple, everyday words.

2. Possible Medical Meaning:
   - Explain what these findings may indicate in clear, basic language.

3. Most Likely Disease / Condition:
   - Mention the SINGLE most likely condition based on the image/report.
   - Add 1–2 other possibilities if needed.
   - Keep it simple and never sound 100% certain.

4. Is This Positive or Negative? (for reports/labs)
   - Clearly say if results look normal or abnormal.

5. Suggested Medicines (OTC Only):
   - Give safe over-the-counter options only when appropriate.
   - Provide simple dosage hints (e.g., "take 1 tablet if needed").
   - Do NOT prescribe antibiotics or strong medicines.

6. What You Should Do Now:
   - Provide calm, easy-to-follow steps.
   - Mention when the patient should see a doctor.
   - Mention any warning signs to watch for.

7. Safety Notes:
   - Add a short disclaimer stating that this analysis may not be fully accurate
     and does not replace a real medical professional.

User prompt: ${prompt}

Keep the explanation short, friendly, and easy to understand.
`;

    const result = await model.generateContent([textPart, imagePart]);
    const response = await result.response;
    const text = response.text();

    return text || "Could not analyze this image.";
  } catch (error: any) {
    console.error("Error analyzing image:", error);

    // Handle specific API quota error
    const errorMessage = error?.message || error?.toString() || '';
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      return "I'm currently experiencing high demand and have reached my usage limit for image analysis. Please try again in a few hours, or consult with a healthcare professional for immediate concerns.";
    }

    return "Image processing failed. Please try again later or ensure the image is clear and properly formatted.";
  }
};



/* ============================================================
   3️⃣ CHAT ASSISTANT (Context-Aware Medical Assistant)
   ============================================================ */
export const chatWithMediAI = async (
  history: { role: string; content: string }[],
  message: string
): Promise<string> => {
  // Check rate limit first
  const rateLimitResult = checkRateLimit();
  if (!rateLimitResult.allowed) {
    return getFallbackResponse(message, history);
  }

  try {
    // Build conversation context
    const conversationHistory = history.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 800
      }
    });

    const prompt = `You are MediAI, a compassionate and highly skilled medical AI assistant. 
You give safe, friendly, and medically accurate guidance.

Recent conversation context:
${conversationHistory}

Current user message: "${message}"

Your Responsibilities:
- Understand the user's symptoms or concerns.
- Give clear and helpful medical advice.
- Suggest OTC medicines when safe.
- Suggest home remedies when helpful.
- Encourage healthy behavior and care.
- If needed, recommend booking an appointment.
- If the situation sounds dangerous, tell the user to call emergency services.
- Keep language simple, calm, and supportive.
- Never diagnose with 100% certainty—explain possibilities.
- Add a safety disclaimer at the end of each medical response.

Style:
- Be empathetic like a caring doctor.
- Keep answers short and clear.
- Consider previous messages to stay on-topic.

Remember:
You provide guidance but are NOT a replacement for a real doctor.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "I apologize, but I couldn't process that request. Please try again.";
  } catch (error: any) {
    console.error("Chat error:", error);

    // Handle specific API quota error with fallback response
    const errorMessage = error?.message || error?.toString() || '';
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      return getFallbackResponse(message, history);
    }

    return "I'm experiencing technical difficulties right now. Please try again in a moment, or contact emergency services if this is an urgent medical matter.";
  }
};
