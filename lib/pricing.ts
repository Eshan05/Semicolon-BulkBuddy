export type PriceTier = {
  minPercent: number;
  pricePerUnitCents: number;
};

export function computeProgressPercent(currentQuantity: number, targetQuantity: number) {
  if (!targetQuantity) return 0;
  return (currentQuantity / targetQuantity) * 100;
}

export function getCurrentPriceCents(
  retailPriceCents: number,
  tiers: PriceTier[],
  progressPercent: number,
) {
  const sorted = [...tiers].sort((a, b) => a.minPercent - b.minPercent);
  let price = retailPriceCents;

  for (const tier of sorted) {
    if (progressPercent >= tier.minPercent) {
      price = tier.pricePerUnitCents;
    }
  }

  return price;
}
