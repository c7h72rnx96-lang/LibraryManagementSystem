import { Resend } from "resend";

export const sendVerificationEmail = async (email, code) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: "Library <noreply@aashish7.me>",
      to: email, // ⚠️ FREE TIER RULE: You can ONLY send to your own email address for now!
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
    console.log("Email sent:", data);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Could not send verification email.");
  }
};
// ==========================================
// SEND PASSWORD RESET EMAIL
// ==========================================
export const sendPasswordResetEmail = async (email, code) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const data = await resend.emails.send({
      from: "Library <noreply@aashish7.me>",
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
    console.log("Reset email sent:", data);
  } catch (error) {
    console.error("Failed to send reset email:", error);
    throw new Error("Could not send reset email.");
  }
};
