import { Router } from "express";
import { login } from "../controllers/authController.js";
import { loginValidator } from "../validators/authValidator.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/login", loginValidator, validate, login);

export default router;
