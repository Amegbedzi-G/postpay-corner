
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/context/PostContext";
import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ArrowLeft, Send, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getPost, toggleLike, addComment, hasPurchased, purchasePost } = usePost();
  const { makePayment } = useWallet();
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(5);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!id || !user) {
    return <div>Post not found</div>;
  }

  const post = getPost(id);

  if (!post) {
    return <div>Post not found</div>;
  }

  const isLiked = post.likes.includes(user.id);
  const isPremium = post.isPremium;
  const hasUnlocked = hasPurchased(post.id, user.id);
  const isBlurred = isPremium && !hasUnlocked;

  const handleLike = () => {
    toggleLike(post.id, user.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(post.id, user.id, user.username, comment);
      setComment("");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleTip = () => {
    if (user.balance < tipAmount) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      return;
    }

    const success = makePayment(
      tipAmount,
      `Tip to ${post.username} for post`,
      "tip"
    );

    if (success) {
      toast.success(`You sent a $${tipAmount} tip!`);
      setShowTipModal(false);
    } else {
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleUnlock = () => {
    if (user.balance < post.price) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      return;
    }

    const success = makePayment(
      post.price,
      `Unlocked premium post from ${post.username}`,
      "payment"
    );

    if (success) {
      purchasePost(post.id, user.id);
      toast.success("Post unlocked successfully!");
      setShowPaymentModal(false);
    } else {
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        {/* Post Header */}
        <div className="flex items-center p-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback>{post.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{post.username}</h3>
            <p className="text-xs text-muted-foreground">
              {formatDate(post.timestamp)}
            </p>
          </div>
        </div>

        {/* Post Media */}
        <div className={cn("relative", isBlurred && "premium-blur")}>
          {post.media.map((media, index) => (
            <div key={index}>
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`Post by ${post.username}`}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  className="w-full aspect-square object-cover"
                  controls={!isBlurred}
                />
              )}
            </div>
          ))}

          {/* Unlock Button for Premium Content */}
          {isBlurred && (
            <Button
              className="absolute z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              onClick={() => setShowPaymentModal(true)}
            >
              Unlock for ${post.price}
            </Button>
          )}
        </div>

        {/* Post Actions */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(isLiked && "text-red-500")}
              onClick={handleLike}
            >
              <Heart
                className="h-5 w-5 mr-1"
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{post.likes.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTipModal(true)}
            >
              <DollarSign className="h-5 w-5 mr-1" />
              <span>Tip</span>
            </Button>
          </div>
          <p className={cn("mt-3", isBlurred && "blur-md select-none")}>
            {post.content}
          </p>
        </div>

        {/* Comments Section */}
        {!isBlurred && (
          <div className="p-4">
            <h3 className="font-medium mb-4">Comments</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
              {post.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium">
                          {comment.username}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleComment} className="flex space-x-2">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Tip Modal */}
      <Dialog open={showTipModal} onOpenChange={setShowTipModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a Tip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <Label>Amount: ${tipAmount}</Label>
              <span className="text-sm text-muted-foreground">
                Balance: ${user.balance.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[tipAmount]}
              min={1}
              max={50}
              step={1}
              onValueChange={(value) => setTipAmount(value[0])}
            />
            <div className="flex justify-between text-sm">
              <span>$1</span>
              <span>$25</span>
              <span>$50</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTipModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTip} 
              disabled={tipAmount > user.balance}
            >
              Send ${tipAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Premium Content</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-4">
              This content requires a one-time payment of ${post.price} to unlock.
            </p>
            <p className="text-sm text-muted-foreground">
              Your balance: ${user.balance.toFixed(2)}
            </p>
            {user.balance < post.price && (
              <p className="text-xs text-destructive mt-2">
                Insufficient balance. Please add funds to your wallet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUnlock} 
              disabled={post.price > user.balance}
            >
              Pay ${post.price}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostDetailPage;
