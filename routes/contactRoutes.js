import { Router } from "express";
import { sendMessage, getAllMessages } from '../controllers/contactController.js';

const router = Router();

// POST route for user to send message
router.post('/send', sendMessage);

// GET route for admin to view all messages
router.get('/admin/messages', getAllMessages);

export default router;
