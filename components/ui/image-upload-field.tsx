"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value?: File | undefined;
  onChange?: (file: File | undefined) => void;
  className?: string;
  accept?: string;
};

/**
 * Minimal image upload field used by Sign Up.
 * It intentionally keeps API simple (File in / File out).
 */
export default function ImageUploadField({
  value: _value,
  onChange,
  className,
  accept = "image/*",
}: Props) {
  return (
    <Input
      className={className}
      type="file"
      accept={accept}
      onChange={(e) => {
        const file = e.target.files?.[0];
        onChange?.(file);
      }}
    />
  );
}