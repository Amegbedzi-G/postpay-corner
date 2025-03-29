
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
  bio?: string;
  name?: string;
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
  updateProfile: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

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
      
      // Check for admin credentials
      if (email === ADMIN_EMAIL) {
        // For admin, we check the specific password
        if (password !== ADMIN_PASSWORD) {
          throw new Error("Invalid admin password");
        }
        
        const mockUser: User = {
          id: "admin1",
          username: "Admin",
          email,
          isAdmin: true,
          balance: 1000, // Higher balance for admin
          avatar: "https://ui-avatars.com/api/?name=Admin",
          isSubscribed: true,
          name: "Admin User",
          bio: "Platform administrator and content creator.",
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      } else {
        // For regular users, we just check if password meets length requirements
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        
        const mockUser: User = {
          id: Date.now().toString(),
          username: email.split("@")[0],
          email,
          isAdmin: false,
          balance: 100,
          avatar: "https://ui-avatars.com/api/?name=" + email.split("@")[0],
          isSubscribed: false,
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
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
  
  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
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
        updateProfile,
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
