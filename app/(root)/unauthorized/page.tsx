"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5 text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You do not have permission to access this resource. If you believe this is an error, please contact your administrator.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Return Home
          </Link>
          <Link href="/sign-in" className={buttonVariants()}>
            Switch Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
