// === src/controllers/paymentController.js ===
import Stripe from "stripe";
import { Order, OrderItem, User } from "../models/index.js";

// Initialize Stripe (In production, load this from process.env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_12345");

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔥 DEVELOPER BYPASS: If no real Stripe Key is set in .env, simulate a successful payment!
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        "⚠️ No real Stripe key found. Simulating successful payment redirect.",
      );

      // Manually update order since the Stripe Webhook won't fire in test mode
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      await order.save();

      return res.status(200).json({
        url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/orders?payment=success&orderId=${order.id}`,
      });
    }

    // --- REAL STRIPE LOGIC (Only runs if you add a key to .env later) ---
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
      metadata: {
        orderId: order.id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/orders?payment=success&orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout?payment=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Failed to initialize payment gateway" });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      const order = await Order.findByPk(orderId);
      if (order && order.paymentStatus !== "Paid") {
        order.paymentStatus = "Paid";
        order.orderStatus = "Processing";
        await order.save();
        console.log(
          `✅ Order #${order.id} securely marked as Paid via Webhook.`,
        );
      }
    } catch (error) {
      console.error("Error updating order from webhook:", error);
    }
  }

  res.json({ received: true });
};
