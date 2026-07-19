import { Router } from 'express';
import { ticketController } from '../controllers/ticketController';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/book', ticketController.bookTicket);
router.get('/my-tickets', ticketController.getMyTickets);

export default router;
