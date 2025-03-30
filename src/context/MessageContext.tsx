
import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { MessageContextType } from "../types/messageTypes";
import { mockConversations, mockMessages, mockPaymentRequests } from "../utils/messageMockData";
import { useMessageStorage } from "../hooks/useMessageStorage";
import { useConversations } from "../hooks/useConversations";
import { useMessageInteractions } from "../hooks/useMessageInteractions";
import { usePaymentRequests } from "../hooks/usePaymentRequests";

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, addNotification } = useAuth();

  // Initialize storage with mock data
  const { 
    conversations, 
    setConversations,
    messages, 
    setMessages,
    paymentRequests, 
    setPaymentRequests,
    loading 
  } = useMessageStorage(mockConversations, mockMessages, mockPaymentRequests);

  // Initialize conversation management
  const conversationUtils = useConversations(conversations, messages);

  // Initialize message interactions
  const messageInteractions = useMessageInteractions(
    messages, 
    setMessages, 
    setConversations, 
    addNotification
  );

  // Initialize payment requests
  const paymentRequestUtils = usePaymentRequests(paymentRequests, addNotification);

  // Create a merged object with all the functions and state
  const contextValue: MessageContextType = {
    conversations,
    messages,
    paymentRequests,
    loading,
    ...conversationUtils,
    ...messageInteractions,
    ...paymentRequestUtils,
  };

  return (
    <MessageContext.Provider value={contextValue}>
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

// Re-export types for convenience
export * from '../types/messageTypes';
