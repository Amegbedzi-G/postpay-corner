import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type MessageMedia = {
  type: "image" | "video" | "file";
  url: string;
  fileName?: string;
  fileSize?: number;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: MessageMedia[];
  isPPV: boolean;
  price: number;
  isRead: boolean;
  isUnlocked: boolean;
  isPinned?: boolean;
  timestamp: Date;
  tipAmount?: number;
};

export type PaymentRequest = {
  id: string;
  userId: string;
  amount: number;
  method: "PayPal" | "CashApp" | "Apple Pay" | "Bank Transfer" | "Crypto";
  status: "pending" | "completed" | "rejected";
  timestamp: Date;
  paymentDetails?: string;
  screenshot?: string;
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
    media?: MessageMedia[],
    isPPV?: boolean,
    price?: number
  ) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  unlockPPVMessage: (conversationId: string, messageId: string) => void;
  sendTip: (conversationId: string, messageId: string, amount: number) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
  requestPayment: (userId: string, amount: number, method: PaymentRequest["method"]) => void;
  approvePaymentRequest: (requestId: string, paymentDetails?: string) => void;
  rejectPaymentRequest: (requestId: string) => void;
  submitPaymentProof: (requestId: string, screenshot: string) => void;
  getUserPaymentRequests: (userId: string) => PaymentRequest[];
  getAllPaymentRequests: () => PaymentRequest[];
  togglePinMessage: (conversationId: string, messageId: string) => void;
  canSendMessage: (senderId: string, receiverId: string) => boolean;
  updatePaymentDetails: (requestId: string, paymentDetails: string) => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Define some mock conversations and messages
const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: ["admin1", "user1"],
    unreadCount: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: "msg1",
      senderId: "admin1",
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
      senderId: "admin1",
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
  const { user, addNotification } = useAuth();
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

  const canSendMessage = (senderId: string, receiverId: string) => {
    // Admin can always send messages
    if (senderId === "admin1") return true;
    
    // User can send message to admin if they're subscribed
    if (receiverId === "admin1") {
      const sender = user;
      if (!sender) return false;
      
      // Allow the first message to be sent (to request subscription)
      const existingConv = getConversation(senderId, receiverId);
      if (!existingConv) return true;
      
      const convMessages = messages[existingConv.id] || [];
      const userMessages = convMessages.filter(msg => msg.senderId === senderId);
      
      // If user has already sent more than one message, they need to be subscribed
      if (userMessages.length > 1) {
        return sender.isSubscribed;
      }
      
      return true;
    }
    
    // Other users can message each other freely
    return true;
  };

  const sendMessage = (
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    media?: MessageMedia[],
    isPPV = false,
    price = 0
  ) => {
    // Check if sender can send a message to receiver
    if (!canSendMessage(senderId, receiverId)) {
      return false;
    }
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      media,
      isPPV,
      price,
      isRead: false,
      isUnlocked: !isPPV, // PPV messages start locked
      isPinned: false,
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

    // Notify admin if message is sent to them
    if (receiverId === "admin1") {
      addNotification?.({
        userId: "admin1",
        type: "message",
        title: "New Message",
        message: `You have a new message from ${senderId}`,
        data: { conversationId, messageId: newMessage.id }
      });
    }
    
    // Also notify subscriber if they received a message from admin
    if (senderId === "admin1" && user?.isSubscribed) {
      addNotification?.({
        userId: receiverId,
        type: "message",
        title: "New Creator Message",
        message: "The creator sent you a new message",
        data: { conversationId, messageId: newMessage.id }
      });
    }
    
    return true;
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

  const togglePinMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, isPinned: !msg.isPinned }
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
    
    // Notify admin about the new payment request
    addNotification?.({
      userId: "admin1", // Admin's ID
      type: "payment_request",
      title: "New Payment Request",
      message: `User ${userId} requested a payment of $${amount.toFixed(2)} via ${method}`,
      data: { requestId: newRequest.id }
    });
    
    return newRequest.id;
  };

  const updatePaymentDetails = (requestId: string, paymentDetails: string) => {
    setPaymentRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, paymentDetails } 
          : req
      )
    );
    
    // Find the request to get the user ID
    const request = paymentRequests.find(req => req.id === requestId);
    
    if (request) {
      // Notify the user that payment details have been added
      addNotification?.({
        userId: request.userId,
        type: "payment_request",
        title: "Payment Details Added",
        message: `The admin has added payment details for your $${request.amount.toFixed(2)} request`,
        data: { requestId }
      });
    }
  };
  
  const submitPaymentProof = (requestId: string, screenshot: string) => {
    setPaymentRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, screenshot } 
          : req
      )
    );
    
    // Notify admin about the payment proof
    const request = paymentRequests.find(req => req.id === requestId);
    
    if (request) {
      addNotification?.({
        userId: "admin1",
        type: "payment_request",
        title: "Payment Proof Submitted",
        message: `User ${request.userId} has submitted payment proof for $${request.amount.toFixed(2)}`,
        data: { requestId }
      });
    }
  };

  const approvePaymentRequest = (requestId: string, paymentDetails?: string) => {
    const request = paymentRequests.find(req => req.id === requestId);
    
    if (request) {
      // Update payment details if provided
      const updatedRequest = paymentDetails 
        ? { ...request, paymentDetails, status: "completed" }
        : { ...request, status: "completed" };
        
      // Notify the user their payment request was approved
      addNotification?.({
        userId: request.userId,
        type: "payment_request",
        title: "Payment Request Approved",
        message: `Your payment request for $${request.amount.toFixed(2)} has been approved`,
        data: { requestId }
      });
      
      setPaymentRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? updatedRequest
            : req
        )
      );
    }
  };

  const rejectPaymentRequest = (requestId: string) => {
    const request = paymentRequests.find(req => req.id === requestId);
    
    if (request) {
      // Notify the user their payment request was rejected
      addNotification?.({
        userId: request.userId,
        type: "payment_request",
        title: "Payment Request Rejected",
        message: `Your payment request for $${request.amount.toFixed(2)} has been rejected`,
        data: { requestId }
      });
    }
    
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
        togglePinMessage,
        canSendMessage,
        updatePaymentDetails,
        submitPaymentProof
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
