import { z } from "zod";
import { parseOrThrow } from "../../shared/validation";
import { joinPoolAndReprice } from "../../services/pools/pool-pricing-service";

const bodySchema = z.object({
  quantity: z.number().int().positive(),
});

export async function joinPoolController(input: {
  businessId: string;
  poolId: string;
  userId: string;
  body: unknown;
}) {
  const body = parseOrThrow(bodySchema, input.body);
  return joinPoolAndReprice({
    businessId: input.businessId,
    poolId: input.poolId,
    userId: input.userId,
    quantity: body.quantity,
  });
}
