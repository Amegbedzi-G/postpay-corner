
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";
import { useWallet } from "@/context/WalletContext";
import { MessageMedia } from "@/types/messageTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, Send, DollarSign, Image } from "lucide-react";
import { ImageUploadComponent } from "@/components/ImageUploadComponent";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getConversationMessages, sendMessage, markAsRead, unlockPPVMessage, sendTip } = useMessage();
  const { makePayment } = useWallet();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState(5);
  const [media, setMedia] = useState<MessageMedia[]>([]);
  const [showMediaPopover, setShowMediaPopover] = useState(false);
  const [isPPV, setIsPPV] = useState(false);
  const [ppvPrice, setPpvPrice] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      markAsRead(id, user.id);
    }
  }, [id, user, markAsRead]);

  if (!id || !user) {
    return <div>Conversation not found</div>;
  }

  const messages = getConversationMessages(id);

  // Find other participant (assuming 2-person conversations)
  const otherParticipant = messages.length > 0
    ? (messages[0].senderId === user.id ? messages[0].receiverId : messages[0].senderId)
    : "Unknown";

  // In a real app, you'd get user details from a users context/API
  const otherParticipantName = otherParticipant === "admin" ? "Admin" : otherParticipant;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || media.length > 0) {
      // Get receiver ID from the first message in the conversation
      const receiverId = messages.length > 0
        ? (messages[0].senderId === user.id ? messages[0].receiverId : messages[0].senderId)
        : "";

      if (receiverId) {
        sendMessage(id, user.id, receiverId, newMessage, media.length > 0 ? media : undefined, isPPV, ppvPrice);
        setNewMessage("");
        setMedia([]);
        setIsPPV(false);
        setPpvPrice(5);
        
        // Scroll to bottom after sending
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  };

  const handleMediaAdded = (url: string, type: "image" | "video" | "file" = "image") => {
    const newMedia: MessageMedia = {
      type,
      url,
    };
    setMedia((prev) => [...prev, newMedia]);
    setShowMediaPopover(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUnlockPPVMessage = (messageId: string, price: number) => {
    if (user.balance < price) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      return;
    }

    const success = makePayment(
      price,
      "Unlocked pay-per-view message",
      "payment"
    );

    if (success) {
      unlockPPVMessage(id, messageId);
      toast.success("Message unlocked successfully!");
      setShowPaymentModal(false);
    } else {
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleShowPaymentModal = (messageId: string) => {
    setSelectedMessage(messageId);
    setShowPaymentModal(true);
  };

  const handleShowTipModal = (messageId: string) => {
    setSelectedMessage(messageId);
    setShowTipModal(true);
  };

  const handleSendTip = () => {
    if (!selectedMessage) return;
    
    if (user.balance < tipAmount) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      return;
    }

    const success = makePayment(
      tipAmount,
      `Tip to ${otherParticipantName}`,
      "tip"
    );

    if (success) {
      sendTip(id, selectedMessage, tipAmount);
      toast.success(`You sent a $${tipAmount} tip!`);
      setShowTipModal(false);
    } else {
      toast.error("Payment failed. Please try again.");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="max-w-lg mx-auto h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigate("/messages")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${otherParticipantName}`} />
          <AvatarFallback>{otherParticipantName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{otherParticipantName}</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user.id;
            const isPPV = message.isPPV;
            const isUnlocked = message.isUnlocked;
            const isBlurred = isPPV && !isUnlocked;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl"
                      : "bg-card rounded-r-xl rounded-tl-xl"
                  } p-3 shadow-sm`}
                >
                  {isBlurred ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">Pay-Per-View Content</span>
                      </div>
                      <p className="text-xs blur-md select-none">
                        This content is locked. Pay to view.
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleShowPaymentModal(message.id)}
                      >
                        Unlock for ${message.price}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {message.content && <p className="text-sm">{message.content}</p>}
                      
                      {/* Display media */}
                      {message.media && message.media.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.media.map((item, index) => (
                            <div key={index}>
                              {item.type === "image" && (
                                <img 
                                  src={item.url} 
                                  alt="Message attachment" 
                                  className="rounded max-h-60 max-w-full" 
                                />
                              )}
                              {item.type === "video" && (
                                <video 
                                  src={item.url} 
                                  controls 
                                  className="rounded max-h-60 max-w-full"
                                />
                              )}
                              {item.type === "file" && (
                                <div className="flex items-center space-x-2 p-2 border rounded">
                                  <span className="text-xs truncate">
                                    {item.fileName || "Attachment"}
                                  </span>
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500"
                                  >
                                    Download
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs opacity-70">
                        <span>{formatDate(message.timestamp)}</span>
                        {message.tipAmount && (
                          <span className="text-premium">
                            Tipped: ${message.tipAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tip button for received messages that are not PPV or are unlocked */}
                {!isOwnMessage && !isBlurred && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    onClick={() => handleShowTipModal(message.id)}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media preview */}
      {media.length > 0 && (
        <div className="p-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <div key={index} className="relative">
                {item.type === "image" && (
                  <img 
                    src={item.url} 
                    alt="Attached media" 
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                {item.type === "video" && (
                  <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                    <span className="text-xs">Video</span>
                  </div>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={() => handleRemoveMedia(index)}
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-border space-y-2"
      >
        {/* PPV options */}
        {user.id === "admin1" && (
          <div className="flex items-center space-x-2 text-sm mb-2">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={isPPV}
                onChange={(e) => setIsPPV(e.target.checked)}
                className="rounded"
              />
              <span>Pay-per-view</span>
            </label>
            
            {isPPV && (
              <div className="flex items-center space-x-2">
                <span>Price: $</span>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={ppvPrice}
                  onChange={(e) => setPpvPrice(Number(e.target.value))}
                  className="w-16 h-6 text-xs"
                />
              </div>
            )}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Popover open={showMediaPopover} onOpenChange={setShowMediaPopover}>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
              >
                <Image className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2">
              <ImageUploadComponent 
                onMediaAdded={handleMediaAdded}
                acceptedTypes="both"
              />
            </PopoverContent>
          </Popover>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim() && media.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Pay-Per-View Message</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedMessage && (
              <>
                <p className="text-sm mb-4">
                  This content requires a payment to unlock.
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Your balance: ${user.balance.toFixed(2)}
                </p>
                {user.balance < (messages.find(m => m.id === selectedMessage)?.price || 0) && (
                  <p className="text-xs text-destructive">
                    Insufficient balance. Please add funds to your wallet.
                  </p>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            {selectedMessage && (
              <Button
                onClick={() => {
                  const message = messages.find(m => m.id === selectedMessage);
                  if (message) {
                    handleUnlockPPVMessage(message.id, message.price);
                  }
                }}
                disabled={user.balance < (messages.find(m => m.id === selectedMessage)?.price || 0)}
              >
                Pay ${messages.find(m => m.id === selectedMessage)?.price}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={handleSendTip} 
              disabled={tipAmount > user.balance}
            >
              Send ${tipAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationPage;
