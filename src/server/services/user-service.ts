import { prisma } from "../data/prisma/client";
import { errors } from "../shared/errors";

export type SessionUser = {
  id: string;
  role: "ADMIN" | "SUPPLIER" | "BUYER";
  businessId: string | null;
};

export async function getOrCreateUserByAuthSubject(input: {
  authSubject: string;
}): Promise<SessionUser> {
  const existing = await prisma.user.findUnique({
    where: { id: input.authSubject },
    select: { id: true, role: true, businessId: true },
  });

  if (existing) return existing as SessionUser;

  // Default to BUYER; real onboarding flow will assign business + role.
  const created = await prisma.user.create({
    data: {
      id: input.authSubject,
      name: "New User", // Better Auth usually provides this, but we need a default for creation
      email: `${input.authSubject}@placeholder.com`, // Email is mandatory in our schema
      emailVerified: false,
      role: "BUYER",
    },
    select: { id: true, role: true, businessId: true },
  });

  return created as SessionUser;
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
