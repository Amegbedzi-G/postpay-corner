
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { toast } from "sonner";

interface PaymentRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentRequestModal = ({
  open,
  onOpenChange,
}: PaymentRequestModalProps) => {
  const { user, addPaymentRequest, addNotification } = useAuth();
  const [amount, setAmount] = useState("10");
  const [method, setMethod] = useState<PaymentMethod>("PayPal");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!user) return;

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Create payment request
    addPaymentRequest({
      userId: user.id,
      username: user.username,
      amount: amountValue,
      method,
      note,
    });

    // Add notification for admin
    addNotification({
      userId: "admin1", // Admin's ID
      type: "payment_request",
      title: "New Payment Request",
      message: `${user.username} requested ${amountValue} via ${method}`,
      data: { userId: user.id, amount: amountValue }
    });

    toast.success("Payment request submitted successfully");
    
    // Reset form and close modal
    setAmount("10");
    setMethod("PayPal");
    setNote("");
    onOpenChange(false);
  };

  return (
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
  );
};
