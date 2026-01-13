import { jsonError, jsonOk } from "@/src/server/shared/http";
import { requirePrincipal } from "@/src/server/auth/principal";
import { getOrCreateUserByAuthSubject, requireBusiness } from "@/src/server/services/user-service";
import { joinPoolController } from "@/src/server/controllers/pools/join-pool-controller";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await ctx.params;
    const principal = await requirePrincipal();
    const user = await getOrCreateUserByAuthSubject({ authSubject: principal.authSubject });
    requireBusiness(user);

    const body = await request.json();
    const data = await joinPoolController({
      poolId,
      businessId: user.businessId,
      userId: user.id,
      body,
    });

    return jsonOk(data);
  } catch (err) {
    return jsonError(err);
  }
}
