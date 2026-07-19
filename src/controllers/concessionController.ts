import { Request, Response } from 'express';
import { FoodOrder } from '../models/FoodOrder';

export const concessionController = {
  /**
   * Place a new food order
   */
  async placeOrder(req: Request, res: Response) {
    try {
      const { items, subtotal, total } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order must contain items' });
      }

      const order = await FoodOrder.create({
        userId,
        items,
        subtotal,
        total,
        status: 'preparing',
        paymentStatus: 'completed'
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
      });
    } catch (error: any) {
      console.error('[Concession] Place Order Error:', error);
      res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
    }
  },

  /**
   * Get user's order history
   */
  async getMyOrders(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const orders = await FoodOrder.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      console.error('[Concession] Get Orders Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
  },
};
