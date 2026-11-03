
import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  FiArrowDownLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiLock,
  FiRefreshCw,
  FiCamera,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import api from "../lib/api";
import { useFinance } from "../context/FinanceContext";

type TransferStep = "form" | "review" | "success";

const paymentIdPattern = /^AV-[A-Z0-9-]+$/i;

function formatAmount(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export default function Send() {
  const { accounts } = useFinance();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [recipientError, setRecipientError] = useState("");
  const [step, setStep] = useState<TransferStep>("form");
  const [transferError, setTransferError] = useState("");
  const [sending, setSending] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanHandledRef = useRef(false);

  const closeScanner = useCallback(() => {
    setScanning(false);
    setScannerError("");
  }, []);

  const handleScannedCode = useCallback(
    (decodedText: string) => {
      if (scanHandledRef.current) return;

      const scannedValue = decodedText.trim();
      let id = scannedValue;

      // Also support a future payment URL containing ?recipient=AV-...
      try {
        if (/^https?:\/\//i.test(scannedValue)) {
          const url = new URL(scannedValue);
          id =
            url.searchParams.get("recipient") ||
            url.searchParams.get("paymentId") ||
            "";
        }
      } catch {
        // The scanned value may be a plain payment ID.
      }

      if (!paymentIdPattern.test(id)) {
        setScannerError(
          "This QR code does not contain a valid Aven payment ID. Try scanning the recipient's Aven Receive QR code.",
        );
        return;
      }

      scanHandledRef.current = true;
      setRecipient(id.toUpperCase());
      setRecipientError("");
      setScanning(false);
      setScannerError("");
    },
    [],
  );

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    const startCamera = async () => {
      try {
        scanner = new Html5Qrcode("aven-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 230, height: 230 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!cancelled) handleScannedCode(decodedText);
          },
          () => {
            // Ignore frames where no QR code is detected.
          },
        );

        if (cancelled) {
          try {
            await scanner.stop();
            scanner.clear();
          } catch {
            // Camera may already have stopped.
          }
        }
      } catch {
        if (!cancelled) {
          setScannerError(
            "Could not access the camera. Allow camera permission in your browser, use HTTPS or localhost, or enter the payment ID manually.",
          );
        }
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      const activeScanner = scanner;

      if (activeScanner) {
        void (async () => {
          try {
            if (activeScanner.isScanning) {
              await activeScanner.stop();
            }
          } catch {
            // Scanner may already have stopped.
          }

          try {
            activeScanner.clear();
          } catch {
            // Scanner element may already be cleared.
          }

          if (scannerRef.current === activeScanner) {
            scannerRef.current = null;
          }
        })();
      }
    };
  }, [scanning, handleScannedCode]);

  const parsedAmount = Number(amount);
  const validRecipient = paymentIdPattern.test(recipient.trim());

  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  const reviewTransfer = () => {
    setRecipientError("");

    if (!validRecipient) {
      setRecipientError("Enter a valid Aven payment ID.");
      return;
    }

    if (!validAmount) return;

    setStep("review");
  };

  const confirmTransfer = async () => {
    const account = accounts.find((item) => item.currency === currency);
    if (!account) {
      setTransferError(`Add a ${currency} account before sending money.`);
      return;
    }

    try {
      setSending(true);
      setTransferError("");
      await api.post("/api/transfers", {
        recipientAvenId: recipient.trim(),
        accountId: Number(account.id),
        amount: parsedAmount,
        currency,
        note,
        idempotencyKey: crypto.randomUUID(),
      });
      window.dispatchEvent(new Event("aven-finance-changed"));
      setStep("success");
    } catch (error: unknown) {
      setTransferError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Unable to complete transfer."
          : "Unable to complete transfer.",
      );
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setNote("");
    setRecipientError("");
    setScannerError("");
    setTransferError("");
    setStep("form");
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] px-4 py-8 text-[#17251e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#527461]">
            Payments
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Send money
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#738078]">
            Send to another Aven user using their payment ID or by scanning
            their QR code.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="rounded-2xl border border-[#e5ebe6] bg-white p-5 shadow-[0_4px_24px_rgba(22,48,32,0.03)] sm:p-8">
            {step === "form" && (
              <>
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#176b4d]">
                    <FiArrowRight size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold">Transfer details</h2>
                    <p className="mt-1 text-sm text-[#829087]">
                      Enter the recipient and amount.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="recipient"
                        className="text-sm font-medium text-[#34483c]"
                      >
                        Recipient payment ID
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          scanHandledRef.current = false;
                          setScannerError("");
                          setScanning(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#d8e7dc] px-3 py-2 text-sm font-medium text-[#176b4d] transition hover:bg-[#f0f7f2]"
                      >
                        <FiCamera size={16} />
                        Scan QR
                      </button>
                    </div>

                    <div className="relative">
                      <FiUser
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a978e]"
                        size={18}
                      />
                      <input
                        id="recipient"
                        value={recipient}
                        onChange={(event) => {
                          setRecipient(event.target.value.toUpperCase());
                          setRecipientError("");
                        }}
                        placeholder="e.g. AV-USER-4829"
                        autoComplete="off"
                        className="w-full rounded-xl border border-[#dfe7e1] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a3ada6] focus:border-[#39835e] focus:ring-4 focus:ring-[#176b4d]/[0.08]"
                      />
                      {validRecipient && (
                        <FiCheckCircle
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#278256]"
                          size={18}
                        />
                      )}
                    </div>

                    {recipientError && (
                      <p className="mt-2 text-sm text-red-600">
                        {recipientError}
                      </p>
                    )}

                    <p className="mt-2 text-xs leading-5 text-[#89958d]">
                      Confirm the recipient's payment ID before proceeding.
                    </p>
                  </div>

                  {scanning && (
                    <div className="rounded-2xl border border-[#dce8df] bg-[#f8fbf8] p-4 sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">Scan recipient QR</h3>
                          <p className="mt-1 text-xs leading-5 text-[#7c8b81]">
                            Position the recipient's QR code inside the frame.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={closeScanner}
                          aria-label="Close QR scanner"
                          className="rounded-lg p-2 text-[#6e7d73] transition hover:bg-[#eaf1eb]"
                        >
                          <FiX size={19} />
                        </button>
                      </div>

                      <div
                        id="aven-qr-reader"
                        className="mx-auto min-h-24 w-full max-w-sm overflow-hidden rounded-xl"
                      />

                      {scannerError && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                          {scannerError}
                        </div>
                      )}

                      <p className="mt-3 text-center text-xs text-[#8a968d]">
                        Camera access is required. You can also type the ID
                        above.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_135px]">
                    <div>
                      <label
                        htmlFor="amount"
                        className="mb-2 block text-sm font-medium text-[#34483c]"
                      >
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#839087]">
                          {currency === "TZS"
                            ? "TSh"
                            : currency === "KES"
                              ? "KSh"
                              : currency}
                        </span>
                        <input
                          id="amount"
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-[#dfe7e1] py-3.5 pl-16 pr-4 text-lg font-medium outline-none transition placeholder:text-[#b0b9b2] focus:border-[#39835e] focus:ring-4 focus:ring-[#176b4d]/[0.08]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="currency"
                        className="mb-2 block text-sm font-medium text-[#34483c]"
                      >
                        Currency
                      </label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="w-full rounded-xl border border-[#dfe7e1] bg-white px-3 py-4 text-sm font-medium outline-none focus:border-[#39835e] focus:ring-4 focus:ring-[#176b4d]/[0.08]"
                      >
                        <option value="USD">USD</option>
                        <option value="TZS">TZS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="note"
                      className="mb-2 block text-sm font-medium text-[#34483c]"
                    >
                      Note <span className="font-normal text-[#98a39b]">(optional)</span>
                    </label>
                    <input
                      id="note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={120}
                      placeholder="What's this payment for?"
                      className="w-full rounded-xl border border-[#dfe7e1] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a3ada6] focus:border-[#39835e] focus:ring-4 focus:ring-[#176b4d]/[0.08]"
                    />
                  </div>

                  <div className="flex gap-3 rounded-xl bg-[#f5f8f5] p-4">
                    <FiInfo className="mt-0.5 shrink-0 text-[#53745e]" size={18} />
                    <p className="text-xs leading-5 text-[#6d7c71]">
                      This is a demo transfer. No money will be sent and no
                      account balance will change.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={reviewTransfer}
                    disabled={!validRecipient || !validAmount}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#11583e] disabled:cursor-not-allowed disabled:bg-[#a7bdb0]"
                  >
                    Review transfer
                    <FiArrowRight size={17} />
                  </button>
                  {transferError && (
                    <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {transferError}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === "review" && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="mb-6 text-sm font-medium text-[#53745e] hover:text-[#176b4d]"
                >
                  ← Back to details
                </button>

                <div className="mb-7 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf3ec] text-[#176b4d]">
                    <FiArrowRight size={25} />
                  </div>
                  <h2 className="text-xl font-semibold">Review transfer</h2>
                  <p className="mt-2 text-sm text-[#829087]">
                    Check these details before confirming.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5ebe6] p-5">
                  <p className="text-center text-sm text-[#829087]">
                    Transfer amount
                  </p>
                  <p className="mt-2 text-center text-3xl font-semibold tracking-tight">
                    {formatAmount(parsedAmount, currency)}
                  </p>
                  <div className="my-5 border-t border-[#e8eee9]" />

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#829087]">Recipient ID</span>
                      <span className="break-all text-right font-medium">
                        {recipient}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[#829087]">Note</span>
                      <span className="max-w-[65%] text-right font-medium">
                        {note.trim() || "No note"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#829087]">Transfer fee</span>
                      <span className="font-medium">Not calculated</span>
                    </div>
                  </div>
                </div>

                <div className="my-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <FiInfo className="mt-1 shrink-0" size={17} />
                  Transfers are processed between Aven internal wallets.
                </div>

                <button
                  type="button"
                  onClick={confirmTransfer}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#11583e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Confirm transfer"}
                  <FiArrowRight size={17} />
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="py-8 text-center sm:py-12">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf3ec] text-[#176b4d]">
                  <FiCheck size={30} />
                </div>
                <h2 className="text-2xl font-semibold">Transfer completed</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#829087]">
                  Your transfer was completed through the Aven internal wallet.
                </p>
                <div className="mx-auto my-7 max-w-sm rounded-2xl border border-[#e5ebe6] p-5 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#829087]">Amount</span>
                    <span className="font-semibold">
                      {formatAmount(parsedAmount, currency)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <span className="text-sm text-[#829087]">Recipient</span>
                    <span className="break-all text-right text-sm font-medium">
                      {recipient}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-[#e8eee9] pt-4 text-xs leading-5 text-[#829087]">
                    Demo only · No real payment processed
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#11583e]"
                >
                  <FiRefreshCw size={16} />
                  Start another transfer
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#e5ebe6] bg-white p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#176b4d]">
                <FiCamera size={19} />
              </div>
              <h3 className="font-semibold">Pay with a QR code</h3>
              <p className="mt-2 text-sm leading-6 text-[#829087]">
                Scan another user's Aven Receive QR code to fill in their
                payment ID automatically.
              </p>
              <button
                type="button"
                onClick={() => {
                  scanHandledRef.current = false;
                  setScannerError("");
                  setScanning(true);
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8e7dc] px-4 py-3 text-sm font-semibold text-[#176b4d] transition hover:bg-[#f3f8f4]"
              >
                <FiCamera size={17} />
                Open QR scanner
              </button>
            </div>

            <div className="rounded-2xl border border-[#e5ebe6] bg-white p-6">
              <h3 className="font-semibold">Transfer protection</h3>
              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f5f1] text-[#53745e]">
                    <FiShield size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Check recipient details</p>
                    <p className="mt-1 text-xs leading-5 text-[#829087]">
                      Always verify the payment ID before proceeding.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f5f1] text-[#53745e]">
                    <FiLock size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review before confirming</p>
                    <p className="mt-1 text-xs leading-5 text-[#829087]">
                      Check the amount and recipient on the review screen.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f5f1] text-[#53745e]">
                    <FiCheckCircle size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Clear demo status</p>
                    <p className="mt-1 text-xs leading-5 text-[#829087]">
                      This prototype does not process real payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-[#e5ebe6] bg-[#eef5ef] p-5">
              <FiArrowDownLeft className="mt-0.5 shrink-0 text-[#53745e]" size={19} />
              <p className="text-xs leading-5 text-[#617568]">
                Want to receive money instead? Open the Receive page to display
                your own QR code and share your payment ID.
              </p>
            </div>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs text-[#9aa69d]">
          <FiLock className="mr-1 inline-block" size={12} />
          Aven prototype · Demo payments only
        </p>
      </div>
    </div>
  );
}
