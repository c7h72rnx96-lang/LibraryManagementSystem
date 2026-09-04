// === src/routes/supportRoutes.js ===
import express from "express";
import {
  createTicket,
  getAllTickets, // <-- UPDATED
  getTicketMessages,
  sendMessage,
  closeTicket,
} from "../controllers/supportController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

// 🔥 Unified endpoint handles routing logic based on token!
router.get("/tickets", getAllTickets);

router.post("/", createTicket);
router.get("/:id/messages", getTicketMessages);
router.post("/:id/messages", sendMessage);
router.put("/:id/close", closeTicket);

export default router;
