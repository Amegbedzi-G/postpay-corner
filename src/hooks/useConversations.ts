
import { useState } from 'react';
import { Conversation, Message } from '../types/messageTypes';

export const useConversations = (initialConversations: Conversation[], initialMessages: Record<string, Message[]>) => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);

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

  const getConversationMessages = (conversationId: string) => {
    return messages[conversationId] || [];
  };

  const getUserConversations = (userId: string) => {
    return conversations.filter((conv) =>
      conv.participants.includes(userId)
    );
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

  return {
    conversations,
    setConversations,
    messages,
    setMessages,
    getConversation,
    createConversation,
    markAsRead,
    getConversationMessages,
    getUserConversations,
    togglePinMessage
  };
};
