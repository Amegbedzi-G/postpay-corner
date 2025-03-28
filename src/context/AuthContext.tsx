
import { createContext, useContext, useState, useEffect } from "react";

export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  balance: number;
  avatar?: string;
  isSubscribed: boolean;
  subscriptionType?: "weekly" | "monthly" | "yearly";
  subscriptionEndDate?: Date;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserBalance: (newBalance: number) => void;
  updateSubscription: (type: "weekly" | "monthly" | "yearly", endDate: Date) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    setIsLoading(true);
    try {
      // For demo purposes, we'll create a mock user
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockUser: User = {
        id: "1",
        username: email.split("@")[0],
        email,
        isAdmin: email.includes("admin"),
        balance: 100,
        avatar: "https://ui-avatars.com/api/?name=" + email.split("@")[0],
        isSubscribed: false,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    // Simulate API call
    setIsLoading(true);
    try {
      // For demo purposes, we'll create a mock user
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockUser: User = {
        id: Date.now().toString(),
        username,
        email,
        isAdmin: email.includes("admin"),
        balance: 50, // Starting balance for new users
        avatar: "https://ui-avatars.com/api/?name=" + username,
        isSubscribed: false,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUserBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const updateSubscription = (
    type: "weekly" | "monthly" | "yearly",
    endDate: Date
  ) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        isSubscribed: true, 
        subscriptionType: type, 
        subscriptionEndDate: endDate 
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserBalance,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
