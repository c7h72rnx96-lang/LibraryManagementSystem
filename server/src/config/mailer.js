// === src/config/mailer.js ===
import { Resend } from "resend";

export const sendVerificationEmail = async (email, code) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "LibraryMS <noreply@aashish7.me>",
      to: email,
      subject: "Library Account Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to the Library!</h2>
          <p>Your 6-digit email verification code is:</p>
          <h1 style="color: #2563eb; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export const sendPasswordResetEmail = async (email, code) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "LibraryMS <noreply@aashish7.me>",
      to: email,
      subject: "Library Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Your 6-digit code is:</p>
          <h1 style="color: #dc2626; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
  }
};

// 🔥 NEW: ABANDONED CART RECOVERY EMAIL
export const sendAbandonedCartEmail = async (email, username, itemCount) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "LibraryMS <noreply@aashish7.me>",
      to: email,
      subject: "You left something behind! 🛒",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2>Hi ${username},</h2>
          <p>We noticed you left <strong>${itemCount} item(s)</strong> in your shopping cart.</p>
          <p>Popular books sell out fast! Complete your purchase today before they are gone.</p>
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/cart" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
            Return to Checkout
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send abandoned cart email:", error);
  }
};

// 🔥 NEW: REVIEW NUDGE EMAIL
export const sendReviewNudgeEmail = async (
  email,
  username,
  bookTitle,
  bookId,
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "LibraryMS <noreply@aashish7.me>",
      to: email,
      subject: `What did you think of ${bookTitle}? 🌟`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2>Hi ${username},</h2>
          <p>We hope you are enjoying <strong>${bookTitle}</strong>!</p>
          <p>Your opinion helps other readers discover great books. Take 60 seconds to leave a review and earn loyalty points.</p>
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/books/${bookId}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
            Rate this Book
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send review nudge:", error);
  }
};
