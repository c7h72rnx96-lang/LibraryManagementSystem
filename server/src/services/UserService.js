import { User } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const UserService = {
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password", "verificationCode", "codeExpiresAt"],
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async updateProfile(userId, data, file) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("User not found", 404);

    // Explicit Mass Assignment Protection
    user.username = data.username || user.username;
    user.email = data.email || user.email;
    user.phone = data.phone || user.phone;
    user.address = data.address || user.address;
    user.city = data.city || user.city;

    if (user.role === "seller") {
      user.storeName = data.storeName || user.storeName;
      user.storeDescription = data.storeDescription || user.storeDescription;
    }

    if (file) {
      user.avatar = file.path;
    }

    await user.save();

    return {
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
        storeName: user.storeName,
        loyaltyPoints: user.loyaltyPoints,
      },
    };
  },
};
