
export type CurrencyCode = "USD" | "TZS";

export const currencies: CurrencyCode[] = ["USD", "TZS"];

export function money(
  amount: number,
  currency: CurrencyCode = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export type Transaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  account: string;
};

export type FinanceAccount = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: CurrencyCode;
};
