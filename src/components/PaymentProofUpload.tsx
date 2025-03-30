
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
import { ImageUploadComponent } from "@/components/ImageUploadComponent";
import { toast } from "sonner";

interface PaymentProofUploadProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentProofUpload = ({
  requestId,
  open,
  onOpenChange,
}: PaymentProofUploadProps) => {
  const { submitPaymentProof } = useMessage();
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleMediaAdded = (url: string) => {
    setScreenshot(url);
  };

  const handleSubmit = () => {
    if (!screenshot) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    submitPaymentProof(requestId, screenshot);
    toast.success("Payment proof submitted successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload a screenshot of your payment confirmation to verify your payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <ImageUploadComponent 
              onMediaAdded={handleMediaAdded} 
              acceptedTypes="image" 
            />
            {screenshot && (
              <div className="mt-2 border rounded-md p-2">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <img src={screenshot} alt="Payment proof" className="w-full max-h-40 object-contain rounded" />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!screenshot}>
            Submit Proof
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
