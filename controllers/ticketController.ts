import { Request, Response } from 'express';
import { Ticket } from '../models/Ticket';
import crypto from 'crypto';

export const ticketController = {
  /**
   * Book a new ticket
   */
  async bookTicket(req: Request, res: Response) {
    try {
      const { matchId, matchName, stadiumName, category, quantity } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const tickets = [];
      const generatedTicketIds = [];

      for (let i = 0; i < quantity; i++) {
        // Generate a random ticket number
        const ticketNumber = `FWC26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // Data to be encoded in the QR code
        const qrCodeData = JSON.stringify({
          tId: ticketNumber,
          mId: matchId,
          uId: userId.toString(),
          c: category
        });

        const newTicket = await Ticket.create({
          ticketNumber,
          userId,
          matchId,
          matchName,
          stadiumName,
          seatBlock: String.fromCharCode(65 + Math.floor(Math.random() * 8)), // Random block A-H
          seatRow: String(Math.floor(Math.random() * 30) + 1),
          seatNumber: String(Math.floor(Math.random() * 100) + 1),
          gateEntry: `Gate ${Math.floor(Math.random() * 10) + 1}`,
          category,
          isAccessible: false,
          isUsed: false,
          validFrom: new Date(), // In reality, fetch from match details
          validUntil: new Date(Date.now() + 86400000), // Next day
          qrCodeData,
          bookingStatus: 'confirmed' // Auto confirm for now
        });

        tickets.push(newTicket);
        generatedTicketIds.push(newTicket.ticketNumber);
      }

      res.status(201).json({
        success: true,
        message: 'Tickets booked successfully',
        data: tickets,
      });

    } catch (error: any) {
      console.error('[Ticket] Book Ticket Error:', error);
      res.status(500).json({ success: false, message: 'Failed to book tickets', error: error.message });
    }
  },

  /**
   * Get my active tickets
   */
  async getMyTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      // Fetch confirmed tickets that haven't been used yet
      const tickets = await Ticket.find({ 
        userId, 
        bookingStatus: 'confirmed',
        isUsed: false
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error: any) {
      console.error('[Ticket] Get My Tickets Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch tickets', error: error.message });
    }
  },
};
