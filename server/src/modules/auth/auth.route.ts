import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema, updateSchema, verifyOtpSchema, resendOtpSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), AuthController.resendOtp);
router.get("/me", authMiddleware, AuthController.getMe);
router.put("/me", authMiddleware, validate(updateSchema), AuthController.updateMe);

export default router;
