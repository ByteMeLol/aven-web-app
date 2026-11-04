
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../lib/api";
import BrandLogo from "../components/BrandLogo";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const form = new FormData(event.currentTarget);

    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

      // Registration succeeded. Continue to email verification.
      console.log("Registration successful. Redirecting...");
      navigate("/verify-email", {
        state: { email },
      });

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          "Registration failed. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F5F8F5] px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-md">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-[#E4EAE5] bg-white p-5 sm:p-9"
        >
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#183D2B]"
          >
            <BrandLogo />
            Aven
          </Link>

          <div className="mb-7">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#176B4D]">
              GET STARTED
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-[#18231D] sm:text-3xl">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#68756C]">
              Start organising your money in one place.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-[#29372E]"
              >
                First name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                maxLength={100}
                placeholder="Your first name"
                onChange={() => setError("")}
                className="min-h-12 w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-base text-[#18231D] outline-none transition placeholder:text-sm placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-[#29372E]"
              >
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                maxLength={100}
                placeholder="Your last name"
                onChange={() => setError("")}
                className="min-h-12 w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-base text-[#18231D] outline-none transition placeholder:text-sm placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
              />
            </div>

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
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                onChange={() => setError("")}
                className="min-h-12 w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 text-base text-[#18231D] outline-none transition placeholder:text-sm placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#29372E]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="At least 8 characters"
                  onChange={() => setError("")}
                  className="min-h-12 w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 pr-12 text-base text-[#18231D] outline-none transition placeholder:text-sm placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
                />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#718078] hover:bg-[#F0F5F1]">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#29372E]"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="Re-enter your password"
                  onChange={() => setError("")}
                  className="min-h-12 w-full rounded-xl border border-[#DCE4DE] bg-white px-4 py-3 pr-12 text-base text-[#18231D] outline-none transition placeholder:text-sm placeholder:text-[#A0AAA3] focus:border-[#176B4D] focus:ring-4 focus:ring-[#176B4D]/10"
                />
                <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#718078] hover:bg-[#F0F5F1]">
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
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
            className="mt-6 w-full rounded-xl bg-[#176B4D] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12573E] focus:outline-none focus:ring-4 focus:ring-[#176B4D]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-[#68756C]">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#176B4D] hover:text-[#12573E] hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-5 border-t border-[#EDF0ED] pt-4 text-center text-xs leading-5 text-[#8A958D]">
            By creating an account, you agree to our terms and privacy policy.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-[#89948C]">
          © {new Date().getFullYear()} Aven. Manage your money with clarity.
        </p>
      </div>
    </main>
  );
}
