
import { useState, useEffect } from 'react';
import { Conversation, Message, PaymentRequest } from '../types/messageTypes';

export const useMessageStorage = (
  initialConversations: Conversation[],
  initialMessages: Record<string, Message[]>,
  initialPaymentRequests: PaymentRequest[]
) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage or use initial data
  useEffect(() => {
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
        setConversations(initialConversations);
        setMessages(initialMessages);
        setPaymentRequests(initialPaymentRequests);
      }
    } else {
      setConversations(initialConversations);
      setMessages(initialMessages);
      setPaymentRequests(initialPaymentRequests);
      localStorage.setItem("conversations", JSON.stringify(initialConversations));
      localStorage.setItem("messages", JSON.stringify(initialMessages));
      localStorage.setItem("paymentRequests", JSON.stringify(initialPaymentRequests));
    }
    setLoading(false);
  }, [initialConversations, initialMessages, initialPaymentRequests]);

  // Update localStorage whenever messages, conversations, or payment requests change
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

  return {
    conversations,
    setConversations,
    messages,
    setMessages,
    paymentRequests,
    setPaymentRequests,
    loading,
  };
};
