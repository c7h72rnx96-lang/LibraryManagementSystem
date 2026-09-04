import cron from "node-cron";
import { Op } from "sequelize";
import { Cart, CartItem, User, OrderItem, Book } from "../models/index.js";
import {
  sendAbandonedCartEmail,
  sendReviewNudgeEmail,
} from "../config/mailer.js";

export const startRetentionJobs = () => {
  // ---------------------------------------------------------
  // JOB 1: ABANDONED CART RECOVERY (Runs every day at 10:00 AM)
  // ---------------------------------------------------------
  cron.schedule("0 10 * * *", async () => {
    console.log("⏳ [CRON] Running Abandoned Cart Recovery Job...");
    try {
      // Find carts updated between 24 and 48 hours ago
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const abandonedCarts = await Cart.findAll({
        where: {
          updatedAt: { [Op.between]: [fortyEightHoursAgo, twentyFourHoursAgo] },
        },
        include: [
          { model: User, attributes: ["email", "username"] },
          { model: CartItem, required: true }, // 'required: true' means it MUST have items
        ],
      });

      let emailsSent = 0;
      for (const cart of abandonedCarts) {
        if (cart.User && cart.CartItems.length > 0) {
          await sendAbandonedCartEmail(
            cart.User.email,
            cart.User.username,
            cart.CartItems.length,
          );
          emailsSent++;
        }
      }
      console.log(`✅ [CRON] Sent ${emailsSent} abandoned cart reminders.`);
    } catch (error) {
      console.error("❌ [CRON] Abandoned Cart Error:", error);
    }
  });

  // ---------------------------------------------------------
  // JOB 2: POST-PURCHASE REVIEW NUDGE (Runs every day at 2:00 PM)
  // ---------------------------------------------------------
  cron.schedule("0 14 * * *", async () => {
    console.log("⏳ [CRON] Running Review Nudge Job...");
    try {
      // Find items marked as "Delivered" exactly between 7 and 8 days ago
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      const deliveredItems = await OrderItem.findAll({
        where: {
          itemStatus: "Delivered",
          updatedAt: { [Op.between]: [eightDaysAgo, sevenDaysAgo] },
        },
        include: [{ model: Book, attributes: ["id", "title"] }],
      });

      let nudgesSent = 0;
      for (const item of deliveredItems) {
        const order = await item.getOrder({ include: [User] });
        if (order && order.User) {
          await sendReviewNudgeEmail(
            order.User.email,
            order.User.username,
            item.Book.title,
            item.Book.id,
          );
          nudgesSent++;
        }
      }
      console.log(`✅ [CRON] Sent ${nudgesSent} review nudges.`);
    } catch (error) {
      console.error("❌ [CRON] Review Nudge Error:", error);
    }
  });

  console.log("⚙️  Background Retention Jobs Initialized.");
};
