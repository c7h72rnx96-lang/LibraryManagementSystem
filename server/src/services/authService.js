import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/index.js";

export const AuthService = {
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.jwt.secret,
      {
        expiresIn: "1d",
      },
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  },
};
