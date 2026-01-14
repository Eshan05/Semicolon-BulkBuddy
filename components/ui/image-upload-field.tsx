"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  description?: string;
  className?: string;
  accept?: string;
};

/**
 * Image upload field integrated with react-hook-form.
 */
export default function ImageUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  accept = "image/*",
}: Props<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, ref, value: _value, ...field }, fieldState }) => (
        <Field className={className}>
          {label && <FieldLabel>{label}</FieldLabel>}
          <Input
            {...field}
            type="file"
            accept={accept}
            ref={ref}
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(file);
            }}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError />
        </Field>
      )}
    />
  );
}