import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getConversations,
  getPartners,
  getHistory,
  getAdminInfo,
  getUnreadCount,
} from "../controllers/chatController.js";

const router = Router();

router.use(authenticate);

router.get("/conversations", getConversations);
router.get("/partners", getPartners);
router.get("/history/:partnerId", getHistory);
router.get("/admin", getAdminInfo);
router.get("/unread", getUnreadCount);
export default router;
