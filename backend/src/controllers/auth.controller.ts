import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JWTPayload, OtpEntry } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

// In-memory OTP store (MVP only — replace with Redis/DB in production)
const otpStore: Record<string, OtpEntry> = {};

function generateTokens(user: { id: string; email: string | null }) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id } as JWTPayload,
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

// POST /api/auth/google
export async function googleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      res.status(400).json({ error: "Google token is required" });
      return;
    }

    // MVP: Skip actual Google token verification
    // In production, verify with Google OAuth2 client:
    //   const ticket = await googleClient.verifyIdToken({ idToken: googleToken, audience: CLIENT_ID });
    //   const payload = ticket.getPayload();
    const email = req.body.email || "test@example.com";
    const name = req.body.name || "Test User";

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          type: "CLIENT",
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        type: user.type,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// POST /api/auth/send-otp
export async function sendPhoneOtp(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      res
        .status(400)
        .json({ error: "A valid 10-digit phone number is required" });
      return;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 5-minute expiry
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    // MVP: Log OTP to console (replace with SMS provider in production)
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent to your phone",
      // Include OTP in dev mode for testing convenience
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

// POST /api/auth/verify-otp
export async function verifyPhoneOtp(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: "Phone and OTP are required" });
      return;
    }

    const stored = otpStore[phone];

    if (!stored) {
      res.status(400).json({ error: "No OTP found for this phone number" });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      res.status(400).json({ error: "OTP has expired" });
      return;
    }

    if (stored.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    // OTP valid — clean up
    delete otpStore[phone];

    // Find or create user by phone
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: `User_${phone.slice(-4)}`,
          type: "CLIENT",
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        type: user.type,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
}

// POST /api/auth/refresh
export async function refreshAccessToken(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
}
