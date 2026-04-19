import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY
});

export async function checkInteractions(medicines, patient) {
    if (!medicines.length) return "No medicines to check.";

    const medNames = medicines.map(m => m.name).join(', ');
    const prompt = `
    Analyze the following list of medicines for potential drug-drug interactions.
    Also consider the patient's age (${patient?.age || 'Unknown'}) and gender (${patient?.gender || 'Unknown'}).
    
    Medicines: ${medNames}
    
    Provide a concise summary of any significant interactions. 
    If there are no significant interactions, state that clearly.
    Format the response as a simple list or short paragraph.
    Do not include a disclaimer about consulting a doctor, as this is a tool for doctors.
  `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error checking interactions:", error);
        return "Failed to check interactions. Please try again.";
    }
}
