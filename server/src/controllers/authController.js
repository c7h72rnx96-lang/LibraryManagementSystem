// === src/controllers/authController.js ===
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { AuthService } from "../services/authService.js";
import { UserService } from "../services/UserService.js"; // <-- NEW
import { sendVerificationEmail } from "../config/mailer.js";

// ==========================================
// COOKIE HELPER
// ==========================================
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    // REMOVE or comment out the maxAge line below!
    // maxAge: 24 * 60 * 60 * 1000,
  });
};

// ==========================================
// LOGIN & LOGOUT
// ==========================================
export const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    setAuthCookie(res, result.token);
    res.status(200).json({ user: result.user, message: "Login successful" });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// ==========================================
// PROFILE MANAGEMENT (NEW THIN CONTROLLERS)
// ==========================================
export const getMe = async (req, res, next) => {
  try {
    const user = await UserService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await UserService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await UserService.updateProfile(
      req.user.id,
      req.body,
      req.file,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REGISTRATION & VERIFICATION
// ==========================================
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await AuthService.register(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const registerSeller = async (req, res) => {
  try {
    const { username, email, password, storeName, storeDescription } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) {
      if (user.isVerified)
        return res.status(400).json({ error: "Email already registered." });
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
      role: "seller",
      storeName,
      storeDescription,
      isVerified: false,
      verificationCode,
      codeExpiresAt,
      storeStatus: "pending",
    });

    console.log(
      `\n📧 VERIFICATION CODE FOR SELLER ${email}: [ ${verificationCode} ]\n`,
    );
    await sendVerificationEmail(user.email, verificationCode).catch((err) =>
      console.log("Email provider blocked sending, but code is in terminal."),
    );

    res.status(201).json({ message: "Verification code sent to your email." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await AuthService.verify(email, code);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================================
// PASSWORD MANAGEMENT
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const result = await AuthService.forgotPassword(req.body.email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, code, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(
      req.user.id,
      oldPassword,
      newPassword,
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
