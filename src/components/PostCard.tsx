
import { useAuth } from "@/context/AuthContext";
import { Post, usePost } from "@/context/PostContext";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, DollarSign } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike, hasPurchased, purchasePost } = usePost();
  const { makePayment } = useWallet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!user) return null;

  const isLiked = post.likes.includes(user.id);
  const isPremium = post.isPremium;
  const hasUnlocked = hasPurchased(post.id, user.id);
  const isBlurred = isPremium && !hasUnlocked;

  const handleLike = () => {
    toggleLike(post.id, user.id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
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
    <div className="bg-card rounded-xl shadow-md overflow-hidden mb-6">
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
      <div className={cn("relative aspect-square", isBlurred && "premium-blur")}>
        {post.media.map((media, index) => (
          <div key={index} className="h-full">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={`Post by ${post.username}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={media.url}
                className="w-full h-full object-cover"
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

      {/* Post Content */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn(isLiked && "text-red-500")}
            onClick={handleLike}
          >
            <Heart className="h-5 w-5 mr-1" fill={isLiked ? "currentColor" : "none"} />
            <span>{post.likes.length}</span>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/post/${post.id}`}>
              <MessageCircle className="h-5 w-5 mr-1" />
              <span>{post.comments.length}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/post/${post.id}?tip=true`}>
              <DollarSign className="h-5 w-5 mr-1" />
              <span>Tip</span>
            </Link>
          </Button>
        </div>

        <p className={cn("text-sm", isBlurred && "blur-md select-none")}>
          {post.content}
        </p>

        {post.comments.length > 0 && !isBlurred && (
          <Link
            to={`/post/${post.id}`}
            className="text-xs text-muted-foreground mt-2 block"
          >
            View all {post.comments.length} comments
          </Link>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Premium Content</DialogTitle>
            <DialogDescription>
              This content requires a one-time payment of ${post.price} to unlock.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Your balance: ${user.balance.toFixed(2)}
            </p>
            {user.balance < post.price && (
              <p className="text-xs text-destructive">
                Insufficient balance. Please add funds to your wallet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button 
              disabled={user.balance < post.price} 
              onClick={handleUnlock}
            >
              Pay ${post.price}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
