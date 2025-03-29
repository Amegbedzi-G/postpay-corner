
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Image, Upload, Link, X, Video } from "lucide-react";
import { usePost } from "@/context/PostContext";

type ImageUploadComponentProps = {
  onMediaAdded: (url: string, type: "image" | "video") => void;
  acceptedTypes?: "image" | "video" | "both";
};

export function ImageUploadComponent({ 
  onMediaAdded, 
  acceptedTypes = "both" 
}: ImageUploadComponentProps) {
  const { uploadImage } = usePost();
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<{url: string, type: "image" | "video"} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptString = () => {
    if (acceptedTypes === "image") return "image/*";
    if (acceptedTypes === "video") return "video/*";
    return "image/*,video/*";
  };

  const isVideo = (file: File) => file.type.startsWith('video/');
  const isImage = (file: File) => file.type.startsWith('image/');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check if file type is accepted
      if (acceptedTypes === "image" && !isImage(file)) {
        throw new Error('Only image files are accepted');
      }
      if (acceptedTypes === "video" && !isVideo(file)) {
        throw new Error('Only video files are accepted');
      }

      setIsUploading(true);
      const url = await uploadImage(file);
      const mediaType = isVideo(file) ? "video" as const : "image" as const;
      setPreview({ url, type: mediaType });
      onMediaAdded(url, mediaType);
      toast.success("Media uploaded successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload media";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Clear input value so user can upload the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!mediaUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(mediaUrl);
      // Determine if it's a video or image URL based on extension
      const isVideoUrl = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
      const mediaType = isVideoUrl ? "video" as const : "image" as const;
      
      // Check if URL matches accepted types
      if (acceptedTypes === "image" && mediaType === "video") {
        toast.error("Only image URLs are accepted");
        return;
      }
      if (acceptedTypes === "video" && mediaType === "image") {
        toast.error("Only video URLs are accepted");
        return;
      }
      
      setPreview({ url: mediaUrl, type: mediaType });
      onMediaAdded(mediaUrl, mediaType);
      setMediaUrl("");
      toast.success(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} URL added`);
    } catch (error) {
      toast.error("Please enter a valid URL");
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-border">
          {preview.type === "image" ? (
            <img 
              src={preview.url} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
          ) : (
            <video 
              src={preview.url} 
              controls 
              className="w-full h-48 object-cover"
            />
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 rounded-full"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            <div>
              <Label className="mb-2 block">Upload from device</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptString()}
                  onChange={handleFileUpload}
                  className="flex-1"
                  disabled={isUploading}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col">
              <Label className="mb-2">Or add media URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/media.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={isUploading}>
                  <Link className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
            {acceptedTypes === "video" ? (
              <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
            ) : (
              <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Upload {acceptedTypes === "both" ? "an image or video" : acceptedTypes === "image" ? "an image" : "a video"} or add a URL
            </p>
          </div>
        </>
      )}
    </div>
  );
}
