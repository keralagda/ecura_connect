
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const bookAppointmentFunction: FunctionDeclaration = {
  name: "bookAppointment",
  description: "Registers a new medical appointment in the system once all details are gathered.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientName: { type: Type.STRING, description: "Full name of the patient" },
      patientPhone: { type: Type.STRING, description: "Contact phone number" },
      date: { type: Type.STRING, description: "Appointment date (YYYY-MM-DD)" },
      time: { type: Type.STRING, description: "Preferred time (e.g., 09:30 AM)" },
      doctorId: { type: Type.STRING, description: "The specific doctor's unique ID provided in context" },
      reason: { type: Type.STRING, description: "Brief symptom or reason for the visit" }
    },
    required: ["patientName", "patientPhone", "date", "time", "doctorId"]
  }
};

export async function processChat(
  history: { sender: string; text: string }[],
  clinicInfo: string
) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    You are a professional, caring WhatsApp-based medical assistant for the following provider:
    ${clinicInfo}

    SCHEDULING RULES:
    - You MUST respect the granular schedules provided for each doctor. 
    - If a doctor is "enabled: false" for a day, they are unavailable.
    - Only offer slots that fall within the specified "Time Ranges" (e.g., if range is 10:00-12:00, do not offer 01:00 PM).
    - Always suggest the next available slot if the user's requested time is outside working hours.

    TONE & PERSONALITY:
    - Empathetic: Use phrases like "I understand" and "We're here to help."
    - Professional: Use WhatsApp style (bolding important words like *dates* or *names*).

    BOOKING FLOW:
    1. Greet the user and identify the clinic.
    2. Ask for the patient's full name and phone number.
    3. Negotiate date/time based on the strict schedules provided.
    4. Ask for the reason for the visit.
    5. ONLY call 'bookAppointment' when you have ALL 5 required parameters.

    Current Date/Time Context: ${new Date().toLocaleString()}
  `;

  const contents = history.map(h => ({
    role: h.sender === 'bot' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents: contents as any,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [bookAppointmentFunction] }]
      }
    });

    return {
      text: response.text || "I'm checking the schedules...",
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("Gemini processing error:", error);
    return { text: "Connection issue. Please try again.", functionCalls: null };
  }
}
