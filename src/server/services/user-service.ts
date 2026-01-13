import { prisma } from "../data/prisma/client";
import { errors } from "../shared/errors";

export type SessionUser = {
  id: string;
  authSubject: string;
  role: "ADMIN" | "SUPPLIER" | "BUYER";
  businessId: string | null;
};

export async function getOrCreateUserByAuthSubject(input: {
  authSubject: string;
}): Promise<SessionUser> {
  const existing = await prisma.user.findUnique({
    where: { authSubject: input.authSubject },
    select: { id: true, authSubject: true, role: true, businessId: true },
  });

  if (existing) return existing;

  // Default to BUYER; real onboarding flow will assign business + role.
  const created = await prisma.user.create({
    data: {
      authSubject: input.authSubject,
      role: "BUYER",
    },
    select: { id: true, authSubject: true, role: true, businessId: true },
  });

  return created;
}

export function requireBusiness(user: SessionUser): asserts user is SessionUser & { businessId: string } {
  if (!user.businessId) {
    throw errors.forbidden("User is not associated with a business yet");
  }
}

export function requireRole(user: SessionUser, roles: SessionUser["role"][]) {
  if (!roles.includes(user.role)) {
    throw errors.forbidden("Insufficient role");
  }
}
