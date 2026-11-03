import { useState } from "react";
import type { FormEvent } from "react";
import {
  FiPlus,
  FiArrowUpRight,
  FiBriefcase,
  FiTrendingUp,
  FiX,
  FiArrowRight,
  FiCreditCard,
  FiActivity,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { money } from "../lib/format";
import TransactionList from "../components/TransactionList";

export default function Home() {
  const { transactions, accounts, currency, addTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const totalSpent = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") || "").trim();
    const amount = Number(form.get("amount"));
    const category = String(form.get("category") || "Other");
    const account = String(form.get("account") || accounts[0]?.name || "");

    if (!title || !Number.isFinite(amount) || amount <= 0 || !account) {
      return;
    }

    addTransaction({
      title,
      amount,
      category,
      account,
      type: "expense",
    });

    formElement.reset();
    setShowForm(false);
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Your overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Good to see you.
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Here is a snapshot of your finances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:self-auto"
        >
          <FiPlus size={18} />
          Add expense
        </button>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="relative overflow-hidden rounded-2xl bg-emerald-800 p-6 text-white shadow-sm">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-100">
              Total balance
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <FiBriefcase size={20} />
            </span>
          </div>

          <h2 className="relative mt-6 break-words text-3xl font-bold tracking-tight sm:text-4xl">
            {money(totalBalance, currency)}
          </h2>
          <p className="relative mt-2 text-sm text-emerald-100">
            Across your tracked accounts
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Recorded expenses
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <FiArrowUpRight size={21} />
            </span>
          </div>

          <h2 className="mt-6 break-words text-3xl font-bold tracking-tight text-slate-900">
            {money(totalSpent, currency)}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            All expenses currently recorded
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Tracked accounts
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiTrendingUp size={21} />
            </span>
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            {accounts.length}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Accounts you are tracking
          </p>
        </article>
      </section>

      {/* Account and activity sections */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your accounts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Balances across your wallets.
              </p>
            </div>
            <Link
              to="/accounts"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              View all <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 px-5 sm:px-6">
            {accounts.length > 0 ? (
              accounts.slice(0, 4).map((account) => (
                <div
                  className="flex items-center gap-3 py-4"
                  key={account.id}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FiCreditCard size={20} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {account.name}
                    </p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {account.type}
                    </p>
                  </div>

                  <p className="max-w-[45%] break-words text-right text-sm font-bold text-slate-900">
                    {money(account.balance, currency)}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <FiCreditCard
                  size={28}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 font-semibold text-slate-700">
                  No accounts yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add an account to start tracking your money.
                </p>
                <Link
                  to="/accounts"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Create an account <FiArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
            <Link
              to="/accounts"
              className="text-xs font-medium text-slate-500 transition hover:text-emerald-700"
            >
              Manage your accounts
            </Link>
          </div>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest recorded transactions.
              </p>
            </div>
            <Link
              to="/expenses"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              View all <FiArrowRight size={16} />
            </Link>
          </div>

          {transactions.length > 0 ? (
            <div className="px-3 py-2 sm:px-5">
              <TransactionList
                transactions={transactions.slice(0, 5)}
                currency={currency}
              />
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <FiActivity size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No activity yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your transactions will appear here when you record them.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                <FiPlus size={16} /> Add your first expense
              </button>
            </div>
          )}
        </article>
      </section>

      {/* Add expense modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <form
            onSubmit={submitExpense}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Transaction
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  Add an expense
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record a payment you have made.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close expense form"
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FiX size={21} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </span>
                <input
                  name="title"
                  placeholder="e.g. Groceries"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount ({currency})
                </span>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </span>
                <select
                  name="category"
                  defaultValue="Food"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Housing</option>
                  <option>Shopping</option>
                  <option>Health</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Account
                </span>
                <select
                  name="account"
                  required
                  defaultValue={accounts[0]?.name ?? ""}
                  disabled={accounts.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {accounts.length === 0 ? (
                    <option value="">No accounts available</option>
                  ) : (
                    accounts.map((account) => (
                      <option key={account.id} value={account.name}>
                        {account.name}
                      </option>
                    ))
                  )}
                </select>
                {accounts.length === 0 && (
                  <span className="mt-2 block text-xs text-rose-600">
                    Create an account before recording an expense.
                  </span>
                )}
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={accounts.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPlus size={17} />
                Save expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}