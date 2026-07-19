import { Request, Response } from 'express';
import { getAIResponse } from '../services/aiService';

export const aiController = {
  /**
   * Handles a stadium companion chat message
   * POST /api/ai/chat
   * Body: { message: string, history?: [{ role, content }] }
   */
  async chat(req: Request, res: Response) {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string.',
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep your question under 500 characters.',
      });
    }

    console.log(`[AI Controller] Chat request from user ${req.user?.userId || 'anonymous'}`);

    try {
      const reply = await getAIResponse(message.trim(), history);
      return res.status(200).json({ success: true, data: { reply } });
    } catch (error: any) {
      console.error('[AI Controller] Error:', error.message);
      return res.status(503).json({
        success: false,
        message: error.message || 'AI service is currently unavailable. Please try again.',
      });
    }
  },
};
