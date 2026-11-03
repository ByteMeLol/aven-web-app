
import { FiArrowDownLeft, FiArrowUpRight, FiInbox } from "react-icons/fi";
import { money, type Transaction, type CurrencyCode } from "../lib/format";

export default function TransactionList({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: CurrencyCode;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <FiInbox size={23} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          No transactions yet
        </h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Your income and expenses will appear here once you start recording them.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((transaction) => {
        const income = transaction.type === "income";

        return (
          <div
            key={transaction.id}
            className="group flex items-center gap-3 py-4 transition-colors first:pt-0 last:pb-0 sm:gap-4"
          >
            {/* Transaction icon */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                income
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {income ? (
                <FiArrowDownLeft size={20} strokeWidth={1.8} />
              ) : (
                <FiArrowUpRight size={20} strokeWidth={1.8} />
              )}
            </div>

            {/* Transaction details */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-800">
                {transaction.title}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {transaction.category || "Other"}
                <span className="mx-1.5 text-slate-300">·</span>
                {new Date(transaction.date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Amount */}
            <div className="shrink-0 text-right">
              <p
                className={`text-sm font-semibold tabular-nums sm:text-base ${
                  income ? "text-emerald-700" : "text-slate-800"
                }`}
              >
                {income ? "+" : "−"}
                {money(transaction.amount, currency)}
              </p>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                {income ? "Income" : "Expense"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
