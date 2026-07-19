import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

// ─── System Prompt ──────────────────────────────────────────────────────────
const STADIUM_SYSTEM_PROMPT = `You are StadiumIQ AI, an intelligent stadium companion assistant for the FIFA World Cup 2026 at MetLife Stadium.

Your role is to help fans with:
- Navigation: gate entries, seating sections, restrooms, first aid, exits
- Food & Beverages: concession locations, menu items, wait times, pre-order info
- Tickets: ticket types, entry procedures, seat categories
- Accessibility: accessible entrances, elevators, companion seating
- Event Information: match schedules, team info, kickoff times
- Emergency: nearest first aid station, security help, emergency exits
- Transport: parking, shuttle services, public transit

Guidelines:
- Be concise, helpful, and friendly.
- Keep answers under 150 words.
- Focus only on stadium and match-day related questions.
- If a question is entirely unrelated to the stadium/event, politely redirect.
- Use emojis sparingly to add warmth to responses.
- Stadium: MetLife Stadium, East Rutherford, New Jersey.`;

// ─── Groq Client (Primary) ───────────────────────────────────────────────────
let groqClient: Groq | null = null;
function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: config.groq.apiKey });
  }
  return groqClient;
}

// ─── Gemini Client (Fallback) ────────────────────────────────────────────────
let geminiClient: GoogleGenerativeAI | null = null;
function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return geminiClient;
}

// ─── Main AI Chat Function ───────────────────────────────────────────────────
export async function getAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  console.log(`[AI Service] Processing query: "${userMessage.substring(0, 80)}..."`);

  // Try Groq first (primary)
  try {
    console.log('[AI Service] Trying Groq (primary)...');
    const response = await callGroq(userMessage, conversationHistory);
    console.log('[AI Service] Groq responded successfully.');
    return response;
  } catch (groqError: any) {
    console.error('[AI Service] Groq failed:', groqError.message);
    console.log('[AI Service] Falling back to Gemini...');
  }

  // Fallback to Gemini
  try {
    const response = await callGemini(userMessage, conversationHistory);
    console.log('[AI Service] Gemini responded successfully.');
    return response;
  } catch (geminiError: any) {
    console.error('[AI Service] Gemini also failed:', geminiError.message);
    throw new Error('Both AI providers are currently unavailable. Please try again shortly.');
  }
}

// ─── Groq API Call ───────────────────────────────────────────────────────────
async function callGroq(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const groq = getGroqClient();

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: STADIUM_SYSTEM_PROMPT },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: config.groq.model,
    messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Groq returned empty response');
  return text.trim();
}

// ─── Gemini API Call ─────────────────────────────────────────────────────────
async function callGemini(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const gemini = getGeminiClient();
  const model = gemini.getGenerativeModel({ model: config.gemini.model });

  // Build a combined prompt with history for Gemini
  const contextMessages = history
    .map(h => `${h.role === 'user' ? 'Fan' : 'Assistant'}: ${h.content}`)
    .join('\n');

  const fullPrompt = `${STADIUM_SYSTEM_PROMPT}\n\n${contextMessages ? `Conversation so far:\n${contextMessages}\n\n` : ''}Fan: ${userMessage}\nAssistant:`;

  const result = await model.generateContent(fullPrompt);
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned empty response');
  return text.trim();
}
