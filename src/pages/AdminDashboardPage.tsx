import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMessage, PaymentRequest } from "@/context/MessageContext";
import { usePost } from "@/context/PostContext";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { ImageUploadComponent } from "@/components/ImageUploadComponent";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  MessageSquare,
  Plus,
  Users,
  ArrowLeft,
  FileEdit,
  Trash2,
  DollarSign,
  Check,
  X,
  Mail,
  Banknote,
  BarChart,
  Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { VerificationBadge } from "@/components/VerificationBadge";

const AdminDashboardPage = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { createConversation, sendMessage, paymentRequests, approvePaymentRequest, rejectPaymentRequest } = useMessage();
  const { posts, addPost, updatePost, deletePost } = usePost();
  const { addFunds } = useWallet();
  const navigate = useNavigate();

  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showApprovePaymentModal, setShowApprovePaymentModal] = useState(false);
  
  const [receiverId, setReceiverId] = useState("user1");
  const [messageContent, setMessageContent] = useState("");
  const [isPPV, setIsPPV] = useState(false);
  const [price, setPrice] = useState("1.99");
  
  const [postContent, setPostContent] = useState("");
  const [postMedia, setPostMedia] = useState<{ type: "image" | "video", url: string } | null>(null);
  const [isPostPremium, setIsPostPremium] = useState(false);
  const [postPrice, setPostPrice] = useState("4.99");
  
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMedia, setEditMedia] = useState<{ type: "image" | "video", url: string } | null>(null);
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editPrice, setEditPrice] = useState("");
  
  const [name, setName] = useState(user?.name || "Admin");
  const [bio, setBio] = useState(user?.bio || "");
  
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<PaymentRequest | null>(null);

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

    const conversationId = createConversation([user.id, receiverId]);
    sendMessage(
      conversationId,
      user.id,
      receiverId,
      messageContent,
      isPPV ? undefined : media,
      isPPV,
      isPPV ? parseFloat(price) : 0
    );

    toast.success("Message sent successfully!");
    setShowNewMessageModal(false);
    
    setMessageContent("");
    setIsPPV(false);
    setPrice("1.99");
    
    navigate(`/messages/${conversationId}`);
  };

  const handleCreatePost = () => {
    if (!postContent) {
      toast.error("Please enter post content");
      return;
    }

    if (!postMedia) {
      toast.error("Please add media to your post");
      return;
    }

    if (isPostPremium && (!postPrice || parseFloat(postPrice) <= 0)) {
      toast.error("Please enter a valid price for premium content");
      return;
    }

    addPost({
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content: postContent,
      media: [postMedia],
      isPremium: isPostPremium,
      price: isPostPremium ? parseFloat(postPrice) : 0,
    });

    toast.success("Post created successfully!");
    setShowNewPostModal(false);
    setPostContent("");
    setPostMedia(null);
    setIsPostPremium(false);
    setPostPrice("4.99");
  };
  
  const handleEditPost = () => {
    if (!selectedPost) return;
    
    if (!editContent) {
      toast.error("Please enter post content");
      return;
    }

    if (!editMedia) {
      toast.error("Please add media to your post");
      return;
    }

    if (editIsPremium && (!editPrice || parseFloat(editPrice) <= 0)) {
      toast.error("Please enter a valid price for premium content");
      return;
    }

    updatePost(selectedPost, {
      content: editContent,
      media: [editMedia],
      isPremium: editIsPremium,
      price: editIsPremium ? parseFloat(editPrice) : 0,
    });

    toast.success("Post updated successfully!");
    setShowEditPostModal(false);
  };
  
  const handleDeletePost = () => {
    if (!selectedPost) return;
    
    deletePost(selectedPost);
    toast.success("Post deleted successfully!");
    setShowDeleteAlert(false);
  };
  
  const handleEditProfile = () => {
    updateProfile({
      name,
      bio,
    });
    
    toast.success("Profile updated successfully!");
    setShowProfileModal(false);
  };
  
  const handleApprovePayment = () => {
    if (!selectedPaymentRequest) return;
    
    addFunds(selectedPaymentRequest.amount);
    
    approvePaymentRequest(selectedPaymentRequest.id);
    
    toast.success(`Payment of $${selectedPaymentRequest.amount} approved and added to user's wallet!`);
    setShowApprovePaymentModal(false);
  };
  
  const handleRejectPayment = (requestId: string) => {
    rejectPaymentRequest(requestId);
    toast.success("Payment request rejected!");
  };

  const openEditModal = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    setSelectedPost(postId);
    setEditContent(post.content);
    setEditMedia(post.media[0] || null);
    setEditIsPremium(post.isPremium);
    setEditPrice(post.price.toString());
    setShowEditPostModal(true);
  };
  
  const openDeleteModal = (postId: string) => {
    setSelectedPost(postId);
    setShowDeleteAlert(true);
  };
  
  const openApprovePaymentModal = (request: PaymentRequest) => {
    setSelectedPaymentRequest(request);
    setShowApprovePaymentModal(true);
  };
  
  const pendingPaymentRequests = paymentRequests.filter(req => req.status === "pending");

  const handleMediaAdded = (url: string, type: "image" | "video") => {
    setPostMedia({ type, url });
  };

  const handleEditMediaAdded = (url: string, type: "image" | "video") => {
    setEditMedia({ type, url });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProfileModal(true)}>
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative group">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name?.[0] || user.username[0]}</AvatarFallback>
          </Avatar>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-0 right-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => navigate("/profile")}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            <VerificationBadge badgeType="admin" tooltipText="Creator Account" />
          </div>
          <p className="text-muted-foreground">{user.bio || "Platform administrator"}</p>
        </div>
      </div>
      
      {pendingPaymentRequests.length > 0 && (
        <Card className="mb-6 border-dashed border-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-amber-500" />
              <span>Pending Payment Requests ({pendingPaymentRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPaymentRequests.slice(0, 3).map(request => (
                <div key={request.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                  <div>
                    <p className="font-medium">User {request.userId}</p>
                    <p className="text-sm text-muted-foreground">
                      ${request.amount} via {request.method}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openApprovePaymentModal(request)}>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleRejectPayment(request.id)}>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              {pendingPaymentRequests.length > 3 && (
                <Button variant="link" className="w-full" onClick={() => navigate("/admin?tab=payments")}>
                  View all pending requests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Post Management</CardTitle>
              <CardDescription>
                Create, edit, and manage posts - set as free or premium
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
                              <span className={post.isPremium ? "text-amber-500 font-medium" : ""}>
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
                                  onClick={() => openEditModal(post.id)}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => openDeleteModal(post.id)}
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
                  As admin, you can send direct messages to users or create pay-per-view content
                  that users must pay to unlock.
                </p>
                
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Messaging Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Subscribed users can message you for free</li>
                    <li>Non-subscribed users must be subscribed to message you</li>
                    <li>You can send PPV messages that users pay to unlock</li>
                    <li>Users can tip you in chat conversations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/messages")}
              >
                <Mail className="h-4 w-4 mr-2" />
                View All Conversations
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Handle payment requests and wallet top-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-medium">Pending Payment Requests</h3>
                
                {pendingPaymentRequests.length === 0 ? (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No pending payment requests</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPaymentRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.userId}</TableCell>
                            <TableCell>${request.amount.toFixed(2)}</TableCell>
                            <TableCell>{request.method}</TableCell>
                            <TableCell>{request.timestamp.toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openApprovePaymentModal(request)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleRejectPayment(request.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <h3 className="font-medium mt-6">Completed Payments</h3>
                {paymentRequests.filter(req => req.status === "completed").length === 0 ? (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No completed payments</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentRequests
                          .filter(req => req.status === "completed")
                          .map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>{request.userId}</TableCell>
                              <TableCell>${request.amount.toFixed(2)}</TableCell>
                              <TableCell>{request.method}</TableCell>
                              <TableCell>{request.timestamp.toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Completed
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                <BarChart className="h-4 w-4 mr-2" />
                View Payment Analytics
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
        <DialogContent className="max-w-lg">
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
              <Label>Media</Label>
              <ImageUploadComponent onMediaAdded={handleMediaAdded} />
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
      
      {/* Edit Post Modal */}
      <Dialog open={showEditPostModal} onOpenChange={setShowEditPostModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your post content or premium settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Post Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your post content..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <ImageUploadComponent 
                onMediaAdded={handleEditMediaAdded} 
                acceptedTypes="both"
              />
              {editMedia && (
                <p className="text-xs text-muted-foreground">
                  Upload a new file to replace the current {editMedia.type}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-premium">Premium Content</Label>
                <Switch
                  id="edit-premium"
                  checked={editIsPremium}
                  onCheckedChange={setEditIsPremium}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Require payment to view this post
              </p>
            </div>

            {editIsPremium && (
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (USD)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0.99"
                  step="0.01"
                  placeholder="Enter price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditPostModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPost}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Profile Edit Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditProfile}>
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post and all associated comments and likes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Approve Payment Modal */}
      <Dialog open={showApprovePaymentModal} onOpenChange={setShowApprovePaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Confirm payment receipt and add funds to user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPaymentRequest && (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User:</span>
                    <span className="font-medium">{selectedPaymentRequest.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${selectedPaymentRequest.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{selectedPaymentRequest.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested On:</span>
                    <span className="font-medium">{selectedPaymentRequest.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-sm">
                  By approving this payment, you confirm that you've received the payment
                  via {selectedPaymentRequest.method} and are now adding ${selectedPaymentRequest.amount.toFixed(2)} to the user's wallet.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovePaymentModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApprovePayment}>
              <Check className="h-4 w-4 mr-1" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
