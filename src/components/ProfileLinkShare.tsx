
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ProfileLinkShare = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const username = user.username.toLowerCase();
  const profileUrl = `${window.location.origin}/profile/${username}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };
  
  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name || user.username}'s Profile`,
          text: `Check out my profile!`,
          url: profileUrl,
        });
        toast.success("Profile shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const viewProfile = () => {
    navigate(`/profile/${username}`);
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="relative">
        <Input 
          value={profileUrl} 
          readOnly 
          className="pr-24"
        />
        <Button
          variant="outline"
          size="sm"
          className="absolute right-1 top-1 h-7"
          onClick={copyToClipboard}
        >
          <Copy className="h-3.5 w-3.5 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          onClick={shareProfile}
          className="flex items-center flex-1"
        >
          <Share className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
        <Button 
          variant="outline" 
          onClick={viewProfile}
          className="flex items-center"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
};
