
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/context/PostContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Image } from "lucide-react";

const AddPostPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addPost } = usePost();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("5");

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

  const handleAddPost = () => {
    if (!content) {
      toast.error("Please enter post content");
      return;
    }

    if (!imageUrl) {
      toast.error("Please enter an image URL");
      return;
    }

    if (isPremium && (!price || parseFloat(price) <= 0)) {
      toast.error("Please enter a valid price for premium content");
      return;
    }

    addPost({
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content,
      media: [
        {
          type: "image",
          url: imageUrl,
        },
      ],
      isPremium,
      price: isPremium ? parseFloat(price) : 0,
    });

    toast.success("Post created successfully!");
    navigate("/profile");
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

      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <div className="flex space-x-2">
              <Input
                id="image"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a URL for the image to be displayed with your post
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="premium">Premium Content</Label>
              <Switch
                id="premium"
                checked={isPremium}
                onCheckedChange={setIsPremium}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mark this post as premium content that requires payment to view
            </p>
          </div>

          {isPremium && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0.99"
                step="0.01"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAddPost}>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddPostPage;
