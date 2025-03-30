
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

export type MessageContextType = {
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
  ) => boolean;
  markAsRead: (conversationId: string, userId: string) => void;
  unlockPPVMessage: (conversationId: string, messageId: string) => void;
  sendTip: (conversationId: string, messageId: string, amount: number) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
  requestPayment: (userId: string, amount: number, method: PaymentRequest["method"]) => string;
  approvePaymentRequest: (requestId: string, paymentDetails?: string) => void;
  rejectPaymentRequest: (requestId: string) => void;
  submitPaymentProof: (requestId: string, screenshot: string) => void;
  getUserPaymentRequests: (userId: string) => PaymentRequest[];
  getAllPaymentRequests: () => PaymentRequest[];
  togglePinMessage: (conversationId: string, messageId: string) => void;
  canSendMessage: (senderId: string, receiverId: string) => boolean;
  updatePaymentDetails: (requestId: string, paymentDetails: string) => void;
};
