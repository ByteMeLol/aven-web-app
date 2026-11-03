
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiCamera,
  FiGlobe,
  FiBell,
  FiShield,
  FiLock,
  FiLogOut,
  FiArrowUpRight,
  FiX,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { useFinance } from "../context/FinanceContext";
import { currencies, type CurrencyCode } from "../lib/format";
import api from "../lib/api";

interface UserProfile {
  id: number;
  avenId: string;
  profilePictureKey: string | null;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { currency, setCurrency } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");

  const [notifications, setNotifications] = useState(
    localStorage.getItem("aven-demo-notifications") !== "false",
  );

  const [showSignOut, setShowSignOut] = useState(false);

  // Load the authenticated user's profile
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<UserProfile>("/api/users/me");

        if (cancelled) return;

        setProfile(response.data);

        // Retrieve the profile picture if one exists
        try {
          const pictureResponse = await api.get<{ imageUrl: string }>(
            "/api/users/me/profile-picture",
          );

          if (!cancelled) {
            setPhoto(pictureResponse.data.imageUrl);
          }
        } catch (pictureError: any) {
          if (!cancelled) {
            if (pictureError.response?.status !== 404) {
              console.error(
                "Unable to load profile picture:",
                pictureError,
              );
            }
            setPhoto(null);
          }
        }
      } catch (profileError: any) {
        console.error("Unable to load profile:", profileError);

        if (!cancelled) {
          if (profileError.response?.status === 401) {
            localStorage.removeItem("aven-access-token");
            navigate("/login", { replace: true });
          } else {
            setError(
              "Unable to load your profile. Please try again.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const name = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "Loading profile...";

  const email = profile?.email || "";

  const initials =
    profile
      ? `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase()
      : "U";

  // Upload profile picture to the backend
  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setPhotoMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoMessage("Only JPEG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setPhotoMessage("Your profile photo must not exceed 1 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Upload image to Cloudflare R2 through Spring Boot
      await api.post(
        "/api/users/me/profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Retrieve a new temporary URL for the uploaded image
      const pictureResponse = await api.get<{ imageUrl: string }>(
        "/api/users/me/profile-picture",
      );

      setPhoto(pictureResponse.data.imageUrl);
      setPhotoMessage("Profile picture updated successfully.");
    } catch (uploadError: any) {
      console.error("Profile picture upload failed:", uploadError);

      if (uploadError.response?.status === 401) {
        localStorage.removeItem("aven-access-token");
        navigate("/login", { replace: true });
      } else {
        setPhotoMessage(
          uploadError.response?.data?.message ||
          "Unable to upload your profile picture. Please try again.",
        );
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function toggleNotifications() {
    const next = !notifications;

    setNotifications(next);
    localStorage.setItem(
      "aven-demo-notifications",
      String(next),
    );
  }

  function signOut() {
    localStorage.removeItem("aven-access-token");
    localStorage.removeItem("aven-demo-session");

    navigate("/login", { replace: true });
  }

  const fieldClass =
    "mt-2 block w-full rounded-lg border border-[#E3E8E4] bg-[#F6F8F6] px-3.5 py-3 text-sm text-[#69746C] outline-none";

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9F7]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#DCE9DF] border-t-[#176B4D]" />
          <p className="mt-4 text-sm text-[#78827A]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Profile loading error
  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9F7] px-4">
        <div className="max-w-sm rounded-xl border border-[#E4E9E5] bg-white p-7 text-center">
          <FiInfo className="mx-auto text-[#B14A40]" size={28} />
          <h2 className="mt-4 font-semibold">
            Unable to load profile
          </h2>
          <p className="mt-2 text-sm text-[#78827A]">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#176B4D] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] px-4 py-7 text-[#202923] sm:px-7 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-[1240px]">

        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#E4E9E5] pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#47775A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#39865A]" />
              Account
            </div>

            <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[36px]">
              Profile & settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#78827A]">
              Manage your personal information, preferences and account access.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-lg border border-[#E2E8E3] bg-white px-3.5 py-2.5 sm:self-auto">
            <span className="flex h-2 w-2 rounded-full bg-[#3A9861]" />
            <span className="text-xs font-medium text-[#59675D]">
              Connected account
            </span>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-12">

          <main className="min-w-0 space-y-9">

            {/* Personal details */}
            <section>
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Personal details
                </h2>
                <p className="mt-1 text-sm text-[#7C867E]">
                  Your registered information and identity.
                </p>
              </div>

              <div className="rounded-xl border border-[#E4E9E5] bg-white">

                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">

                  {/* Profile picture */}
                  <div className="relative h-[76px] w-[76px] shrink-0">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#E6F0E7] text-xl font-semibold text-[#246744]">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Change profile photo"
                      title="Change profile photo"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#202923] text-white transition hover:bg-[#176B4D] disabled:opacity-50"
                    >
                      {uploading ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <FiCamera size={13} />
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={handlePhoto}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold tracking-tight">
                      {name}
                    </h3>

                    <p className="mt-1 truncate text-sm text-[#7B857D]">
                      {email}
                    </p>

                    <p className="mt-2 text-xs text-[#8A948C]">
                      JPEG, PNG or WEBP · Maximum 1 MB
                    </p>

                    {uploading && (
                      <p className="mt-2 text-xs font-medium text-[#176B4D]">
                        Uploading your profile picture...
                      </p>
                    )}

                    {photoMessage && (
                      <p
                        role="status"
                        className={`mt-2 text-xs ${
                          photoMessage.includes("successfully")
                            ? "text-[#24764B]"
                            : "text-[#B33F36]"
                        }`}
                      >
                        {photoMessage}
                      </p>
                    )}
                  </div>

                  <div className="hidden shrink-0 border-l border-[#E8ECE9] pl-5 sm:block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#909A92]">
                      Aven ID
                    </p>
                    <p className="mt-1.5 text-sm font-semibold tracking-wide">
                      {profile?.avenId}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E9EDE9] px-5 py-5 sm:px-6">

                  <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">

                    <label className="block text-sm font-medium text-[#48544B]">
                      First name
                      <span className="relative block">
                        <FiUser
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939D95]"
                          size={16}
                        />
                        <input
                          className={`${fieldClass} pl-10`}
                          value={profile?.firstName || ""}
                          disabled
                          readOnly
                        />
                      </span>
                    </label>

                    <label className="block text-sm font-medium text-[#48544B]">
                      Last name
                      <span className="relative block">
                        <FiUser
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939D95]"
                          size={16}
                        />
                        <input
                          className={`${fieldClass} pl-10`}
                          value={profile?.lastName || ""}
                          disabled
                          readOnly
                        />
                      </span>
                    </label>

                    <label className="block text-sm font-medium text-[#48544B] sm:col-span-2">
                      Email address
                      <span className="relative block">
                        <FiMail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939D95]"
                          size={16}
                        />
                        <input
                          type="email"
                          className={`${fieldClass} pl-10`}
                          value={email}
                          disabled
                          readOnly
                        />
                      </span>
                    </label>

                  </div>

                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#89938B]">
                    <FiInfo className="mt-0.5 shrink-0" size={14} />
                    Your registered details are managed securely through your Aven account.
                  </p>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section>
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Preferences
                </h2>
                <p className="mt-1 text-sm text-[#7C867E]">
                  Adjust how information is presented in your account.
                </p>
              </div>

              <div className="divide-y divide-[#E5EAE6] border-y border-[#E5EAE6] bg-transparent">

                {/* Currency */}
                <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E9E4] bg-white text-[#47775A]">
                    <FiGlobe size={18} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">
                      Display currency
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[#7B857D]">
                      Select the currency used by your single Aven Wallet and displayed amounts.
                    </p>
                  </div>

                  <select
                    value={currency}
                    onChange={(event) =>
                      setCurrency(event.target.value as CurrencyCode)
                    }
                    aria-label="Display currency"
                    className="w-full rounded-lg border border-[#DDE5DF] bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-[#619477] sm:w-32"
                  >
                    {currencies.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex items-center gap-4 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E9E4] bg-white text-[#47775A]">
                    <FiBell size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">
                      Notifications
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[#7B857D]">
                      Notification preference on this device.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications}
                    aria-label="Toggle notifications"
                    onClick={toggleNotifications}
                    className={`relative h-[22px] w-10 shrink-0 rounded-full transition ${
                      notifications ? "bg-[#176B4D]" : "bg-[#CFD6D0]"
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                        notifications ? "left-[21px]" : "left-[3px]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Privacy and security */}
            <section>
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Privacy & security
                </h2>
                <p className="mt-1 text-sm text-[#7C867E]">
                  Your account authentication and verification status.
                </p>
              </div>

              <div className="rounded-xl border border-[#E4E9E5] bg-white">

                {/* Authentication */}
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F6F3] text-[#536A59]">
                    <FiShield size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">
                      Authentication
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#818B83]">
                      Your account is authenticated using secure access tokens.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-md bg-[#EAF5ED] px-2 py-1 text-[10px] font-semibold text-[#24764B]">
                    Connected
                  </span>
                </div>

                <div className="mx-5 border-t border-[#E9EDE9]" />

                {/* Email verification */}
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F6F3] text-[#536A59]">
                    <FiLock size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">
                      Email verification
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#818B83]">
                      {profile?.emailVerified
                        ? "Your email address has been successfully verified."
                        : "Your email address has not yet been verified."}
                    </p>
                  </div>

                  {profile?.emailVerified ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#EAF5ED] px-2 py-1 text-[10px] font-semibold text-[#24764B]">
                      <FiCheckCircle size={12} />
                      Verified
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-[#FFF4DF] px-2 py-1 text-[10px] font-semibold text-[#8D671C]">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#89938B]">
                <FiInfo className="mt-0.5 shrink-0" size={14} />
                Your profile information is retrieved from your authenticated Aven account.
              </p>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6">

            {/* Account overview */}
            <section className="rounded-xl border border-[#E4E9E5] bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#7E8B80]">
                Account overview
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6F0E7] text-sm font-semibold text-[#246744]">
                  {photo ? (
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {name}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#7D887F]">
                    {email}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#E9EDE9] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#7B857D]">
                    Account type
                  </span>
                  <span className="text-xs font-semibold">
                    Personal
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#7B857D]">
                    Aven ID
                  </span>
                  <span className="text-xs font-semibold">
                    {profile?.avenId}
                  </span>
                </div>
              </div>
            </section>

            {/* Support */}
            <section className="rounded-xl border border-[#E4E9E5] bg-white p-5">
              <div className="flex items-center gap-3">
                <FiInfo className="shrink-0 text-[#52765C]" size={18} />
                <h3 className="text-sm font-semibold">
                  Account support
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#7B857D]">
                Your Aven account information is securely managed through your registered account.
              </p>
            </section>

            {/* Sign out */}
            <button
              type="button"
              onClick={() => setShowSignOut(true)}
              className="group flex w-full items-center gap-3 rounded-xl border border-[#E4E9E5] bg-white p-4 text-left transition hover:border-[#E7C9C5] hover:bg-[#FFFAF9]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAEFED] text-[#B14A40]">
                <FiLogOut size={17} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#A7473D]">
                  Sign out
                </span>
                <span className="mt-1 block text-xs text-[#8A817E]">
                  Sign out of your Aven account
                </span>
              </span>

              <FiArrowUpRight
                size={16}
                className="text-[#A99A96] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>

            <p className="px-1 text-xs text-[#9AA39B]">
              Aven Finance · Personal account
            </p>
          </aside>
        </div>
      </div>

      {/* Sign-out modal */}
      {showSignOut && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14251A]/45 p-4 backdrop-blur-sm"
          onClick={() => setShowSignOut(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-[#E4E9E5] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAEFED] text-[#B14A40]">
                <FiLogOut size={19} />
              </div>

              <button
                type="button"
                onClick={() => setShowSignOut(false)}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#758078] transition hover:bg-[#F3F6F3]"
              >
                <FiX size={18} />
              </button>
            </div>

            <h2
              id="signout-title"
              className="mt-5 text-xl font-semibold tracking-tight"
            >
              Sign out of Aven?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7B857D]">
              You will return to the sign-in page. Your account and saved preferences will remain intact.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSignOut(false)}
                className="rounded-lg border border-[#DDE5DF] px-3 py-3 text-sm font-semibold transition hover:bg-[#F7F9F7]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={signOut}
                className="rounded-lg bg-[#176B4D] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#10563C]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
