import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

// AI chat is available to guests too (so fans without login can still ask questions)
// but we attach user info if they are logged in
router.post('/chat', optionalAuthenticate, aiController.chat);

export default router;
