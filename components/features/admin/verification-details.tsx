"use client";

import { useState } from "react";
import { FileText, User, Building2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaClose,
} from "@/components/ui/credenza";
import { cn } from "@/lib/utils";

export type VerificationCompany = {
  id: string;
  companyName: string;
  legalName: string;
  companyType: string;
  registrationNumber?: string | null;
  taxId?: string | null;
  website?: string | null;
  yearFounded?: number | null;
  employeeCount?: string | null;
  annualRevenueBand?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  contactName: string;
  contactRole?: string | null;
  contactEmail: string;
  contactPhone: string;
  alternatePhone?: string | null;
  submittedAt: Date | number | string;
  buyerProfile?: Record<string, unknown> | null;
  supplierProfile?: Record<string, unknown> | null;
  documents?: { id: string; docType: string; fileName?: string | null; status: string }[];
};

export function VerificationDetails({ company }: { company: VerificationCompany }) {
  const [open, setOpen] = useState(false);
  const isBuyer = company.companyType === "buyer";
  const profile = isBuyer ? company.buyerProfile : company.supplierProfile;
  const initials = (company.companyName || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        View details
      </Button>
      <CredenzaContent className="max-w-4xl">
        <CredenzaHeader>
          <CredenzaTitle>Verification details</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="max-h-[70vh] overflow-y-auto">
          <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-background p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-background text-sm font-semibold">
                  {initials || "CO"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="truncate text-lg font-semibold">{company.companyName}</p>
                  <p className="truncate text-xs text-muted-foreground">{company.legalName}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {company.city}{company.state ? `, ${company.state}` : ""}{company.country ? ` • ${company.country}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {company.companyType}
                </Badge>
                <Badge variant="outline">Submitted by {company.contactName}</Badge>
                <a
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  href={`mailto:${company.contactEmail}`}
                >
                  Email
                </a>
                <a
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  href={`tel:${company.contactPhone}`}
                >
                  Call
                </a>
              </div>
            </div>
          </div>

          <Tabs defaultValue="company">
            <TabsList className="w-full" variant="line">
              <TabsTrigger value="company" className="flex-1">
                <Building2 className="h-4 w-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-1">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex-1">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="Company name" value={company.companyName} />
                <Detail label="Legal name" value={company.legalName} />
                <Detail label="Registration number" value={company.registrationNumber} />
                <Detail label="Tax ID" value={company.taxId} />
                <Detail label="Website" value={company.website} />
                <Detail label="Year founded" value={company.yearFounded?.toString()} />
                <Detail label="Employee count" value={company.employeeCount} />
                <Detail label="Revenue band" value={company.annualRevenueBand} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="Address line 1" value={company.addressLine1} />
                <Detail label="Address line 2" value={company.addressLine2} />
                <Detail label="City" value={company.city} />
                <Detail label="State" value={company.state} />
                <Detail label="Country" value={company.country} />
                <Detail label="Postal code" value={company.postalCode} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="Primary contact" value={company.contactName} />
                <Detail label="Contact role" value={company.contactRole} />
                <Detail label="Contact email" value={company.contactEmail} />
                <Detail label="Contact phone" value={company.contactPhone} />
                <Detail label="Alternate phone" value={company.alternatePhone} />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-4 space-y-4">
              {!profile && (
                <p className="text-sm text-muted-foreground">No profile details submitted.</p>
              )}
              {profile && (
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(profile).map(([key, value]) => (
                    <Detail key={key} label={toTitle(key)} value={formatValue(value)} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-4 space-y-4">
              {company.documents?.length ? (
                <div className="space-y-3">
                  {company.documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{doc.docType}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {doc.fileName || "No file uploaded"}
                        </p>
                      </div>
                      <Badge variant={doc.status === "approved" ? "default" : "secondary"} className="capitalize">
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              )}
            </TabsContent>
          </Tabs>
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          >
            Close
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function toTitle(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}
