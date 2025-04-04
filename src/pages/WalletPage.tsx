
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, PaymentRequest } from "@/context/AuthContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Clock, ArrowUp, ArrowDown, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { PaymentRequestModal } from "@/components/PaymentRequestModal";

const WalletPage = () => {
  const { user, isAuthenticated, getPaymentRequests, updatePaymentRequest } = useAuth();
  const { balance, transactions, addFunds } = useWallet();
  const navigate = useNavigate();

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("10");
  const [activeTab, setActiveTab] = useState<"balance" | "history" | "requests">("balance");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [approvalAmount, setApprovalAmount] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const paymentRequests = getPaymentRequests();

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

  const getStatusBadge = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-500">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-500">Pending</span>;
    }
  };

  const handleRequestAction = (request: PaymentRequest, action: "approve" | "reject") => {
    if (action === "approve") {
      setSelectedRequest(request);
      setApprovalAmount(request.amount.toString());
    } else {
      updatePaymentRequest(request.id, { status: "rejected" });
      toast.success("Request rejected");
    }
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;
    
    const amount = parseFloat(approvalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Update the request status
    updatePaymentRequest(selectedRequest.id, { 
      status: "approved", 
      amount // Update with potentially modified amount
    });
    
    // Add funds to user's wallet (this would normally be handled by a webhook in production)
    if (user && !user.isAdmin) {
      addFunds(amount);
    }
    
    toast.success("Payment request approved and funds added");
    setSelectedRequest(null);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <Tabs defaultValue="balance" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
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
            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setShowAddFundsModal(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
              {!user.isAdmin && (
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setShowRequestModal(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Request Funds
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history">
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
        </TabsContent>

        <TabsContent value="requests">
          <div className="bg-card rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-medium">Payment Requests</h2>
              {!user.isAdmin && (
                <Button size="sm" onClick={() => setShowRequestModal(true)}>
                  New Request
                </Button>
              )}
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {paymentRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No payment requests to display
                  </p>
                </div>
              ) : (
                paymentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {user.isAdmin ? request.username : 'You'} requested {' '}
                          <span className="font-bold">${request.amount.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          via {request.method || 'Any method'} • {formatDate(request.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    {request.note && (
                      <p className="text-sm text-muted-foreground mt-2 mb-3 bg-muted p-2 rounded">
                        {request.note}
                      </p>
                    )}
                    
                    {user.isAdmin && request.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleRequestAction(request, "approve")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleRequestAction(request, "reject")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

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

      {/* Approval Confirmation Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment Request</DialogTitle>
            <DialogDescription>
              Confirm the amount to add to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="approvalAmount">Amount (USD)</Label>
              <Input
                id="approvalAmount"
                type="number"
                min="1"
                step="0.01"
                value={approvalAmount}
                onChange={(e) => setApprovalAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedRequest(null)}
            >
              Cancel
            </Button>
            <Button onClick={confirmApproval}>Approve & Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Request Modal */}
      <PaymentRequestModal 
        open={showRequestModal} 
        onOpenChange={setShowRequestModal} 
      />
    </div>
  );
};

export default WalletPage;
