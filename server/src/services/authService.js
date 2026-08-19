import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/index.js";
import { sendVerificationEmail } from "../config/mailer.js";

export const AuthService = {
  async register(username, email, password) {
    let user = await User.findOne({ where: { email } });

    if (user) {
      if (user.isVerified) throw new Error("Email is already registered.");
      await user.destroy();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      codeExpiresAt,
    });

    await sendVerificationEmail(user.email, verificationCode);
    return { message: "Verification code sent to your email." };
  },

  async verify(email, code) {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error("User not found.");
    if (user.isVerified) throw new Error("Account is already verified.");
    if (user.verificationCode !== code)
      throw new Error("Invalid verification code.");
    if (new Date() > user.codeExpiresAt)
      throw new Error("Verification code has expired.");

    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();

    return { message: "Account verified successfully. You can now log in." };
  },

  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error("Invalid email or password");
    if (!user.isVerified)
      throw new Error("Please verify your email before logging in.");

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Invalid email or password");

    // NEW: Add role to token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: "1d" },
    );

    // NEW: Return role to frontend
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  },
};
