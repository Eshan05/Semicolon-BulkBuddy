"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import ImageUploadField from "@/components/ui/image-upload-field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { getCallbackURL } from "@/utils/shared";
import { calculatePasswordStrength } from "@/utils/password-strength";
import { LuExternalLink as ExternalLinkIcon, LuEye as EyeIcon, LuEyeOff as EyeOffIcon, LuKey as KeyIcon, LuLoader as Loader2, LuMail as MailIcon, LuUserPlus as UserPlus2Icon } from "react-icons/lu";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  image?: File | undefined;
};

export function SignUp() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      image: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (data.password !== data.passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      try {
        await signUp.email({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`.trim(),
          image: data.image ? await convertImageToBase64(data.image as File) : "",
          callbackURL: "/dashboard",
          fetchOptions: {
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
            onSuccess: async () => {
              toast.success("Successfully signed up");
              router.push(getCallbackURL(params));
            },
          },
        });
      } catch (err) {
        if (err instanceof Error) toast.error(err.message);
      }
    });
  };

  return (
    <Card className="max-w-md w-full bg-gradient-to-b from-neutral-100/50 to-white/30 dark:from-neutral-900/50 dark:to-neutral-900/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl md:text-2xl">Create an account</CardTitle>
        <CardDescription className="text-sm">Join and get access to the dashboard and features.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="firstName"
                control={form.control}
                rules={{ required: "First name is required" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="sr-only" htmlFor={field.name}>First name</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="First name"
                        aria-invalid={fieldState.invalid}
                        className="w-full peer ps-9"
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <UserPlus2Icon size={16} aria-hidden="true" />
                      </div>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                rules={{ required: "Last name is required" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="sr-only" htmlFor={field.name}>Last name</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Last name"
                        aria-invalid={fieldState.invalid}
                        className="w-full peer ps-9"
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <UserPlus2Icon size={16} aria-hidden="true" />
                      </div>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="email"
              control={form.control}
              rules={{ required: "Email is required" }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>Email</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="email@example.com"
                      aria-invalid={fieldState.invalid}
                      className="w-full peer ps-9"
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <MailIcon size={16} aria-hidden="true" />
                    </div>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              rules={{ required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      type={isVisible ? "text" : "password"}
                      placeholder="Password"
                      aria-invalid={fieldState.invalid}
                      className="w-full peer ps-9 pe-9"
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <KeyIcon size={16} aria-hidden="true" />
                    </div>
                    <button
                      className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => setIsVisible((s) => !s)}
                      aria-label={isVisible ? "Hide password" : "Show password"}
                      aria-pressed={isVisible}
                    >
                      {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="passwordConfirmation"
              control={form.control}
              rules={{ required: "Confirm password is required", minLength: { value: 8, message: "Confirm password must be at least 8 characters" } }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>Confirm password</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      type={isConfirmVisible ? "text" : "password"}
                      placeholder="Confirm password"
                      aria-invalid={fieldState.invalid}
                      className="w-full peer ps-9 pe-9"
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <KeyIcon size={16} aria-hidden="true" />
                    </div>
                    <button
                      className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => setIsConfirmVisible((s) => !s)}
                      aria-label={isConfirmVisible ? "Hide password" : "Show password"}
                      aria-pressed={isConfirmVisible}
                    >
                      {isConfirmVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Strength meter (5 bars) */}
            <div className="">
              {(() => {
                const password = form.getValues("password") || "";
                const score = calculatePasswordStrength(password); // 0-5
                const bars = Array.from({ length: 5 }).map((_, i) => i + 1);
                const getBarClass = (index: number) => {
                  if (score === 0) return "bg-neutral-200";
                  if (index <= score) {
                    if (score <= 1) return "bg-red-500";
                    if (score === 2) return "bg-amber-500";
                    if (score === 3) return "bg-yellow-400";
                    if (score === 4) return "bg-green-400";
                    return "bg-green-600";
                  }
                  return "bg-muted/20";
                };

                return (
                  <div className="flex items-center gap-2 mb-2">
                    {bars.map((b) => (
                      <div key={b} className={`h-2 flex-1 rounded-sm ${getBarClass(b)}`} style={{ minWidth: 0 }} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <ImageUploadField
              control={form.control}
              name="image"
              label="Profile image (optional)"
              description="Upload a profile image (max 1MB)"
            />
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={loading as unknown as boolean}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full flex-col text-center text-sm text-muted-foreground">
          <div className="flex-center-1 justify-center">
            Have an account? <Link href="/sign-in" className="text-primary underline">Sign in</Link><ExternalLinkIcon className="size-3 inline" />
          </div>
          <div className="flex-center-1 justify-center">Facing Issues?{" "} <Link href={'/contact'} className="text-primary underline cursor-pointer">Contact us</Link> <ExternalLinkIcon className="size-3 inline" /></div>
        </div>
      </CardFooter>
    </Card>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}