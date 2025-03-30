
import { useState } from 'react';
import { PaymentRequest } from '../types/messageTypes';

export const usePaymentRequests = (
  initialPaymentRequests: PaymentRequest[],
  addNotification?: (notification: any) => void
) => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(initialPaymentRequests);

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
    if (addNotification) {
      addNotification({
        userId: "admin1", // Admin's ID
        type: "payment_request",
        title: "New Payment Request",
        message: `User ${userId} requested a payment of $${amount.toFixed(2)} via ${method}`,
        data: { requestId: newRequest.id }
      });
    }
    
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
    
    if (request && addNotification) {
      // Notify the user that payment details have been added
      addNotification({
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
    
    if (request && addNotification) {
      addNotification({
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
        ? { ...request, paymentDetails, status: "completed" as const }
        : { ...request, status: "completed" as const };
        
      // Notify the user their payment request was approved
      if (addNotification) {
        addNotification({
          userId: request.userId,
          type: "payment_request",
          title: "Payment Request Approved",
          message: `Your payment request for $${request.amount.toFixed(2)} has been approved`,
          data: { requestId }
        });
      }
      
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
    
    if (request && addNotification) {
      // Notify the user their payment request was rejected
      addNotification({
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
          ? { ...req, status: "rejected" as const } 
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

  return {
    paymentRequests,
    setPaymentRequests,
    requestPayment,
    updatePaymentDetails,
    submitPaymentProof,
    approvePaymentRequest,
    rejectPaymentRequest,
    getUserPaymentRequests,
    getAllPaymentRequests
  };
};
