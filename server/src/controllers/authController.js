import { AuthService } from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      error: err.message,
    });
  }
};
