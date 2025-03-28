
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWallet, Transaction } from "@/context/WalletContext";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Clock, ArrowUp, ArrowDown } from "lucide-react";

const WalletPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { balance, transactions, addFunds } = useWallet();
  const navigate = useNavigate();

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("10");
  const [activeTab, setActiveTab] = useState<"balance" | "history">("balance");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const handleAddFunds = () => {
    // Validate amount
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Simulate payment processing
    addFunds(amount);
    toast.success(`Added $${amount.toFixed(2)} to your wallet`);
    setShowAddFundsModal(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.amount > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    }
    return <ArrowDown className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === "balance" ? "default" : "outline"}
          onClick={() => setActiveTab("balance")}
        >
          Balance
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
        >
          Transaction History
        </Button>
      </div>

      {activeTab === "balance" ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
            <CardDescription>
              Use your balance to unlock premium content and tip creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Available Funds
                </p>
                <h2 className="text-4xl font-bold">${balance.toFixed(2)}</h2>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => setShowAddFundsModal(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium">Transaction History</h2>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  No transactions to display
                </p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 flex items-center space-x-3"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    {getTransactionIcon(transaction)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {transaction.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(transaction.timestamp)}
                    </div>
                  </div>
                  <p
                    className={`font-medium ${
                      transaction.amount > 0
                        ? "text-green-500"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      <Dialog open={showAddFundsModal} onOpenChange={setShowAddFundsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to add to your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddFundsModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddFunds}>Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletPage;
