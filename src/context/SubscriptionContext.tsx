
import { createContext, useContext, useState, useEffect } from "react";

export type SubscriptionPlan = {
  id: string;
  name: string;
  period: "weekly" | "monthly" | "yearly";
  price: number;
  features: string[];
};

type SubscriptionContextType = {
  plans: SubscriptionPlan[];
  loading: boolean;
  addPlan: (plan: Omit<SubscriptionPlan, "id">) => void;
  updatePlan: (id: string, plan: Partial<Omit<SubscriptionPlan, "id">>) => void;
  removePlan: (id: string) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Sample subscription plans
const mockPlans: SubscriptionPlan[] = [
  {
    id: "weekly",
    name: "Weekly Pass",
    period: "weekly",
    price: 4.99,
    features: [
      "Access to all premium content",
      "Direct messaging with creator",
      "Comment on all posts"
    ],
  },
  {
    id: "monthly",
    name: "Monthly VIP",
    period: "monthly",
    price: 14.99,
    features: [
      "All weekly pass features",
      "10% discount on PPV content",
      "Early access to new content"
    ],
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    period: "yearly",
    price: 149.99,
    features: [
      "All monthly features",
      "20% discount on PPV content",
      "Exclusive yearly subscriber content",
      "Priority responses to messages"
    ],
  },
];

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage or use mock data
    const storedPlans = localStorage.getItem("subscriptionPlans");
    if (storedPlans) {
      try {
        const parsedPlans = JSON.parse(storedPlans);
        setPlans(parsedPlans);
      } catch (error) {
        console.error("Failed to parse stored plans:", error);
        setPlans(mockPlans);
      }
    } else {
      setPlans(mockPlans);
      localStorage.setItem("subscriptionPlans", JSON.stringify(mockPlans));
    }
    setLoading(false);
  }, []);

  // Update localStorage whenever plans change
  useEffect(() => {
    if (plans.length > 0) {
      localStorage.setItem("subscriptionPlans", JSON.stringify(plans));
    }
  }, [plans]);

  const addPlan = (plan: Omit<SubscriptionPlan, "id">) => {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: Date.now().toString(),
    };
    setPlans((prev) => [...prev, newPlan]);
  };

  const updatePlan = (id: string, updates: Partial<Omit<SubscriptionPlan, "id">>) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, ...updates } : plan
      )
    );
  };

  const removePlan = (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        loading,
        addPlan,
        updatePlan,
        removePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
