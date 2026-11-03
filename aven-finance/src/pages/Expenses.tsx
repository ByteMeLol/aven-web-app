import { useState } from "react";
import type { FormEvent } from "react";
import {
  FiPlus,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiFilter,
  FiX,
  FiArrowRight,
  FiActivity,
} from "react-icons/fi";
import { useFinance } from "../context/FinanceContext";
import { money } from "../lib/format";
import TransactionList from "../components/TransactionList";

export default function Expenses() {
  const { transactions, accounts, currency, addTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const visibleTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  const expenses = transactions.filter((item) => item.type === "expense");
  const income = transactions.filter((item) => item.type === "income");

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") || "").trim();
    const amount = Number(form.get("amount"));
    const type = String(form.get("type")) as "income" | "expense";
    const category = String(form.get("category") || "Other");
    const account = String(form.get("account") || "");

    if (
      !title ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !account
    ) {
      return;
    }

    addTransaction({ title, amount, type, category, account });
    formElement.reset();
    setShowForm(false);
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Money movement
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Keep track of the money coming in and going out.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:self-auto"
        >
          <FiPlus size={18} />
          Add transaction
        </button>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total recorded expenses
              </p>
              <h2 className="mt-4 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {money(totalExpenses, currency)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {expenses.length}{" "}
                {expenses.length === 1 ? "expense" : "expense transactions"}
              </p>
            </div>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <FiArrowUpRight size={24} />
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total recorded income
              </p>
              <h2 className="mt-4 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {money(totalIncome, currency)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {income.length}{" "}
                {income.length === 1 ? "income transaction" : "income transactions"}
              </p>
            </div>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FiArrowDownLeft size={24} />
            </span>
          </div>
        </article>
      </section>

      {/* Transactions panel */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and filter your recorded financial activity.
            </p>
          </div>

          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50 sm:min-w-48">
            <FiFilter size={17} className="shrink-0 text-slate-400" />
            <select
              aria-label="Filter transactions"
              className="w-full cursor-pointer bg-transparent py-2 text-sm font-medium text-slate-700 outline-none"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All transactions</option>
              <option value="expense">Expenses only</option>
              <option value="income">Income only</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("expense")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === "expense"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Expenses ({expenses.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("income")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === "income"
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Income ({income.length})
          </button>
        </div>

        <div className="min-w-0 px-3 pb-4 sm:px-5">
          {visibleTransactions.length > 0 ? (
            <TransactionList
              transactions={visibleTransactions}
              currency={currency}
            />
          ) : (
            <div className="px-4 py-12 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FiActivity size={26} />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">
                No transactions found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {filter === "all"
                  ? "Your recorded income and expenses will appear here."
                  : `You haven't recorded any ${filter === "expense" ? "expenses" : "income"} yet.`}
              </p>

              {filter === "all" && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                >
                  Add your first transaction <FiArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            Showing {visibleTransactions.length} of {transactions.length} transactions
          </p>
        </div>
      </section>

      {/* Add transaction modal */}
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
            onSubmit={submitTransaction}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Money movement
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  New transaction
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record income or an expense.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close transaction form"
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
                  required
                  placeholder="e.g. Freelance payment"
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
                  Transaction type
                </span>
                <select
                  name="type"
                  defaultValue="expense"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </span>
                <select
                  name="category"
                  defaultValue="Other"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Salary</option>
                  <option>Shopping</option>
                  <option>Housing</option>
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
                    Create an account before recording a transaction.
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
                Save transaction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}