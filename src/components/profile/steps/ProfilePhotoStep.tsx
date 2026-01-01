import { useState, useRef } from "react";
import { Camera, Upload, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfilePhotoStepProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ProfilePhotoStep({ value, onChange }: ProfilePhotoStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Add Your Profile Photo</h2>
        <p className="text-muted-foreground">
          A professional photo helps build trust with clients
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Photo preview or upload area */}
        <div
          className={cn(
            "relative w-48 h-48 rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
            isDragging
              ? "border-primary bg-primary/5 scale-105"
              : value
              ? "border-primary"
              : "border-muted-foreground/30 hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="h-8 w-8 text-background" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <User className="h-16 w-16 mb-2" />
              <span className="text-sm font-medium">Drop photo here</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
          {value && (
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Recommended: Square image, at least 400x400 pixels. JPG, PNG or GIF.
        </p>
      </div>
    </div>
  );
}
