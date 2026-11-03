import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  CurrencyCode,
  FinanceAccount,
  Transaction,
} from "../lib/format";
import api from "../lib/api";

type FinanceContextType = {
  transactions: Transaction[];
  accounts: FinanceAccount[];
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "date">,
  ) => void;
  addAccount: (
    account: Omit<FinanceAccount, "id">,
  ) => void;
};

const FinanceContext = createContext<FinanceContextType | null>(null);

const initialTransactions: Transaction[] = [
  {
    id: "1",
    title: "Salary",
    category: "Income",
    amount: 2400,
    type: "income",
    date: new Date().toISOString(),
    account: "Personal",
  },
  {
    id: "2",
    title: "Groceries",
    category: "Food",
    amount: 86.4,
    type: "expense",
    date: new Date().toISOString(),
    account: "Personal",
  },
  {
    id: "3",
    title: "Coffee",
    category: "Food & Drink",
    amount: 6.8,
    type: "expense",
    date: new Date().toISOString(),
    account: "Aven Wallet",
  },
  {
    id: "4",
    title: "Transport",
    category: "Travel",
    amount: 25,
    type: "expense",
    date: new Date().toISOString(),
    account: "Personal",
  },
];

const initialAccounts: FinanceAccount[] = [
  {
    id: "1",
    name: "Aven Wallet",
    type: "Mobile Wallet",
    balance: 420,
    currency: "USD",
  },
  {
    id: "2",
    name: "Personal",
    type: "Bank Account",
    balance: 8450.8,
    currency: "USD",
  },
  {
    id: "3",
    name: "Household",
    type: "Shared Account",
    balance: 3200,
    currency: "USD",
  },
  {
    id: "4",
    name: "Reserve",
    type: "Savings",
    balance: 6800,
    currency: "USD",
  },
];

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  async function setCurrency(nextCurrency: CurrencyCode) {
    try {
      await api.put("/api/wallet/currency", { currency: nextCurrency });
      setCurrencyState(nextCurrency);
      window.dispatchEvent(new Event("aven-finance-changed"));
    } catch (error) {
      console.error("Unable to change Aven Wallet currency:", error);
    }
  }

  useEffect(() => {
    async function loadFinance() {
      if (!localStorage.getItem("aven-access-token")) return;
      try {
        const [accountResponse, transactionResponse] = await Promise.all([
          api.get<Array<FinanceAccount & { defaultAccount: boolean }>>("/api/accounts"),
          api.get<Array<{
            id: number;
            accountId: number;
            account: string;
            type: string;
            amount: number;
            currency: CurrencyCode;
            description: string;
            category: string | null;
            occurredAt: string;
          }>>("/api/transactions"),
        ]);
        setAccounts(accountResponse.data.map((account) => ({
          id: String(account.id),
          name: account.name,
          type: account.type,
          balance: Number(account.balance),
          currency: account.currency,
        })));
        const wallet = accountResponse.data.find((account) => account.defaultAccount);
        if (wallet && (wallet.currency === "USD" || wallet.currency === "TZS")) {
          setCurrencyState(wallet.currency);
        }
        setTransactions(transactionResponse.data.map((transaction) => ({
          id: String(transaction.id),
          title: transaction.description,
          category: transaction.category ?? "Other",
          amount: Number(transaction.amount),
          type: transaction.type === "INCOME" || transaction.type === "TRANSFER_IN"
            ? "income"
            : "expense",
          date: transaction.occurredAt,
          account: transaction.account,
        })));
      } catch (error) {
        console.error("Unable to load finance data:", error);
      }
    }

    void loadFinance();
    window.addEventListener("aven-auth-changed", loadFinance);
    window.addEventListener("aven-finance-changed", loadFinance);
    return () => {
      window.removeEventListener("aven-auth-changed", loadFinance);
      window.removeEventListener("aven-finance-changed", loadFinance);
    };
  }, []);

  function addTransaction(
    transaction: Omit<Transaction, "id" | "date">,
  ) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    const account = accounts.find((item) => item.name === transaction.account);
    if (!account) return;

    void api.post("/api/transactions", {
      accountId: Number(account.id),
      type: transaction.type === "income" ? "INCOME" : "EXPENSE",
      amount: transaction.amount,
      currency: account.currency,
      description: transaction.title,
      category: transaction.category,
      idempotencyKey: crypto.randomUUID(),
    }).then(() => {
      setTransactions((previous) => [newTransaction, ...previous]);
      setAccounts((previous) => previous.map((item) =>
        item.id === account.id
          ? { ...item, balance: item.balance + (transaction.type === "income" ? transaction.amount : -transaction.amount) }
          : item,
      ));
    }).catch((error) => {
      console.error("Unable to save transaction:", error);
    });
  }

  function addAccount(account: Omit<FinanceAccount, "id">) {
    void api.post("/api/accounts", {
      ...account,
      openingBalance: account.balance,
    }).then((response) => {
      setAccounts((previous) => [
        ...previous,
        { ...account, id: String(response.data.id) },
      ]);
    }).catch((error) => {
      console.error("Unable to save account:", error);
    });
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        currency,
        setCurrency,
        addTransaction,
        addAccount,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance must be used inside FinanceProvider");
  }

  return context;
}