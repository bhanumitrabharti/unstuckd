"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

const API_BASE = "http://localhost:3001/api/auth";

interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  type: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export default function LoginPage() {
  const router = useRouter();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<
    "google" | "otp-send" | "otp-verify" | null
  >(null);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const handleSuccess = useCallback(
    (data: AuthResponse) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    },
    [router]
  );

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof AxiosError && err.response?.data?.error) {
      return err.response.data.error;
    }
    return "Something went wrong. Please try again.";
  };

  // ─── Google Login ───────────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    setError("");
    setLoading(true);
    setLoadingAction("google");
    try {
      const { data } = await axios.post<AuthResponse>(`${API_BASE}/google`, {
        googleToken: "test",
      });
      handleSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [handleSuccess]);

  // ─── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = useCallback(async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    setLoadingAction("otp-send");
    try {
      await axios.post(`${API_BASE}/send-otp`, { phone });
      setShowOtp(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [phone]);

  // ─── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    setLoadingAction("otp-verify");
    try {
      const { data } = await axios.post<AuthResponse>(
        `${API_BASE}/verify-otp`,
        { phone, otp }
      );
      handleSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [phone, otp, handleSuccess]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-blue-950/20 p-8 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50">
        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            Unstuckd
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Stop Searching. Start Solving.
          </p>
        </div>

        {/* ─── Error Banner ───────────────────────────────────────── */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm text-center transition-all duration-300">
            {error}
          </div>
        )}

        {/* ─── Google Login ───────────────────────────────────────── */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loadingAction === "google" ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* ─── Divider ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Or
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* ─── Phone Login ────────────────────────────────────────── */}
        <div className="space-y-3">
          <div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPhone(val);
                setError("");
                if (showOtp) {
                  setShowOtp(false);
                  setOtp("");
                }
              }}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {!showOtp ? (
            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-900/10 hover:shadow-lg cursor-pointer"
            >
              {loadingAction === "otp-send" ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtp(val);
                    setError("");
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
              >
                {loadingAction === "otp-verify"
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>
              <button
                onClick={() => {
                  setShowOtp(false);
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
                className="w-full px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200 cursor-pointer"
              >
                ← Change phone number
              </button>
            </>
          )}
        </div>

        {/* ─── Footer ─────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Terms of Service
          </span>
        </p>
      </div>
    </div>
  );
}
