import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}

const ImageUpload = ({ 
  value, 
  onChange, 
  bucket = "product-images",
  folder = "products"
}: ImageUploadProps) => {
  const { language, t } = useAdminLanguage();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const img = t.imageUpload;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(img?.imageOnly || "Only images can be uploaded");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(img?.maxSize || "Image size cannot exceed 5MB");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success(img?.uploadSuccess || "Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || img?.uploadError || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const fontClass = language === "bn" ? "font-siliguri" : "";

  return (
    <div className={fontClass} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Product"
            className="w-full h-48 object-cover border border-border"
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
          <div 
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
            style={{ borderRadius: 'var(--radius-lg)', gap: 'var(--space-2)' }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span style={{ marginLeft: 'var(--space-1)' }}>{img?.changeImage || "Change"}</span>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: 'var(--radius-lg)', gap: 'var(--space-2)' }}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">{img?.uploading || "Uploading..."}</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{img?.dropzone || "Upload an image"}</span>
              <span className="text-xs text-muted-foreground">{img?.dropzoneHint || "PNG, JPG (max 5MB)"}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
