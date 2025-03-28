
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/context/PostContext";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { posts, loading } = usePost();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        {user?.isSubscribed ? (
          <span className="text-xs bg-premium/20 text-premium px-2 py-1 rounded-full">
            {user.subscriptionType} subscriber
          </span>
        ) : (
          <Button size="sm" onClick={() => navigate("/subscribe")}>
            Subscribe
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
