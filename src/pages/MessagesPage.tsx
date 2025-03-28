
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const MessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserConversations, messages } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const userConversations = getUserConversations(user.id);

  // Get other participant's ID (assuming 2-person conversations)
  const getOtherParticipant = (participants: string[]) => {
    return participants.find((id) => id !== user.id) || "";
  };

  // Format timestamp to relative time (e.g., "2h ago")
  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  // Get last message preview (truncated)
  const getMessagePreview = (conversationId: string) => {
    const conversationMessages = messages[conversationId] || [];
    if (conversationMessages.length === 0) return "No messages yet";
    
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    // If PPV and not unlocked, show special message
    if (lastMessage.isPPV && !lastMessage.isUnlocked) {
      return "📸 Pay-Per-View Content";
    }
    
    // Truncate message if too long
    const preview = lastMessage.content;
    return preview.length > 30 ? `${preview.substring(0, 30)}...` : preview;
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {userConversations.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-xl shadow-md">
          <p className="text-muted-foreground mb-3">No conversations yet</p>
          {user.isAdmin && (
            <Button size="sm" onClick={() => navigate("/admin")}>
              Message Users
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {userConversations.map((conversation) => {
            const otherParticipantId = getOtherParticipant(
              conversation.participants
            );
            // In a real app, you'd get user details from a users context/API
            const otherParticipantName =
              otherParticipantId === "admin" ? "Admin" : otherParticipantId;
              
            const conversationMessages = messages[conversation.id] || [];
            const lastMessage = conversationMessages.length > 0 
              ? conversationMessages[conversationMessages.length - 1] 
              : null;

            return (
              <div
                key={conversation.id}
                className="flex items-center bg-card p-4 rounded-xl shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/messages/${conversation.id}`)}
              >
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${otherParticipantName}`} />
                  <AvatarFallback>{otherParticipantName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium truncate">{otherParticipantName}</h3>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatRelativeTime(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {getMessagePreview(conversation.id)}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
