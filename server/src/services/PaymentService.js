import { sequelize } from "../config/database.js";
import Stripe from "stripe";
import { Order, User } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { PAYMENT_STATUS, ORDER_STATUS } from "../constants/appConstants.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_12345");

export const PaymentService = {
  async createCheckoutSession(orderId, frontendUrl) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new AppError("Order not found", 404);

    // Developer Bypass for testing without Stripe API Keys
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        "⚠️ No real Stripe key found. Simulating successful payment.",
      );
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.orderStatus = ORDER_STATUS.PROCESSING;
      await order.save();
      return {
        url: `${frontendUrl}/orders?payment=success&orderId=${order.id}`,
      };
    }

    const amountInCents = Math.round(Number(order.grandTotal) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `LibraryMS Order #${order.id}`,
              description: `Payment for ${order.fullName}'s book order.`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id.toString() },
      success_url: `${frontendUrl}/orders?payment=success&orderId=${order.id}`,
      cancel_url: `${frontendUrl}/checkout?payment=cancelled`,
    });

    return { url: session.url };
  },

  async processWebhook(body, signature, endpointSecret) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      // Secure Idempotent Transaction
      const transaction = await sequelize.transaction();
      try {
        const order = await Order.findByPk(orderId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
          order.paymentStatus = PAYMENT_STATUS.PAID;
          order.orderStatus = ORDER_STATUS.PROCESSING;
          await order.save({ transaction });
          console.log(
            `✅ Order #${order.id} securely marked as Paid via Webhook.`,
          );
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw new AppError("Database error during webhook processing", 500);
      }
    }
    return { received: true };
  },
};
