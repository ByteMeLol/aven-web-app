
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  FiCopy,
  FiCheck,
  FiDownload,
  FiShare2,
  FiShield,
  FiArrowDownLeft,
  FiInfo,
} from "react-icons/fi";
import api from "../lib/api";

export default function Receive() {
  const [paymentId, setPaymentId] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<{ avenId: string }>("/api/users/me")
      .then((response) => setPaymentId(response.data.avenId))
      .catch(() => setMessage("Unable to load your Aven ID."));
  }, []);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(paymentId);
      setCopied(true);
      setMessage("Aven ID copied successfully.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Could not copy automatically. Please copy the ID manually.");
    }
  }

  function downloadQr() {
    const svg = document.getElementById("aven-receive-qr");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "aven-receive-qr.svg";
    link.click();

    URL.revokeObjectURL(url);
    setMessage("QR code download started.");
  }

  async function shareDetails() {
    const text = `My Aven ID: ${paymentId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Aven receiving details",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setMessage("Receiving details copied for sharing.");
      }
    } catch {
      // Sharing was cancelled or is unavailable.
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] px-4 py-7 text-[#202923] sm:px-7 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-[#E4E9E5] pb-7">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#47775A]">
            Payments
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Receive money
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#78827A] sm:text-base">
            Share your QR code or Aven ID to let others identify your account.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-[#E4E9E5] bg-white">
            <div className="border-b border-[#E9EDE9] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#176B4D]">
                  <FiArrowDownLeft size={20} />
                </div>
                <div>
                  <h2 className="font-semibold">Your receiving QR code</h2>
                  <p className="mt-1 text-sm text-[#7B857D]">
                    Scan to read your Aven ID
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-7 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#89938B]">
                  Your Aven ID
                </p>
                <p className="mt-2 break-all text-2xl font-semibold tracking-tight sm:text-3xl">
                  {paymentId || "Loading..."}
                </p>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#7B857D]">
                  Share this unique Aven identifier with the person who needs
                  your receiving details.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={copyId}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#176B4D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#10563C]"
                  >
                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                    {copied ? "Copied" : "Copy Aven ID"}
                  </button>

                  <button
                    type="button"
                    onClick={shareDetails}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DDE5DF] px-4 py-3 text-sm font-semibold text-[#35453B] transition hover:bg-[#F7F9F7]"
                  >
                    <FiShare2 size={16} />
                    Share ID
                  </button>
                </div>

                {message && (
                  <p role="status" className="mt-4 text-sm text-[#287653]">
                    {message}
                  </p>
                )}
              </div>

              <div className="mx-auto w-full max-w-[240px]">
                <div className="rounded-2xl border border-[#E4E9E5] bg-white p-4">
                  <div className="flex items-center justify-center rounded-xl bg-white p-2">
                    <QRCodeSVG
                      id="aven-receive-qr"
                      value={paymentId || "aven"}
                      size={192}
                      level="H"
                      marginSize={2}
                      bgColor="#FFFFFF"
                      fgColor="#183D2B"
                      title="Aven receiving ID QR code"
                    />
                  </div>
                  <p className="mt-3 text-center text-xs font-medium text-[#6F7B72]">
                    Scan to read Aven ID
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadQr}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDE5DF] bg-white px-3 py-2.5 text-sm font-semibold text-[#35453B] transition hover:bg-[#F7F9F7]"
                >
                  <FiDownload size={16} />
                  Download QR code
                </button>
              </div>
            </div>

            <div className="border-t border-[#E9EDE9] bg-[#FAFBFA] px-5 py-4 sm:px-7">
              <p className="flex items-start gap-2 text-xs leading-5 text-[#7B857D]">
                <FiInfo size={15} className="mt-0.5 shrink-0" />
                This QR code identifies your Aven account. It does not initiate
                a payment or prove that a transfer has completed.
              </p>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#E4E9E5] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#176B4D]">
                <FiShield size={20} />
              </div>
              <h2 className="mt-4 font-semibold">Receive securely</h2>
              <p className="mt-2 text-sm leading-6 text-[#7B857D]">
                Verify the recipient and payment details before sending money.
                Never share passwords or verification codes.
              </p>
            </section>

            <section className="rounded-2xl border border-[#E4E9E5] bg-white p-5">
              <h2 className="font-semibold">How it works</h2>
              <ol className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3EC] text-xs font-semibold text-[#176B4D]">
                    1
                  </span>
                  <p className="pt-1 text-sm leading-5 text-[#647067]">
                    Show your QR code or share your Aven ID.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3EC] text-xs font-semibold text-[#176B4D]">
                    2
                  </span>
                  <p className="pt-1 text-sm leading-5 text-[#647067]">
                    The other person scans the code to read the ID.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3EC] text-xs font-semibold text-[#176B4D]">
                    3
                  </span>
                  <p className="pt-1 text-sm leading-5 text-[#647067]">
                    Confirm the details through a supported payment service.
                  </p>
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
