
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription, SubscriptionPlan } from "@/context/SubscriptionContext";
import { useWallet } from "@/context/WalletContext";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const SubscriptionPage = () => {
  const { user, isAuthenticated, updateSubscription } = useAuth();
  const { plans } = useSubscription();
  const { balance, makePayment } = useWallet();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;

    if (balance < selectedPlan.price) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      return;
    }

    // Calculate end date based on subscription period
    const endDate = new Date();
    switch (selectedPlan.period) {
      case "weekly":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    const success = makePayment(
      selectedPlan.price,
      `${selectedPlan.period} subscription`,
      "subscription"
    );

    if (success) {
      updateSubscription(selectedPlan.period, endDate);
      toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
      setShowConfirmModal(false);
      navigate("/");
    } else {
      toast.error("Subscription payment failed. Please try again.");
    }
  };

  // If user is already subscribed, show subscription details
  if (user.isSubscribed) {
    const currentPlan = plans.find((p) => p.period === user.subscriptionType);
    const endDate = user.subscriptionEndDate 
      ? new Date(user.subscriptionEndDate) 
      : new Date();

    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>

        <Card className="bg-premium/5 border-premium/20">
          <CardHeader>
            <CardTitle className="text-premium">Active Subscription</CardTitle>
            <CardDescription>
              You have an active {user.subscriptionType} subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{currentPlan?.name || user.subscriptionType}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${currentPlan?.price.toFixed(2) || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="font-medium">
                  {endDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your subscription will automatically renew on the expiry date. You can cancel anytime from your settings.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/settings")}>
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Subscribe</h1>
      <p className="text-muted-foreground mb-6">
        Choose a subscription plan to get access to premium content
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.period} access</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price.toFixed(2)}</span>
                <span className="text-muted-foreground">
                  {plan.period === "weekly"
                    ? " / week"
                    : plan.period === "monthly"
                    ? " / month"
                    : " / year"}
                </span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan)}
                className="w-full"
                variant={plan.period === "monthly" ? "default" : "outline"}
              >
                Subscribe
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              You are about to subscribe to the {selectedPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-card rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  ${selectedPlan?.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Balance</span>
                <span className="font-medium">${balance.toFixed(2)}</span>
              </div>
            </div>
            {selectedPlan && balance < selectedPlan.price && (
              <p className="text-xs text-destructive mb-4">
                Insufficient balance. Please add funds to your wallet.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              By subscribing, you'll get access to all premium content and features
              for the duration of your subscription.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={selectedPlan ? balance < selectedPlan.price : true}
            >
              Confirm Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
