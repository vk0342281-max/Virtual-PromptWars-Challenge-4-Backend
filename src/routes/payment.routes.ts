import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

export default router;
