
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type Transaction = {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "payment" | "subscription" | "tip";
  amount: number;
  description: string;
  timestamp: Date;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  addFunds: (amount: number) => void;
  makePayment: (amount: number, description: string, type: Transaction["type"]) => boolean;
  getTransactions: () => Transaction[];
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, updateUserBalance } = useAuth();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Set initial balance from user
      setBalance(user.balance);

      // Load transactions from localStorage
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          // Convert timestamp strings back to Date objects
          const transactionsWithDates = parsedTransactions.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }));
          setTransactions(transactionsWithDates);
        } catch (error) {
          console.error("Failed to parse stored transactions:", error);
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    }
    setLoading(false);
  }, [user]);

  // Update localStorage whenever transactions change
  useEffect(() => {
    if (user && transactions.length > 0) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const addFunds = (amount: number) => {
    if (!user) return;

    const newBalance = balance + amount;
    setBalance(newBalance);
    updateUserBalance(newBalance);

    const transaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      type: "deposit",
      amount,
      description: `Added ${amount} credits to wallet`,
      timestamp: new Date(),
    };

    setTransactions((prev) => [transaction, ...prev]);
  };

  const makePayment = (amount: number, description: string, type: Transaction["type"]) => {
    if (!user) return false;
    if (balance < amount) return false;

    const newBalance = balance - amount;
    setBalance(newBalance);
    updateUserBalance(newBalance);

    const transaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      type,
      amount: -amount,
      description,
      timestamp: new Date(),
    };

    setTransactions((prev) => [transaction, ...prev]);
    return true;
  };

  const getTransactions = () => {
    return [...transactions].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        addFunds,
        makePayment,
        getTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
