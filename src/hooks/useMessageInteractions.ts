
import { useState } from 'react';
import { Message, MessageMedia } from '../types/messageTypes';

export const useMessageInteractions = (
  initialMessages: Record<string, Message[]>,
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  setConversations: React.Dispatch<React.SetStateAction<any[]>>,
  addNotification?: (notification: any) => void
) => {
  const canSendMessage = (senderId: string, receiverId: string) => {
    if (senderId === "admin1") return true;
    
    if (receiverId === "admin1") {
      return true;
    }
    
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
      isUnlocked: !isPPV,
      isPinned: false,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...conversationMessages, newMessage],
      };
    });

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

    if (receiverId === "admin1" && addNotification) {
      addNotification({
        userId: "admin1",
        type: "message",
        title: "New Message",
        message: `You have a new message from ${senderId}`,
        data: { conversationId, messageId: newMessage.id }
      });
    }
    
    if (senderId === "admin1" && addNotification) {
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
