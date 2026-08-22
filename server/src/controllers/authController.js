import { User } from "../models/index.js";
import { AuthService } from "../services/authService.js";

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
// ==========================================
// GET USER PROFILE
// ==========================================
export const getProfile = async (req, res) => {
  try {
    // req.user comes from your authenticate middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }, // Never send the password back!
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

/// ==========================================
// UPDATE USER PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const { username, email, phone, address, city } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update text fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;

    // Cloudinary puts the secure internet URL inside req.file.path!
    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();

    // Send back the updated user
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
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
// ==========================================
// PASSWORD MANAGEMENT CONTROLLERS
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
    // req.user.id comes from the authenticate middleware!
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
