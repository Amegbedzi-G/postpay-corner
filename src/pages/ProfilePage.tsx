
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/context/PostContext";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { posts } = usePost();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  // Get user's posts (for admin) or filter by isPremium for regular users
  const userPosts = user.isAdmin
    ? posts
    : posts.filter((post) => !post.isPremium || post.purchasedBy.includes(user.id));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl shadow-md overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="mt-4 md:mt-0 md:ml-4 md:mb-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground">@{user.username.toLowerCase()}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {user.isAdmin && (
              <Button size="sm" onClick={() => navigate("/admin")}>
                Admin Dashboard
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate("/wallet")}>
              Wallet Balance: ${user.balance.toFixed(2)}
            </Button>
            {user.isSubscribed ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-premium/20 text-premium">
                {user.subscriptionType} subscriber
              </span>
            ) : (
              <Button size="sm" variant="outline" onClick={() => navigate("/subscribe")}>
                Subscribe
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
                    {user.isAdmin && (
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
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Email
                    </h3>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Account Type
                    </h3>
                    <p>{user.isAdmin ? "Admin/Creator" : "Subscriber"}</p>
                  </div>
                  {user.isSubscribed && (
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
