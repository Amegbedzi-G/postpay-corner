
import { createContext, useContext, useState, useEffect } from "react";

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isPPV: boolean;
  price: number;
  isRead: boolean;
  isUnlocked: boolean;
  timestamp: Date;
  tipAmount?: number;
};

export type PaymentRequest = {
  id: string;
  userId: string;
  amount: number;
  method: "PayPal" | "CashApp" | "ApplePay" | "BankTransfer" | "Crypto";
  status: "pending" | "completed" | "rejected";
  timestamp: Date;
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
};

type MessageContextType = {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  paymentRequests: PaymentRequest[];
  loading: boolean;
  getConversation: (userId1: string, userId2: string) => Conversation | undefined;
  createConversation: (participants: string[]) => string;
  sendMessage: (
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    isPPV?: boolean,
    price?: number
  ) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  unlockPPVMessage: (conversationId: string, messageId: string) => void;
  sendTip: (conversationId: string, messageId: string, amount: number) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
  requestPayment: (userId: string, amount: number, method: PaymentRequest["method"]) => void;
  approvePaymentRequest: (requestId: string) => void;
  rejectPaymentRequest: (requestId: string) => void;
  getUserPaymentRequests: (userId: string) => PaymentRequest[];
  getAllPaymentRequests: () => PaymentRequest[];
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Define some mock conversations and messages
const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: ["admin", "user1"],
    unreadCount: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: "msg1",
      senderId: "admin",
      receiverId: "user1",
      content: "Welcome to my page! Thanks for subscribing.",
      isPPV: false,
      price: 0,
      isRead: false,
      isUnlocked: true,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: "msg2",
      senderId: "admin",
      receiverId: "user1",
      content: "Here's some exclusive content just for you!",
      isPPV: true,
      price: 5,
      isRead: false,
      isUnlocked: false,
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    },
  ],
};

const mockPaymentRequests: PaymentRequest[] = [];

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage or use mock data
    const storedConversations = localStorage.getItem("conversations");
    const storedMessages = localStorage.getItem("messages");
    const storedPaymentRequests = localStorage.getItem("paymentRequests");

    if (storedConversations && storedMessages) {
      try {
        const parsedConversations = JSON.parse(storedConversations);
        const parsedMessages = JSON.parse(storedMessages);
        const parsedPaymentRequests = storedPaymentRequests ? JSON.parse(storedPaymentRequests) : [];

        // Convert timestamp strings back to Date objects
        const messagesWithDates: Record<string, Message[]> = {};
        Object.keys(parsedMessages).forEach((convId) => {
          messagesWithDates[convId] = parsedMessages[convId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        });

        const paymentRequestsWithDates = parsedPaymentRequests.map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp),
        }));

        setConversations(parsedConversations);
        setMessages(messagesWithDates);
        setPaymentRequests(paymentRequestsWithDates);
      } catch (error) {
        console.error("Failed to parse stored messages data:", error);
        setConversations(mockConversations);
        setMessages(mockMessages);
        setPaymentRequests(mockPaymentRequests);
      }
    } else {
      setConversations(mockConversations);
      setMessages(mockMessages);
      setPaymentRequests(mockPaymentRequests);
      localStorage.setItem("conversations", JSON.stringify(mockConversations));
      localStorage.setItem("messages", JSON.stringify(mockMessages));
      localStorage.setItem("paymentRequests", JSON.stringify(mockPaymentRequests));
    }
    setLoading(false);
  }, []);

  // Update localStorage whenever messages or conversations or payment requests change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
    if (Object.keys(messages).length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
    if (paymentRequests.length > 0) {
      localStorage.setItem("paymentRequests", JSON.stringify(paymentRequests));
    }
  }, [conversations, messages, paymentRequests]);

  const getConversation = (userId1: string, userId2: string) => {
    return conversations.find((conv) =>
      conv.participants.includes(userId1) && conv.participants.includes(userId2)
    );
  };

  const createConversation = (participants: string[]) => {
    // Check if conversation already exists
    const existingConv = conversations.find((conv) =>
      participants.every((p) => conv.participants.includes(p)) &&
      conv.participants.length === participants.length
    );

    if (existingConv) {
      return existingConv.id;
    }

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants,
      unreadCount: 0,
    };

    setConversations((prev) => [...prev, newConversation]);
    setMessages((prev) => ({ ...prev, [newConversation.id]: [] }));

    return newConversation.id;
  };

  const sendMessage = (
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    isPPV = false,
    price = 0
  ) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      isPPV,
      price,
      isRead: false,
      isUnlocked: !isPPV, // PPV messages start locked
      timestamp: new Date(),
    };

    // Update messages
    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...conversationMessages, newMessage],
      };
    });

    // Update conversation with last message and unread count
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: newMessage,
            unreadCount: conv.unreadCount + 1,
          };
        }
        return conv;
      })
    );
  };

  const markAsRead = (conversationId: string, userId: string) => {
    // Mark messages as read where user is the receiver
    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.receiverId === userId && !msg.isRead
          ? { ...msg, isRead: true }
          : msg
      );
      return { ...prev, [conversationId]: updatedMessages };
    });

    // Reset unread count for the conversation
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      })
    );
  };

  const unlockPPVMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isUnlocked: true } : msg
      );
      return { ...prev, [conversationId]: updatedMessages };
    });
  };

  const sendTip = (conversationId: string, messageId: string, amount: number) => {
    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, tipAmount: (msg.tipAmount || 0) + amount }
          : msg
      );
      return { ...prev, [conversationId]: updatedMessages };
    });
  };

  const requestPayment = (userId: string, amount: number, method: PaymentRequest["method"]) => {
    const newRequest: PaymentRequest = {
      id: `req-${Date.now()}`,
      userId,
      amount,
      method,
      status: "pending",
      timestamp: new Date(),
    };

    setPaymentRequests(prev => [...prev, newRequest]);
  };

  const approvePaymentRequest = (requestId: string) => {
    setPaymentRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "completed" } 
          : req
      )
    );
  };

  const rejectPaymentRequest = (requestId: string) => {
    setPaymentRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "rejected" } 
          : req
      )
    );
  };

  const getUserPaymentRequests = (userId: string) => {
    return paymentRequests.filter(req => req.userId === userId);
  };

  const getAllPaymentRequests = () => {
    return [...paymentRequests].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  const getConversationMessages = (conversationId: string) => {
    return messages[conversationId] || [];
  };

  const getUserConversations = (userId: string) => {
    return conversations.filter((conv) =>
      conv.participants.includes(userId)
    );
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        paymentRequests,
        loading,
        getConversation,
        createConversation,
        sendMessage,
        markAsRead,
        unlockPPVMessage,
        sendTip,
        getConversationMessages,
        getUserConversations,
        requestPayment,
        approvePaymentRequest,
        rejectPaymentRequest,
        getUserPaymentRequests,
        getAllPaymentRequests,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
