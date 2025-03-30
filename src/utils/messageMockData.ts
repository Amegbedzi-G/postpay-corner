
import { Conversation, Message, PaymentRequest } from '../types/messageTypes';

// Define some mock conversations and messages
export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: ["admin1", "user1"],
    unreadCount: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
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

export const mockPaymentRequests: PaymentRequest[] = [];
