import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getOnboardingProfile, getOnboardingStatus } from "@/lib/onboarding";
import { headers } from "next/headers";
import { OnboardingForm } from "@/components/features/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [status, profile] = await Promise.all([
    getOnboardingStatus(),
    getOnboardingProfile(),
  ]);

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Company onboarding</h1>
          <p className="text-muted-foreground">
            Tell us about your company so we can verify your account and personalize your dashboard.
          </p>
        </div>
        <OnboardingForm
          initialProfile={profile}
          initialStatus={status.status}
          initialCompanyType={status.companyType}
        />
      </div>
    </div>
  );
}
