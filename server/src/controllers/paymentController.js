import { PaymentService } from "../services/PaymentService.js";

export const createCheckoutSession = async (req, res, next) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const result = await PaymentService.createCheckoutSession(
      req.body.orderId,
      frontendUrl,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const result = await PaymentService.processWebhook(
      req.body,
      sig,
      endpointSecret,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).send(error.message); // Stripe expects a string send for 400s
    }
    next(error);
  }
};
