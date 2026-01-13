"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Credenza, CredenzaBody, CredenzaClose, CredenzaContent, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { Button, buttonVariants } from "@/components/ui/button";
import { OnboardingForm } from "@/components/features/onboarding/onboarding-form";
import { cn } from "@/lib/utils";

type OnboardingStatus = "unauthenticated" | "not_started" | "pending" | "approved" | "rejected";

type ProfileResponse = {
  status: {
    status: OnboardingStatus;
    role: string | null;
    companyType: string | null;
  };
  profile: any;
};

export default function EditProfileItem() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProfileResponse | null>(null);

  const isApproved = data?.status?.status === "approved";

  useEffect(() => {
    if (!open) return;
    let active = true;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/onboarding/profile", { cache: "no-store" });
        const json = (await res.json()) as ProfileResponse;
        if (active) setData(json);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [open]);

  const formKey = useMemo(() => {
    if (!data?.profile?.id) return "profile-new";
    return `${data.profile.id}-${data.profile.updatedAt ?? "0"}`;
  }, [data]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger
        render={
          <DropdownMenuItem
            closeOnClick={false}
            onSelect={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            disabled={!isApproved && !!data?.status?.status && data.status.status !== "approved"}
          >
            <Pencil className="h-4 w-4" />
            Edit company profile
          </DropdownMenuItem>
        }
      >
        <span className="sr-only">Edit company profile</span>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-4xl">
        <CredenzaHeader>
          <CredenzaTitle>Edit your company profile</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="text-sm text-muted-foreground">Loading profile...</div>
          )}
          {!loading && data?.profile && (
            <OnboardingForm
              key={formKey}
              initialProfile={data.profile}
              initialStatus={data.status.status}
              initialCompanyType={data.status.companyType}
              allowEditApproved
              hideStatusCard
            />
          )}
          {!loading && !data?.profile && (
            <div className="text-sm text-muted-foreground">
              Complete onboarding first to edit your profile.
            </div>
          )}
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
            Close
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
