
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Image, Upload, Link, X } from "lucide-react";
import { usePost } from "@/context/PostContext";

type ImageUploadComponentProps = {
  onImageAdded: (imageUrl: string) => void;
};

export function ImageUploadComponent({ onImageAdded }: ImageUploadComponentProps) {
  const { uploadImage } = usePost();
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setPreview(url);
      onImageAdded(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
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
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      setPreview(imageUrl);
      onImageAdded(imageUrl);
      setImageUrl("");
      toast.success("Image URL added");
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
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
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
                  accept="image/*"
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
              <Label className="mb-2">Or add image URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
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
            <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Upload an image or add an image URL
            </p>
          </div>
        </>
      )}
    </div>
  );
}
