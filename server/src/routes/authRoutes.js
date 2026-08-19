import { Router } from "express";
import { login, register, verify } from "../controllers/authController.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/authValidator.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/login", loginValidator, validate, login);
router.post("/register", registerValidator, validate, register);
router.post("/verify", verify);

export default router;
