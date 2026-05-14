import { Router } from "express";
import {
  googleLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
  refreshAccessToken,
} from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/google
router.post("/google", googleLogin);

// POST /api/auth/send-otp
router.post("/send-otp", sendPhoneOtp);

// POST /api/auth/verify-otp
router.post("/verify-otp", verifyPhoneOtp);

// POST /api/auth/refresh
router.post("/refresh", refreshAccessToken);

export default router;
