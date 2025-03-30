
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/context/PostContext";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationBadge } from "@/components/VerificationBadge";
import { ProfileLinkShare } from "@/components/ProfileLinkShare";
import { ImageUploadComponent } from "@/components/ImageUploadComponent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated, updateAvatar } = useAuth();
  const { posts } = usePost();
  const navigate = useNavigate();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = !username || (user && username === user.username.toLowerCase());
  
  useEffect(() => {
    if (!isAuthenticated && !username) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, username]);

  if (!user && !username) {
    return null;
  }

  // Profile data - either our own or whoever we're viewing
  const profileUser = isOwnProfile ? user : { 
    // If viewing someone else's profile, show limited data
    // This is a placeholder - in a real app, you'd fetch this user's data
    username: username || "",
    isAdmin: false,
    isVerified: false,
    avatar: `https://ui-avatars.com/api/?name=${username}`,
    bio: "Creator bio would appear here"
  };

  if (!profileUser) return null;

  // Get user's posts (for admin) or filter by isPremium for regular users
  const userPosts = user?.isAdmin
    ? posts
    : posts.filter((post) => !post.isPremium || (user && post.purchasedBy.includes(user.id)));

  const handleMediaAdded = (url: string, type: "image" | "video") => {
    if (type === "video") {
      toast.error("Please select an image for your profile picture");
      return;
    }
    
    setAvatarPreview(url);
  };

  const saveAvatar = () => {
    if (avatarPreview) {
      updateAvatar(avatarPreview);
      setShowAvatarModal(false);
      toast.success("Profile picture updated successfully");
    }
  };

  const handleSubscribe = () => {
    if (!user) {
      // If not logged in, redirect to login
      navigate("/login?redirect=/subscribe");
    } else {
      // If logged in, go to subscription page
      navigate("/subscribe");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl shadow-md overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={profileUser.avatar} />
                <AvatarFallback>{profileUser.username[0]}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mt-4 md:mt-0 md:ml-4 md:mb-2">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{profileUser.username}</h1>
                {profileUser.isVerified && (
                  <VerificationBadge 
                    size="md" 
                    badgeType={profileUser.isAdmin ? "admin" : "verified"}
                    tooltipText={profileUser.isAdmin ? "Verified Creator" : "Verified Account"}
                  />
                )}
              </div>
              <p className="text-muted-foreground">@{profileUser.username.toLowerCase()}</p>
            </div>
          </div>

          {isOwnProfile && profileUser.isAdmin && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Share your profile</h3>
              <ProfileLinkShare />
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            {isOwnProfile ? (
              <>
                {profileUser.isAdmin && (
                  <Button size="sm" onClick={() => navigate("/admin")}>
                    Admin Dashboard
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => navigate("/wallet")}>
                  Wallet Balance: ${user?.balance.toFixed(2)}
                </Button>
                {user?.isSubscribed ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-premium/20 text-premium">
                    {user.subscriptionType} subscriber
                    {user.isVerified && <VerificationBadge size="sm" />}
                  </span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => navigate("/subscribe")}>
                    Subscribe
                  </Button>
                )}
              </>
            ) : (
              // Viewing someone else's profile
              <Button 
                size="sm" 
                onClick={handleSubscribe} 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Subscribe to {profileUser.username}
              </Button>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <Tabs defaultValue="posts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-6">
                {userPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts to display</p>
                    {isOwnProfile && user?.isAdmin && (
                      <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate("/add-post")}
                      >
                        Create Post
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="about" className="mt-6">
                <div className="space-y-4">
                  {isOwnProfile && (
                    <>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Email
                        </h3>
                        <p>{user?.email}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Account Type
                        </h3>
                        <p>{user?.isAdmin ? "Admin/Creator" : "Subscriber"}</p>
                      </div>
                      {user?.isSubscribed && (
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">
                            Subscription
                          </h3>
                          <p>
                            {user.subscriptionType} (until{" "}
                            {user.subscriptionEndDate
                              ? new Date(user.subscriptionEndDate).toLocaleDateString()
                              : "N/A"}
                            )
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {profileUser.bio && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">
                        Bio
                      </h3>
                      <p>{profileUser.bio}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <ImageUploadComponent 
              onMediaAdded={handleMediaAdded} 
              acceptedTypes="image" 
            />
            
            {avatarPreview && (
              <div className="flex justify-center mt-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>{user?.username[0]}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAvatarModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveAvatar} disabled={!avatarPreview}>
              Save Picture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
