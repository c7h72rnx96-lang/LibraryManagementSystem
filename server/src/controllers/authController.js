import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { AuthService } from "../services/authService.js";
import { sendVerificationEmail } from "../config/mailer.js"; // <-- ADDED MAILER IMPORT

export const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await AuthService.register(username, email, password);
    res.status(201).json(result);
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

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // 🔥 Added storeName and storeDescription to the extracted body
    const {
      username,
      email,
      phone,
      address,
      city,
      storeName,
      storeDescription,
    } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;

    // 🔥 Only update these if the user is actually a seller
    if (user.role === "seller") {
      user.storeName = storeName || user.storeName;
      user.storeDescription = storeDescription || user.storeDescription;
    }

    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        storeName: user.storeName, // Send back updated store data
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

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

// ==========================================
// REGISTER SELLER (NOW REQUIRES EMAIL VERIFICATION)
// ==========================================
export const registerSeller = async (req, res) => {
  try {
    const { username, email, password, storeName, storeDescription } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) {
      if (user.isVerified)
        return res.status(400).json({ error: "Email already registered." });
      await user.destroy(); // Wipe unverified old attempts
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
      isVerified: false, // 🔥 SELLER MUST NOW VERIFY EMAIL
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

    res.status(201).json({
      message: "Verification code sent to your email.",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
