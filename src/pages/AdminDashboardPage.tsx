
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, Plus, Users, ArrowLeft } from "lucide-react";

const AdminDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { createConversation, sendMessage } = useMessage();
  const navigate = useNavigate();

  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [receiverId, setReceiverId] = useState("user1"); // In a real app, this would be dynamic
  const [messageContent, setMessageContent] = useState("");
  const [isPPV, setIsPPV] = useState(false);
  const [price, setPrice] = useState("1.99");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!user?.isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || !user.isAdmin) {
    return null;
  }

  const handleSendMessage = () => {
    if (!receiverId) {
      toast.error("Please enter a receiver ID");
      return;
    }

    if (!messageContent) {
      toast.error("Please enter a message");
      return;
    }

    if (isPPV && (!price || parseFloat(price) <= 0)) {
      toast.error("Please enter a valid price for PPV content");
      return;
    }

    // Create/get conversation and send message
    const conversationId = createConversation([user.id, receiverId]);
    sendMessage(
      conversationId,
      user.id,
      receiverId,
      messageContent,
      isPPV,
      isPPV ? parseFloat(price) : 0
    );

    toast.success("Message sent successfully!");
    setShowNewMessageModal(false);
    
    // Navigate to conversation
    navigate(`/messages/${conversationId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/profile")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Profile
      </Button>

      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="messages">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Manage conversations and send pay-per-view content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Send new message</h3>
                  <Button onClick={() => setShowNewMessageModal(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Message
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  Send direct messages to users or create pay-per-view content
                  that users must unlock to view.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/messages")}
              >
                View All Conversations
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                View and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6 text-muted-foreground">
                Users management functionality will be added in future updates.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Message Modal */}
      <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Message</DialogTitle>
            <DialogDescription>
              Send a direct message or pay-per-view content to a user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receiver">Recipient</Label>
              <Input
                id="receiver"
                placeholder="Enter user ID"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For demo purposes, use "user1" as the recipient
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ppv">Pay-Per-View Content</Label>
                <Switch id="ppv" checked={isPPV} onCheckedChange={setIsPPV} />
              </div>
              <p className="text-xs text-muted-foreground">
                Require payment to view this message
              </p>
            </div>

            {isPPV && (
              <div className="space-y-2">
                <Label htmlFor="ppv-price">Price (USD)</Label>
                <Input
                  id="ppv-price"
                  type="number"
                  min="0.99"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewMessageModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Plus className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
