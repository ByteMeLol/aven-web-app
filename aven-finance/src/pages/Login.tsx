
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../lib/api";

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export default function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<LoginResponse>(
        "/api/auth/login",
        {
          email,
          password,
        }
      );

      const { accessToken } = response.data;

      // Store the JWT returned by Spring Boot.
      localStorage.setItem("aven-access-token", accessToken);
      window.dispatchEvent(new Event("aven-auth-changed"));

      // Remove the previous demo session.
      localStorage.removeItem("aven-demo-session");

      navigate("/", { replace: true });

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Invalid email or password, or your email has not been verified.");
        } else {
          setError(
            err.response?.data?.message ||
            "Unable to sign in. Please try again."
          );
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8F5] px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-[#E4EAE5] bg-white p-6 shadow-[0_12px_40px_rgba(20,50,30,0.06)] sm:p-9"
        >
          <Link
            to="/login"
            className="mb-10 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#183D2B]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176B4D] text-xl font-bold text-white">
              a
            </span>
            Aven
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#176B4D]">
              WELCOME BACK
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#18231D]">
              Sign in to Aven
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#68756C]">
              Continue to your personal finance dashboard.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#29372E]"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                onChange={() => setError("")}
                className="w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-sm text-[#18231D] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#29372E]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={() => setError("")}
                className="w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-sm text-[#18231D] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-[#176B4D] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12573E] focus:outline-none focus:ring-4 focus:ring-[#176B4D]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-[#68756C]">
            New to Aven?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#176B4D] hover:text-[#12573E] hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-6 border-t border-[#EDF0ED] pt-4 text-center text-xs leading-5 text-[#8A958D]">
            Your account is protected with secure authentication.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-[#89948C]">
          © {new Date().getFullYear()} Aven. Manage your money with clarity.
        </p>
      </div>
    </main>
  );
}
