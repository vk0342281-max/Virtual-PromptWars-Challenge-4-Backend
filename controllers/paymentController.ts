import { Request, Response } from 'express';
// import Razorpay from 'razorpay';
import { PaymentRecord } from '../models/PaymentRecord';
import crypto from 'crypto';

// Commenting out actual Razorpay instantiation to avoid errors if env vars are missing during demo
/*
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});
*/

export const paymentController = {
  /**
   * Initialize a payment order with Razorpay
   */
  async createOrder(req: Request, res: Response) {
    try {
      const { amount, currency = 'INR', type, orderId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      /* Uncomment this section to enable Razorpay order creation
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit
        currency,
        receipt: `receipt_${orderId}`,
      };

      const order = await razorpay.orders.create(options);

      // Save payment attempt to database
      const paymentRecord = await PaymentRecord.create({
        userId,
        orderId,
        razorpayOrderId: order.id,
        amount,
        currency,
        type,
        status: 'created',
      });

      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          recordId: paymentRecord._id,
        },
      });
      */

      // Mock response while Razorpay is disabled
      return res.status(200).json({
        success: true,
        data: {
          orderId: `mock_order_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency,
          recordId: `mock_record_${Date.now()}`,
        },
        message: 'Payment gateway disabled, returning mock order.'
      });

    } catch (error: any) {
      console.error('[Payment] Create Order Error:', error);
      res.status(500).json({ success: false, message: 'Failed to initiate payment', error: error.message });
    }
  },

  /**
   * Verify the payment signature from Razorpay
   */
  async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, recordId } = req.body;

      /* Uncomment this section to enable signature verification
      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        // Update record as failed
        await PaymentRecord.findByIdAndUpdate(recordId, {
          status: 'failed',
          razorpayPaymentId: razorpay_payment_id,
        });
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }

      // Payment successful
      await PaymentRecord.findByIdAndUpdate(recordId, {
        status: 'successful',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
      */

      // Mock response while Razorpay is disabled
      return res.status(200).json({ success: true, message: 'Payment bypassed (demo mode)' });

    } catch (error: any) {
      console.error('[Payment] Verification Error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
    }
  },
};
