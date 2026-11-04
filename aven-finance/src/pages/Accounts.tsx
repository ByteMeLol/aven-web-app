
import { useState } from "react";
import type { FormEvent } from "react";
import {
  FiPlus,
FiBriefcase,
  FiHome,
  FiSmartphone,
  FiTrendingUp,
  FiX,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { useFinance } from "../context/FinanceContext";
import {
  currencies,
  money,
  type CurrencyCode,
} from "../lib/format";

export default function Accounts() {
  const { accounts, addAccount, currency } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const type = String(form.get("type") || "Cash");
    const rawBalance = String(form.get("balance") ?? "0").trim();
    const balance = Number(rawBalance);
    const accountCurrency = String(
      form.get("currency") || currency,
    ) as CurrencyCode;

    if (!name) {
      setError("Please enter an account name.");
      return;
    }

    if (
      rawBalance === "" ||
      !Number.isFinite(balance) ||
      balance < 0
    ) {
      setError("Please enter a valid balance of zero or more.");
      return;
    }

    void addAccount({
      name,
      type,
      balance,
      currency: accountCurrency,
    }).then((saved) => {
      if (saved) {
        setError("");
        setShowForm(false);
      }
    });
  }

  function iconFor(type: string) {
    const normalized = type.toLowerCase();

    if (normalized.includes("bank")) return FiHome;
    if (normalized.includes("mobile")) return FiSmartphone;
    if (normalized.includes("saving")) return FiTrendingUp;

    return FiBriefcase;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Your money
          </span>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Accounts
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage the accounts and wallets you use to track your money.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:self-auto"
        >
          <FiPlus size={18} />
          Add account
        </button>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Accounts tracked
            </p>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FiBriefcase size={21} />
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {accounts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Your wallets and tracked accounts
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Preferred currency
            </p>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FiTrendingUp size={21} />
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {currency}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Your current display preference
          </p>
        </article>
      </section>

      {/* Account list */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Your accounts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {accounts.length}{" "}
              {accounts.length === 1 ? "account" : "accounts"} being tracked
            </p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <FiBriefcase size={25} />
            </span>

            <h3 className="font-semibold text-slate-800">
              No accounts yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create an account to start tracking your cash, bank balances,
              and mobile wallets.
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <FiPlus size={17} />
              Create account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const Icon = iconFor(account.type);

              return (
                <article
                  key={account.id}
                  className="group min-w-0 rounded-2xl border border-slate-200 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-100">
                      <Icon size={22} strokeWidth={1.8} />
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <FiCheckCircle size={13} />
                      Tracked
                    </span>
                  </div>

                  <h3 className="mt-5 break-words font-semibold text-slate-900">
                    {account.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {account.type}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-400">
                      Current balance
                    </p>

                    <p className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900">
                      {money(account.balance, account.currency)}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Currency: {account.currency}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Tracking notice */}
      <section className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 sm:p-5">
        <FiInfo className="mt-0.5 shrink-0 text-amber-700" size={20} />

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Server-backed account tracking
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Account balances are tracked within the app. They are not
            connected to banks or mobile money providers, and creating an
            account here does not open a real financial account.
          </p>
        </div>
      </section>

      {/* Add account modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <form
            onSubmit={submitAccount}
            className="my-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Account setup
                </span>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Add an account
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Create a wallet or account to track your balance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close dialog"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FiX size={21} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account name
                </span>

                <input
                  name="name"
                  required
                  maxLength={60}
                  autoFocus
                  placeholder="e.g. M-Pesa, Personal Bank"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account type
                </span>

                <select
                  name="type"
                  defaultValue="Cash"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                >
                  <option>Cash</option>
                  <option>Mobile Wallet</option>
                  <option>Bank Account</option>
                  <option>Savings</option>
                  <option>Shared Account</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Starting balance
                </span>

                <input
                  name="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue="0"
                  inputMode="decimal"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account currency
                </span>

                <select
                  name="currency"
                  defaultValue={currency}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                >
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                <FiPlus size={17} />
                Create account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
