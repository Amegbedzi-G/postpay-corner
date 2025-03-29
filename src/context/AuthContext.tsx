
import { createContext, useContext, useState, useEffect } from "react";

export type Notification = {
  id: string;
  userId: string;
  type: "payment_request" | "message" | "tip" | "subscription" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any; // Additional data specific to notification type
};

export type PaymentMethod = "PayPal" | "CashApp" | "Apple Pay" | "Bank Transfer" | "Crypto";

export type PaymentRequest = {
  id: string;
  userId: string;
  username: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  method?: PaymentMethod;
  createdAt: Date;
  note?: string;
};

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
  notifications?: Notification[];
  paymentRequests?: PaymentRequest[];
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
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationsCount: () => number;
  getNotifications: () => Notification[];
  addPaymentRequest: (request: Omit<PaymentRequest, "id" | "createdAt" | "status">) => void;
  updatePaymentRequest: (requestId: string, updates: Partial<PaymentRequest>) => void;
  getPaymentRequests: () => PaymentRequest[];
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
        
        // Convert date strings back to Date objects
        if (parsedUser.subscriptionEndDate) {
          parsedUser.subscriptionEndDate = new Date(parsedUser.subscriptionEndDate);
        }
        
        if (parsedUser.notifications) {
          parsedUser.notifications = parsedUser.notifications.map((notif: any) => ({
            ...notif,
            createdAt: new Date(notif.createdAt)
          }));
        } else {
          parsedUser.notifications = [];
        }
        
        if (parsedUser.paymentRequests) {
          parsedUser.paymentRequests = parsedUser.paymentRequests.map((req: any) => ({
            ...req,
            createdAt: new Date(req.createdAt)
          }));
        } else {
          parsedUser.paymentRequests = [];
        }
        
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

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    if (user) {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date(),
        read: false
      };
      
      const updatedUser = {
        ...user,
        notifications: [newNotification, ...(user.notifications || [])]
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      return newNotification;
    }
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    if (user && user.notifications) {
      const updatedNotifications = user.notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      
      const updatedUser = {
        ...user,
        notifications: updatedNotifications
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  
  const getUnreadNotificationsCount = () => {
    if (!user || !user.notifications) return 0;
    return user.notifications.filter(notif => !notif.read).length;
  };
  
  const getNotifications = () => {
    if (!user || !user.notifications) return [];
    return [...user.notifications].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  };
  
  const addPaymentRequest = (request: Omit<PaymentRequest, "id" | "createdAt" | "status">) => {
    if (user) {
      const newRequest: PaymentRequest = {
        ...request,
        id: Date.now().toString(),
        createdAt: new Date(),
        status: "pending"
      };
      
      const updatedUser = {
        ...user,
        paymentRequests: [newRequest, ...(user.paymentRequests || [])]
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Also add a notification for the admin
      if (user.isAdmin) {
        addNotification({
          userId: user.id,
          type: "payment_request",
          title: "New payment request",
          message: `${request.username} requested a payment of $${request.amount}`,
          data: { requestId: newRequest.id }
        });
      }
      
      return newRequest;
    }
  };
  
  const updatePaymentRequest = (requestId: string, updates: Partial<PaymentRequest>) => {
    if (user && user.paymentRequests) {
      const updatedRequests = user.paymentRequests.map(req => 
        req.id === requestId ? { ...req, ...updates } : req
      );
      
      const updatedUser = {
        ...user,
        paymentRequests: updatedRequests
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  
  const getPaymentRequests = () => {
    if (!user || !user.paymentRequests) return [];
    return [...user.paymentRequests].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
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
        addNotification,
        markNotificationAsRead,
        getUnreadNotificationsCount,
        getNotifications,
        addPaymentRequest,
        updatePaymentRequest,
        getPaymentRequests
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
