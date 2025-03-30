
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";
import { PaymentMethod } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PaymentRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentRequestModal = ({
  open,
  onOpenChange,
}: PaymentRequestModalProps) => {
  const { user, addNotification } = useAuth();
  const { requestPayment } = useMessage();
  const [amount, setAmount] = useState("10");
  const [method, setMethod] = useState<PaymentMethod>("PayPal");
  const [note, setNote] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!user) return;

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Create payment request
    const newRequestId = requestPayment(user.id, amountValue, method);

    // Add notification for admin
    if (addNotification) {
      addNotification({
        userId: "admin1", // Admin's ID
        type: "payment_request",
        title: "New Payment Request",
        message: `${user.username} requested ${amountValue} via ${method}`,
        data: { userId: user.id, amount: amountValue }
      });
    }

    // Save request ID and show success alert
    setRequestId(newRequestId);
    setShowSuccessAlert(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessAlert(false);
    
    // Reset form and close modal
    setAmount("10");
    setMethod("PayPal");
    setNote("");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Funds</DialogTitle>
            <DialogDescription>
              Request to add funds to your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="CashApp">CashApp</SelectItem>
                  <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Any additional information for your request..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Request Submitted</AlertDialogTitle>
            <AlertDialogDescription>
              Your payment request has been submitted successfully. The admin will review your request and provide payment details shortly. Please check your notifications for updates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseSuccess}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
