"use client";

import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { LuBuilding2, LuMail, LuPhone, LuGlobe, LuCalendar, LuUsers, LuMapPin, LuUpload, LuX, LuFileText, LuCircleCheck as LuCheckCircle, LuBadgeAlert as LuAlertCircle, LuBriefcase, LuPackage, LuDollarSign, LuClock, LuAward, LuWarehouse, LuShield, LuTruck, LuCreditCard, LuMap, LuNotebook, LuBuilding, LuIdCard, LuLink, LuUser, LuArrowLeft as LuRole, LuMailbox, LuPhoneCall, LuFileCheck } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { submitOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const storageKey = "bulkbuddy:onboardingDraft";

type OnboardingStatus = "unauthenticated" | "not_started" | "pending" | "approved" | "rejected";

type OnboardingProfile = {
  companyName: string;
  legalName: string;
  companyType: "buyer" | "supplier" | "";
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
  buyerDetails?: {
    procurementCategories?: string | null;
    avgMonthlySpend?: string | null;
    typicalOrderVolume?: string | null;
    deliveryPreferences?: string | null;
    paymentTerms?: string | null;
    storageCapacity?: string | null;
    complianceNeeds?: string | null;
    preferredSuppliers?: string | null;
    notes?: string | null;
  } | null;
  supplierDetails?: {
    productCategories?: string | null;
    productionCapacity?: string | null;
    minOrderQuantity?: string | null;
    leadTimeDays?: number | null;
    certifications?: string | null;
    warehouseLocations?: string | null;
    qualityAssurance?: string | null;
    logisticsCapabilities?: string | null;
    paymentTerms?: string | null;
    serviceRegions?: string | null;
    notes?: string | null;
  } | null;
  documents?: { docType: string; fileName?: string | null }[] | null;
};

type Props = {
  initialStatus: OnboardingStatus;
  initialCompanyType: string | null;
  initialProfile: OnboardingProfile | null;
};

const defaultFormState: OnboardingProfile = {
  companyName: "",
  legalName: "",
  companyType: "",
  registrationNumber: "",
  taxId: "",
  website: "",
  yearFounded: undefined,
  employeeCount: "",
  annualRevenueBand: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  alternatePhone: "",
  buyerDetails: {
    procurementCategories: "",
    avgMonthlySpend: "",
    typicalOrderVolume: "",
    deliveryPreferences: "",
    paymentTerms: "",
    storageCapacity: "",
    complianceNeeds: "",
    preferredSuppliers: "",
    notes: "",
  },
  supplierDetails: {
    productCategories: "",
    productionCapacity: "",
    minOrderQuantity: "",
    leadTimeDays: undefined,
    certifications: "",
    warehouseLocations: "",
    qualityAssurance: "",
    logisticsCapabilities: "",
    paymentTerms: "",
    serviceRegions: "",
    notes: "",
  },
  documents: [
    { docType: "Business registration" },
    { docType: "Tax certificate" },
    { docType: "Compliance / quality certificates" },
  ],
};

export function OnboardingForm({ initialStatus, initialCompanyType, initialProfile }: Props) {
  const [status, setStatus] = useState<OnboardingStatus>(initialStatus);
  const [formState, setFormState] = useState<OnboardingProfile>(() => {
    if (!initialProfile) {
      return defaultFormState;
    }

    return {
      ...defaultFormState,
      ...initialProfile,
      companyType: (initialProfile.companyType || initialCompanyType || "") as "buyer" | "supplier" | "",
      documents: initialProfile.documents?.length
        ? initialProfile.documents.map((doc) => ({ docType: doc.docType, fileName: doc.fileName || "" }))
        : defaultFormState.documents,
    };
  });
  const [isSubmitting, startTransition] = useTransition();

  const isLocked = status === "pending" || status === "approved";
  const showBuyerFields = formState.companyType === "buyer";
  const showSupplierFields = formState.companyType === "supplier";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLocked) return;

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Partial<OnboardingProfile>;
      setFormState((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [isLocked]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLocked) return;
    window.localStorage.setItem(storageKey, JSON.stringify(formState));
  }, [formState, isLocked]);

  const missingRequired = useMemo(() => {
    return (
      !formState.companyType ||
      !formState.companyName ||
      !formState.legalName ||
      !formState.addressLine1 ||
      !formState.city ||
      !formState.country ||
      !formState.contactName ||
      !formState.contactEmail ||
      !formState.contactPhone
    );
  }, [formState]);

  const handleDocumentChange = (index: number, fileName: string) => {
    setFormState((prev) => {
      const docs = [...(prev.documents || [])];
      docs[index] = { ...docs[index], fileName };
      return { ...prev, documents: docs };
    });
  };

  const handleFileRemove = (index: number) => {
    setFormState((prev) => {
      const docs = [...(prev.documents || [])];
      docs[index] = { ...docs[index], fileName: "" };
      return { ...prev, documents: docs };
    });
  };

  const FileUploadField = ({
    docType,
    fileName,
    index,
    disabled
  }: {
    docType: string;
    fileName?: string | null;
    index: number;
    disabled: boolean;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium flex items-center gap-2">
            <LuFileText className="h-4 w-4 text-muted-foreground" />
            {docType}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {fileName ? (
              <span className="flex items-center gap-1 text-green-600">
                <LuCheckCircle className="h-3 w-3" />
                Selected: {fileName}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <LuAlertCircle className="h-3 w-3" />
                No file selected
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {fileName ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => handleFileRemove(index)}
              disabled={disabled}
            >
              <LuX className="h-4 w-4 mr-1" />
              Remove
            </Button>
          ) : (
            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <LuUpload className="h-4 w-4 mr-1" />
                Choose file
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                disabled={disabled}
                onChange={(event) =>
                  handleDocumentChange(index, event.target.files?.[0]?.name || "")
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    if (missingRequired) {
      toast.error("Please fill the required fields before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        await submitOnboarding({
          companyType: formState.companyType as "buyer" | "supplier",
          companyName: formState.companyName,
          legalName: formState.legalName,
          registrationNumber: formState.registrationNumber || undefined,
          taxId: formState.taxId || undefined,
          website: formState.website || undefined,
          yearFounded: formState.yearFounded || undefined,
          employeeCount: formState.employeeCount || undefined,
          annualRevenueBand: formState.annualRevenueBand || undefined,
          addressLine1: formState.addressLine1,
          addressLine2: formState.addressLine2 || undefined,
          city: formState.city,
          state: formState.state || undefined,
          country: formState.country,
          postalCode: formState.postalCode || undefined,
          contactName: formState.contactName,
          contactRole: formState.contactRole || undefined,
          contactEmail: formState.contactEmail,
          contactPhone: formState.contactPhone,
          alternatePhone: formState.alternatePhone || undefined,
          buyerDetails: showBuyerFields
            ? {
              procurementCategories: formState.buyerDetails?.procurementCategories || undefined,
              avgMonthlySpend: formState.buyerDetails?.avgMonthlySpend || undefined,
              typicalOrderVolume: formState.buyerDetails?.typicalOrderVolume || undefined,
              deliveryPreferences: formState.buyerDetails?.deliveryPreferences || undefined,
              paymentTerms: formState.buyerDetails?.paymentTerms || undefined,
              storageCapacity: formState.buyerDetails?.storageCapacity || undefined,
              complianceNeeds: formState.buyerDetails?.complianceNeeds || undefined,
              preferredSuppliers: formState.buyerDetails?.preferredSuppliers || undefined,
              notes: formState.buyerDetails?.notes || undefined,
            }
            : undefined,
          supplierDetails: showSupplierFields
            ? {
              productCategories: formState.supplierDetails?.productCategories || undefined,
              productionCapacity: formState.supplierDetails?.productionCapacity || undefined,
              minOrderQuantity: formState.supplierDetails?.minOrderQuantity || undefined,
              leadTimeDays: formState.supplierDetails?.leadTimeDays || undefined,
              certifications: formState.supplierDetails?.certifications || undefined,
              warehouseLocations: formState.supplierDetails?.warehouseLocations || undefined,
              qualityAssurance: formState.supplierDetails?.qualityAssurance || undefined,
              logisticsCapabilities: formState.supplierDetails?.logisticsCapabilities || undefined,
              paymentTerms: formState.supplierDetails?.paymentTerms || undefined,
              serviceRegions: formState.supplierDetails?.serviceRegions || undefined,
              notes: formState.supplierDetails?.notes || undefined,
            }
            : undefined,
          documents: formState.documents?.map((doc) => ({
            docType: doc.docType,
            fileName: doc.fileName || undefined,
          })),
        });

        setStatus("pending");
        window.localStorage.removeItem(storageKey);
        toast.success("Onboarding submitted. We'll review your details shortly.");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unable to submit onboarding. Please try again.");
        }
      }
    });
  };

  const statusBadge =
    status === "approved" ? "default" : status === "pending" ? "secondary" : status === "rejected" ? "destructive" : "outline";

  const StatusIcon = () => {
    switch (status) {
      case "approved":
        return <LuCheckCircle className="h-4 w-4" />;
      case "pending":
        return <LuClock className="h-4 w-4" />;
      case "rejected":
        return <LuAlertCircle className="h-4 w-4" />;
      default:
        return <LuAlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon />
              Verification status
            </CardTitle>
            <CardDescription>Keep this page open to track approval progress.</CardDescription>
          </div>
          <Badge variant={statusBadge} className="w-fit capitalize flex items-center gap-1">
            <StatusIcon />
            {status.replace("_", " ")}
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {status === "approved" && "Your company has been verified. You can access the dashboard now."}
          {status === "pending" && "Your details are being reviewed by the admin team. We'll notify you once approved."}
          {status === "rejected" && "Your submission needs updates. Please revise the form and resubmit."}
          {status === "not_started" && "Complete the form below to request access to the BulkBuddy platform."}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuBuilding2 className="h-5 w-5" />
            Company details
          </CardTitle>
          <CardDescription>Ensure all details match your official records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuBriefcase className="h-4 w-4 text-muted-foreground" />
                Company type
              </label>
              <Select
                value={formState.companyType}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    companyType: value as "buyer" | "supplier",
                  }))
                }
                disabled={isLocked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {formState.companyType ? (formState.companyType === "buyer" ? "Buyer (SME)" : "Supplier") : "Select role"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer (SME)</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuBuilding className="h-4 w-4 text-muted-foreground" />
                Company name
              </label>
              <Input
                value={formState.companyName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    companyName: event.target.value,
                  }))
                }
                placeholder="BulkBuddy Manufacturing"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuIdCard className="h-4 w-4 text-muted-foreground" />
                Legal entity name
              </label>
              <Input
                value={formState.legalName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    legalName: event.target.value,
                  }))
                }
                placeholder="BulkBuddy Manufacturing Pvt Ltd"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuFileText className="h-4 w-4 text-muted-foreground" />
                Registration number
              </label>
              <Input
                value={formState.registrationNumber || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    registrationNumber: event.target.value,
                  }))
                }
                placeholder="CIN / CAC / RC"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuDollarSign className="h-4 w-4 text-muted-foreground" />
                Tax ID
              </label>
              <Input
                value={formState.taxId || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    taxId: event.target.value,
                  }))
                }
                placeholder="VAT / TIN / GST"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuGlobe className="h-4 w-4 text-muted-foreground" />
                Website
              </label>
              <Input
                value={formState.website || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    website: event.target.value,
                  }))
                }
                placeholder="https://yourcompany.com"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuCalendar className="h-4 w-4 text-muted-foreground" />
                Year founded
              </label>
              <Input
                type="number"
                value={formState.yearFounded ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    yearFounded: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                placeholder="2014"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuUsers className="h-4 w-4 text-muted-foreground" />
                Employee count
              </label>
              <Input
                value={formState.employeeCount || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    employeeCount: event.target.value,
                  }))
                }
                placeholder="10-50"
                disabled={isLocked}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMapPin className="h-4 w-4 text-muted-foreground" />
                Address line 1
              </label>
              <Input
                value={formState.addressLine1}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    addressLine1: event.target.value,
                  }))
                }
                placeholder="Street address"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMapPin className="h-4 w-4 text-muted-foreground" />
                Address line 2
              </label>
              <Input
                value={formState.addressLine2 || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    addressLine2: event.target.value,
                  }))
                }
                placeholder="Suite, unit, building"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMapPin className="h-4 w-4 text-muted-foreground" />
                City
              </label>
              <Input
                value={formState.city}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    city: event.target.value,
                  }))
                }
                placeholder="Lagos"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMapPin className="h-4 w-4 text-muted-foreground" />
                State / Province
              </label>
              <Input
                value={formState.state || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    state: event.target.value,
                  }))
                }
                placeholder="Lagos"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMap className="h-4 w-4 text-muted-foreground" />
                Country
              </label>
              <Input
                value={formState.country}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    country: event.target.value,
                  }))
                }
                placeholder="Nigeria"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMapPin className="h-4 w-4 text-muted-foreground" />
                Postal code
              </label>
              <Input
                value={formState.postalCode || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    postalCode: event.target.value,
                  }))
                }
                placeholder="100001"
                disabled={isLocked}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuUser className="h-4 w-4 text-muted-foreground" />
                Primary contact name
              </label>
              <Input
                value={formState.contactName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    contactName: event.target.value,
                  }))
                }
                placeholder="Jane Doe"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuRole className="h-4 w-4 text-muted-foreground" />
                Role / title
              </label>
              <Input
                value={formState.contactRole || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    contactRole: event.target.value,
                  }))
                }
                placeholder="Procurement Lead"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuMail className="h-4 w-4 text-muted-foreground" />
                Contact email
              </label>
              <Input
                type="email"
                value={formState.contactEmail}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    contactEmail: event.target.value,
                  }))
                }
                placeholder="name@company.com"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuPhoneCall className="h-4 w-4 text-muted-foreground" />
                Contact phone
              </label>
              <Input
                value={formState.contactPhone}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    contactPhone: event.target.value,
                  }))
                }
                placeholder="+234 800 000 0000"
                disabled={isLocked}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {showBuyerFields && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuBriefcase className="h-5 w-5" />
              Buyer profile
            </CardTitle>
            <CardDescription>Help suppliers understand your procurement needs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuPackage className="h-4 w-4 text-muted-foreground" />
                Procurement categories
              </label>
              <Input
                value={formState.buyerDetails?.procurementCategories || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      procurementCategories: event.target.value,
                    },
                  }))
                }
                placeholder="Steel, plastics, packaging"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuDollarSign className="h-4 w-4 text-muted-foreground" />
                Average monthly spend
              </label>
              <Input
                value={formState.buyerDetails?.avgMonthlySpend || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      avgMonthlySpend: event.target.value,
                    },
                  }))
                }
                placeholder="$25k - $50k"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuPackage className="h-4 w-4 text-muted-foreground" />
                Typical order volume
              </label>
              <Input
                value={formState.buyerDetails?.typicalOrderVolume || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      typicalOrderVolume: event.target.value,
                    },
                  }))
                }
                placeholder="500kg - 2 tons"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuTruck className="h-4 w-4 text-muted-foreground" />
                Delivery preferences
              </label>
              <Input
                value={formState.buyerDetails?.deliveryPreferences || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      deliveryPreferences: event.target.value,
                    },
                  }))
                }
                placeholder="Doorstep delivery, weekly"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuCreditCard className="h-4 w-4 text-muted-foreground" />
                Payment terms
              </label>
              <Input
                value={formState.buyerDetails?.paymentTerms || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      paymentTerms: event.target.value,
                    },
                  }))
                }
                placeholder="Net 15, bank transfer"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuWarehouse className="h-4 w-4 text-muted-foreground" />
                Storage capacity
              </label>
              <Input
                value={formState.buyerDetails?.storageCapacity || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      storageCapacity: event.target.value,
                    },
                  }))
                }
                placeholder="250 sqm warehouse"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuShield className="h-4 w-4 text-muted-foreground" />
                Compliance needs
              </label>
              <Input
                value={formState.buyerDetails?.complianceNeeds || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      complianceNeeds: event.target.value,
                    },
                  }))
                }
                placeholder="ISO 9001, REACH"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuBuilding className="h-4 w-4 text-muted-foreground" />
                Preferred suppliers
              </label>
              <Input
                value={formState.buyerDetails?.preferredSuppliers || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      preferredSuppliers: event.target.value,
                    },
                  }))
                }
                placeholder="Local suppliers, within 150km"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LuNotebook className="h-4 w-4 text-muted-foreground" />
                Additional notes
              </label>
              <Textarea
                value={formState.buyerDetails?.notes || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    buyerDetails: {
                      ...prev.buyerDetails,
                      notes: event.target.value,
                    },
                  }))
                }
                placeholder="Share any specific sourcing requirements"
                disabled={isLocked}
                className="min-h-30"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {showSupplierFields && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier profile</CardTitle>
            <CardDescription>Help buyers evaluate your capacity and compliance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product categories</label>
              <Input
                value={formState.supplierDetails?.productCategories || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      productCategories: event.target.value,
                    },
                  }))
                }
                placeholder="Steel coils, HDPE granules"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Production capacity</label>
              <Input
                value={formState.supplierDetails?.productionCapacity || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      productionCapacity: event.target.value,
                    },
                  }))
                }
                placeholder="5 tons / week"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum order quantity</label>
              <Input
                value={formState.supplierDetails?.minOrderQuantity || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      minOrderQuantity: event.target.value,
                    },
                  }))
                }
                placeholder="500kg"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lead time (days)</label>
              <Input
                type="number"
                value={formState.supplierDetails?.leadTimeDays ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      leadTimeDays: event.target.value ? Number(event.target.value) : undefined,
                    },
                  }))
                }
                placeholder="7"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Certifications</label>
              <Input
                value={formState.supplierDetails?.certifications || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      certifications: event.target.value,
                    },
                  }))
                }
                placeholder="ISO 9001, ISO 14001"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse locations</label>
              <Input
                value={formState.supplierDetails?.warehouseLocations || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      warehouseLocations: event.target.value,
                    },
                  }))
                }
                placeholder="Lagos, Abuja"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality assurance</label>
              <Input
                value={formState.supplierDetails?.qualityAssurance || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      qualityAssurance: event.target.value,
                    },
                  }))
                }
                placeholder="In-house QC, third-party audits"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logistics capabilities</label>
              <Input
                value={formState.supplierDetails?.logisticsCapabilities || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      logisticsCapabilities: event.target.value,
                    },
                  }))
                }
                placeholder="In-house fleet, partner carriers"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment terms</label>
              <Input
                value={formState.supplierDetails?.paymentTerms || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      paymentTerms: event.target.value,
                    },
                  }))
                }
                placeholder="Net 30, LC"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service regions</label>
              <Input
                value={formState.supplierDetails?.serviceRegions || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      serviceRegions: event.target.value,
                    },
                  }))
                }
                placeholder="West Africa"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Additional notes</label>
              <Textarea
                value={formState.supplierDetails?.notes || ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    supplierDetails: {
                      ...prev.supplierDetails,
                      notes: event.target.value,
                    },
                  }))
                }
                placeholder="Share any supply guarantees or differentiators"
                disabled={isLocked}
                className="min-h-30"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuFileCheck className="h-5 w-5" />
            Verification documents
          </CardTitle>
          <CardDescription>Upload required documents for verification.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {formState.documents?.map((doc, index) => (
            <FileUploadField
              key={doc.docType}
              docType={doc.docType}
              fileName={doc.fileName}
              index={index}
              disabled={isLocked}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={() => {
            window.localStorage.removeItem(storageKey);
            setFormState(defaultFormState);
          }}
          disabled={isLocked}
        >
          Clear draft
        </Button>
        <Button onClick={handleSubmit} disabled={isLocked || isSubmitting || missingRequired}>
          {isSubmitting ? "Submitting..." : "Submit for verification"}
        </Button>
      </div>
    </div>
  );
}
