"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { LuUpload as Upload, LuX as X, LuImage as ImageIcon } from "react-icons/lu";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export interface ImageUploadFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  accept?: string; // e.g. "image/jpeg,image/png"
  maxSizeMB?: number; // default 1MB
  className?: string;
}

export function ImageUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  label = "Upload Image",
  description = "Max size: 1 MB (JPG, JPEG, PNG).",
  accept = "image/jpeg,image/jpg,image/png",
  maxSizeMB = 1,
  className,
}: ImageUploadFieldProps<TFieldValues>) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPreviewFile = (file: File | null): boolean => {
    if (!file) return false;

    const maxSizeInBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error(`Image size exceeds ${maxSizeMB}MB`);
      return false;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: File | undefined) => void
  ) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (!selectedFile) {
      onChange(undefined);
      setPreviewUrl(null);
      return;
    }

    if (!validateAndPreviewFile(selectedFile)) {
      onChange(undefined);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onChange(selectedFile);
  };

  const handleRemoveFile = (onChange: (value: undefined) => void) => {
    onChange(undefined);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={cn("flex flex-col gap-2", className)}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          
          <div
            className={cn(
              "rounded-md border p-4",
              field.value ? "border-secondary" : "border-dashed border-secondary",
              "flex items-center justify-center w-full min-h-[80px]"
            )}
          >
            {!field.value ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-5 w-5" aria-hidden="true" />
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer font-medium text-blue-600 hover:underline">
                    <span>Choose file</span>
                    <Input
                      type="file"
                      accept={accept}
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, field.onChange)}
                      ref={fileInputRef}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                  </label>
                  <span>to upload</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{field.value.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(field.value.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  aria-label="Remove image"
                  onClick={() => handleRemoveFile(field.onChange)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>

          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default ImageUploadField;
