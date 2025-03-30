
import { useState } from "react";
import { useMessage } from "@/context/MessageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PaymentDetailsFormProps {
  requestId: string;
  method: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentDetailsForm = ({
  requestId,
  method,
  open,
  onOpenChange,
}: PaymentDetailsFormProps) => {
  const { updatePaymentDetails } = useMessage();
  const [paymentDetails, setPaymentDetails] = useState("");

  const handleSubmit = () => {
    if (!paymentDetails.trim()) {
      toast.error("Please enter payment details");
      return;
    }

    updatePaymentDetails(requestId, paymentDetails);
    toast.success("Payment details sent to user");
    onOpenChange(false);
  };

  // Helper function to get prompt text based on payment method
  const getPromptText = (method: string) => {
    switch (method) {
      case "PayPal":
        return "Enter your PayPal email or link";
      case "CashApp":
        return "Enter your $Cashtag";
      case "Apple Pay":
        return "Enter your Apple Pay information";
      case "Bank Transfer":
        return "Enter your bank account details (account number, routing number, etc.)";
      case "Crypto":
        return "Enter your wallet address and cryptocurrency type";
      default:
        return "Enter your payment details";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Details</DialogTitle>
          <DialogDescription>
            Provide payment details for the user to complete their payment via {method}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder={getPromptText(method)}
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              These details will be sent to the user for one-time use.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Send Payment Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
