
import { useState, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../lib/api";

interface LocationState {
  email?: string;
}

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const [email, setEmail] = useState(state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/auth/verify-email", {
        email: email.trim(),
        otp,
      });

      setSuccess("Your email has been verified successfully!");

      setTimeout(() => {
        navigate("/login", {
          state: { email: email.trim() },
        });
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Verification failed. Please check your code and try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#145C43] flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <span className="text-2xl font-bold text-[#173D30]">
              aven
            </span>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7 sm:p-9">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF4EF] flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="w-7 h-7 text-[#145C43]"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Verify your email
            </h1>

            <p className="text-sm text-gray-500 mt-3 leading-6">
              We've sent a 6-digit verification code to your email address.
              Enter the code below to activate your Aven account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#145C43] focus:ring-2 focus:ring-[#145C43]/10"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Verification code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-[#145C43] focus:ring-2 focus:ring-[#145C43]/10"
              />

              <p className="text-xs text-gray-400 mt-2">
                Enter the 6-digit code sent to your inbox.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full rounded-xl bg-[#145C43] py-3.5 text-white text-sm font-semibold transition hover:bg-[#104A36] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <div className="mt-7 text-center">
            <Link
              to="/register"
              className="text-sm text-gray-500 hover:text-[#145C43] transition"
            >
              Back to registration
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Secure your finances with Aven.
        </p>
      </div>
    </div>
  );
}
