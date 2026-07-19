import { Router } from 'express';
import { concessionController } from '../controllers/concessionController';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/order', concessionController.placeOrder);
router.get('/my-orders', concessionController.getMyOrders);

export default router;
