'use server'

import { headers } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buyerProfile,
  companyProfile,
  supplierProfile,
  user,
  verificationDocument,
} from "@/lib/db/schema";

const onboardingSchema = z.object({
  companyType: z.enum(["buyer", "supplier"]),
  companyName: z.string().min(2),
  legalName: z.string().min(2),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  yearFounded: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.string().optional(),
  annualRevenueBand: z.string().optional(),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().min(2),
  postalCode: z.string().optional(),
  contactName: z.string().min(2),
  contactRole: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6),
  alternatePhone: z.string().optional(),
  buyerDetails: z
    .object({
      procurementCategories: z.string().optional(),
      avgMonthlySpend: z.string().optional(),
      typicalOrderVolume: z.string().optional(),
      deliveryPreferences: z.string().optional(),
      paymentTerms: z.string().optional(),
      storageCapacity: z.string().optional(),
      complianceNeeds: z.string().optional(),
      preferredSuppliers: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  supplierDetails: z
    .object({
      productCategories: z.string().optional(),
      productionCapacity: z.string().optional(),
      minOrderQuantity: z.string().optional(),
      leadTimeDays: z.coerce.number().int().min(0).optional(),
      certifications: z.string().optional(),
      warehouseLocations: z.string().optional(),
      qualityAssurance: z.string().optional(),
      logisticsCapabilities: z.string().optional(),
      paymentTerms: z.string().optional(),
      serviceRegions: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  documents: z
    .array(
      z.object({
        docType: z.string().min(2),
        fileName: z.string().optional(),
      }),
    )
    .optional(),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;

async function getAuthedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function getOnboardingStatus() {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    return {
      status: "unauthenticated" as const,
      role: null as string | null,
      companyType: null as string | null,
    };
  }

  const existing = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, authedUser.id),
  });

  if (!existing) {
    return {
      status: "not_started" as const,
      role: authedUser.role ?? null,
      companyType: null as string | null,
    };
  }

  return {
    status: existing.status as "pending" | "approved" | "rejected",
    role: authedUser.role ?? null,
    companyType: existing.companyType,
  };
}

export async function getOnboardingProfile() {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    return null;
  }

  const existing = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, authedUser.id),
    with: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
  });

  if (!existing) {
    return null;
  }

  return existing;
}

export async function submitOnboarding(payload: OnboardingPayload) {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    throw new Error("Not authenticated");
  }

  const data = onboardingSchema.parse(payload);

  const existingCompany = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, authedUser.id),
  });

  const companyNameClash = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.companyName, data.companyName),
  });

  if (companyNameClash && companyNameClash.userId !== authedUser.id) {
    throw new Error("Company name is already taken.");
  }

  const companyId = existingCompany?.id ?? randomUUID();

  await db.transaction(async (tx) => {
    if (existingCompany) {
      await tx
        .update(companyProfile)
        .set({
          companyName: data.companyName,
          legalName: data.legalName,
          companyType: data.companyType,
          registrationNumber: data.registrationNumber || null,
          taxId: data.taxId || null,
          website: data.website || null,
          yearFounded: data.yearFounded ?? null,
          employeeCount: data.employeeCount || null,
          annualRevenueBand: data.annualRevenueBand || null,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state || null,
          country: data.country,
          postalCode: data.postalCode || null,
          contactName: data.contactName,
          contactRole: data.contactRole || null,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          alternatePhone: data.alternatePhone || null,
          status: "pending",
          statusReason: null,
          submittedAt: new Date(),
        })
        .where(eq(companyProfile.id, companyId));
    } else {
      await tx.insert(companyProfile).values({
        id: companyId,
        userId: authedUser.id,
        companyName: data.companyName,
        legalName: data.legalName,
        companyType: data.companyType,
        registrationNumber: data.registrationNumber || null,
        taxId: data.taxId || null,
        website: data.website || null,
        yearFounded: data.yearFounded ?? null,
        employeeCount: data.employeeCount || null,
        annualRevenueBand: data.annualRevenueBand || null,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state || null,
        country: data.country,
        postalCode: data.postalCode || null,
        contactName: data.contactName,
        contactRole: data.contactRole || null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        alternatePhone: data.alternatePhone || null,
        status: "pending",
      });
    }

    await tx.update(user).set({ role: data.companyType }).where(eq(user.id, authedUser.id));

    await tx.delete(buyerProfile).where(eq(buyerProfile.companyId, companyId));
    await tx.delete(supplierProfile).where(eq(supplierProfile.companyId, companyId));
    await tx.delete(verificationDocument).where(eq(verificationDocument.companyId, companyId));

    if (data.companyType === "buyer") {
      await tx.insert(buyerProfile).values({
        id: randomUUID(),
        companyId,
        procurementCategories: data.buyerDetails?.procurementCategories || null,
        avgMonthlySpend: data.buyerDetails?.avgMonthlySpend || null,
        typicalOrderVolume: data.buyerDetails?.typicalOrderVolume || null,
        deliveryPreferences: data.buyerDetails?.deliveryPreferences || null,
        paymentTerms: data.buyerDetails?.paymentTerms || null,
        storageCapacity: data.buyerDetails?.storageCapacity || null,
        complianceNeeds: data.buyerDetails?.complianceNeeds || null,
        preferredSuppliers: data.buyerDetails?.preferredSuppliers || null,
        notes: data.buyerDetails?.notes || null,
      });
    }

    if (data.companyType === "supplier") {
      await tx.insert(supplierProfile).values({
        id: randomUUID(),
        companyId,
        productCategories: data.supplierDetails?.productCategories || null,
        productionCapacity: data.supplierDetails?.productionCapacity || null,
        minOrderQuantity: data.supplierDetails?.minOrderQuantity || null,
        leadTimeDays: data.supplierDetails?.leadTimeDays ?? null,
        certifications: data.supplierDetails?.certifications || null,
        warehouseLocations: data.supplierDetails?.warehouseLocations || null,
        qualityAssurance: data.supplierDetails?.qualityAssurance || null,
        logisticsCapabilities: data.supplierDetails?.logisticsCapabilities || null,
        paymentTerms: data.supplierDetails?.paymentTerms || null,
        serviceRegions: data.supplierDetails?.serviceRegions || null,
        notes: data.supplierDetails?.notes || null,
      });
    }

    if (data.documents?.length) {
      await tx.insert(verificationDocument).values(
        data.documents.map((doc) => ({
          id: randomUUID(),
          companyId,
          docType: doc.docType,
          fileName: doc.fileName || null,
          status: "pending",
        })),
      );
    }
  });

  return { status: "pending" as const };
}

export async function listPendingVerifications() {
  const authedUser = await getAuthedUser();
  if (!authedUser || authedUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return db.query.companyProfile.findMany({
    where: eq(companyProfile.status, "pending"),
    with: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
      user: true,
    },
    orderBy: (fields, { desc }) => [desc(fields.submittedAt)],
  });
}

export async function updateVerificationStatus(params: {
  companyId: string;
  status: "approved" | "rejected";
  reason?: string;
}) {
  const authedUser = await getAuthedUser();
  if (!authedUser || authedUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(companyProfile)
    .set({
      status: params.status,
      statusReason: params.reason || null,
      reviewedAt: new Date(),
    })
    .where(eq(companyProfile.id, params.companyId));

  return { status: params.status };
}
