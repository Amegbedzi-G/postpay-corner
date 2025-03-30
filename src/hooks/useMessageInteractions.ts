import { useState } from 'react';
import { Message, MessageMedia } from '../types/messageTypes';

export const useMessageInteractions = (
  initialMessages: Record<string, Message[]>,
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  setConversations: React.Dispatch<React.SetStateAction<any[]>>,
  addNotification?: (notification: any) => void
) => {
  const canSendMessage = (senderId: string, receiverId: string, user: any) => {
    // Admin can always send messages
    if (senderId === "admin1") return true;
    
    // User can send message to admin if they're subscribed
    if (receiverId === "admin1") {
      if (!user) return false;
      
      // Check if user has a conversation with admin
      const existingConv = user.isAdmin ? true : user.isSubscribed;
      
      return existingConv;
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
    // Using any here because we can't pass the entire Auth context
    const user = { id: senderId, isSubscribed: true };
    
    // Check if sender can send a message to receiver
    if (!canSendMessage(senderId, receiverId, user)) {
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
    if (receiverId === "admin1" && addNotification) {
      addNotification({
        userId: "admin1",
        type: "message",
        title: "New Message",
        message: `You have a new message from ${senderId}`,
        data: { conversationId, messageId: newMessage.id }
      });
    }
    
    // Also notify subscriber if they received a message from admin
    if (senderId === "admin1" && user.isSubscribed && addNotification) {
      addNotification({
        userId: receiverId,
        type: "message",
        title: "New Creator Message",
        message: "The creator sent you a new message",
        data: { conversationId, messageId: newMessage.id }
      });
    }
    
    return true;
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

  return {
    canSendMessage,
    sendMessage,
    unlockPPVMessage,
    sendTip
  };
};
