import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyD_xI_TNAXLeI2IloqvVnfIeDu7mNk0Cc8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getEventNameSuggestions = async (input) => {
  try {
    const prompt = `As an expert event naming consultant, generate 5 creative and impactful event names for a college/university setting based on this input: "${input}".

Consider these categories and their typical naming patterns:
- Technical Events: Use words like 'Hackathon', 'Tech', 'Code', 'Innovation'
- Gaming Events: Include terms like 'Championship', 'League', 'Arena', 'Showdown'
- Cultural Events: Incorporate words like 'Fest', 'Carnival', 'Celebration'
- Academic Events: Use terms like 'Symposium', 'Summit', 'Conference'
- Sports Events: Include words like 'Tournament', 'Challenge', 'Cup'
- Professional Events: Use terms like 'Conclave', 'Forum', 'Summit'

Guidelines:
- Make names memorable and catchy
- Include relevant industry buzzwords when appropriate
- Keep each name under 50 characters
- Ensure names are professional and appropriate for academic settings
- Consider trendy and contemporary naming patterns
- If the input relates to gaming, prioritize gaming-specific terminology
- Add dynamic words like 'Ultimate', 'Prime', 'Elite' when relevant
- Include the year or version number if appropriate (e.g., 'CodeFest 2024')

Format the response as a simple comma-separated list of event names without any additional text or explanations.

Example Response Format:
TechVista 2024, CodeCraft Championship, Innovation Summit, Digital Dreamscape, Future Forward Forum

Here the given input is not good enough to generate suggestions.`;

    const result = await model.generateContent(prompt);
    return result.response.text()
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [];
  }
};

export const generateEventDescription = async (brief) => {
  try {
    const prompt = `Create a professional and engaging event description for a college/university event based on this brief: "${brief}"

Guidelines:
- Start with a compelling introduction
- Highlight key features and benefits
- Include target audience and prerequisites if applicable
- Maintain professional academic tone
- Keep it concise (100-150 words)
- End with a clear call to action

Example structure:
- What the event is
- Why it matters
- What participants will gain
- Key highlights
- Practical details (if provided)
- Call to action

Make it engaging while maintaining formality.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating description:', error);
    throw error;
  }
};

export default {
  getEventNameSuggestions,
  generateEventDescription
};