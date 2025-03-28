
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";
import { usePost } from "@/context/PostContext";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { MessageSquare, Plus, Users, ArrowLeft, FileEdit, Trash2 } from "lucide-react";

const AdminDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { createConversation, sendMessage } = useMessage();
  const { posts, addPost } = usePost();
  const navigate = useNavigate();

  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [receiverId, setReceiverId] = useState("user1"); // In a real app, this would be dynamic
  const [messageContent, setMessageContent] = useState("");
  const [isPPV, setIsPPV] = useState(false);
  const [price, setPrice] = useState("1.99");
  
  // New post state
  const [postContent, setPostContent] = useState("");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [isPostPremium, setIsPostPremium] = useState(false);
  const [postPrice, setPostPrice] = useState("4.99");

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

  const handleCreatePost = () => {
    if (!postContent) {
      toast.error("Please enter post content");
      return;
    }

    if (!postMediaUrl) {
      toast.error("Please enter a media URL");
      return;
    }

    if (isPostPremium && (!postPrice || parseFloat(postPrice) <= 0)) {
      toast.error("Please enter a valid price for premium content");
      return;
    }

    // Create new post
    addPost({
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content: postContent,
      media: [
        {
          type: "image",
          url: postMediaUrl,
        },
      ],
      isPremium: isPostPremium,
      price: isPostPremium ? parseFloat(postPrice) : 0,
    });

    toast.success("Post created successfully!");
    setShowNewPostModal(false);
    setPostContent("");
    setPostMediaUrl("");
    setIsPostPremium(false);
    setPostPrice("4.99");
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

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Post Management</CardTitle>
              <CardDescription>
                Create, edit, and manage posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Create new post</h3>
                  <Button onClick={() => setShowNewPostModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </div>
                
                <div className="border rounded-md mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No posts yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="max-w-[200px] truncate">
                              {post.content}
                            </TableCell>
                            <TableCell>
                              <span className={post.isPremium ? "text-premium" : ""}>
                                {post.isPremium ? "Premium" : "Free"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {post.isPremium ? `$${post.price.toFixed(2)}` : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/post/${post.id}`)}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/add-post")}
              >
                Go to Add Post Page
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

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

      {/* New Post Modal */}
      <Dialog open={showNewPostModal} onOpenChange={setShowNewPostModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Create a new post for your feed. You can set it as premium content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="post-content">Post Content</Label>
              <Textarea
                id="post-content"
                placeholder="Write your post content..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-url">Media URL</Label>
              <Input
                id="media-url"
                placeholder="Enter image or video URL"
                value={postMediaUrl}
                onChange={(e) => setPostMediaUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use a valid image URL (e.g., from Unsplash)
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="premium">Premium Content</Label>
                <Switch
                  id="premium"
                  checked={isPostPremium}
                  onCheckedChange={setIsPostPremium}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Require payment to view this post
              </p>
            </div>

            {isPostPremium && (
              <div className="space-y-2">
                <Label htmlFor="post-price">Price (USD)</Label>
                <Input
                  id="post-price"
                  type="number"
                  min="0.99"
                  step="0.01"
                  placeholder="Enter price"
                  value={postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPostModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePost}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
