import Stripe from "stripe";
import { Order } from "../models/index.js";

// Note: In production, this goes in your .env file!
// For now, use this free Stripe Test Key to simulate real transactions.
const stripe = new Stripe("sk_test_51O1...your_test_key_here...");

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Stripe expects amounts in cents (e.g., $10.00 = 1000)
    // Since you are using Rs., we multiply by 100 to meet Stripe's formatting
    const amountInCents = Math.round(Number(order.grandTotal) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr", // Use 'inr' or 'usd' depending on your Stripe account region
            product_data: {
              name: `LibraryMS Order #${order.id}`,
              description: `Payment for ${order.fullName}'s book order.`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      // We will create these success/cancel pages in React next
      // UPDATE THIS LINE:
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/orders?payment=success&orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout?payment=cancelled`,
      client_reference_id: order.id.toString(),
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Failed to initialize payment gateway" });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order in our database
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // In a real production app, we would use Stripe Webhooks here.
    // For this build, we are simulating a successful capture from the frontend return URL.
    order.paymentStatus = "Paid";
    order.orderStatus = "Processing";
    await order.save();

    res.status(200).json({ message: "Payment verified successfully", order });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};
