import { describe, expect, test } from "bun:test";

import { computeProgressPercent, getCurrentPriceCents } from "@/lib/pricing";

describe("pricing", () => {
  test("computeProgressPercent returns 0 when target is 0", () => {
    expect(computeProgressPercent(10, 0)).toBe(0);
  });

  test("getCurrentPriceCents picks highest eligible tier", () => {
    const retail = 400;
    const tiers = [
      { minPercent: 60, pricePerUnitCents: 350 },
      { minPercent: 80, pricePerUnitCents: 300 },
      { minPercent: 100, pricePerUnitCents: 250 },
    ];

    expect(getCurrentPriceCents(retail, tiers, 0)).toBe(400);
    expect(getCurrentPriceCents(retail, tiers, 60)).toBe(350);
    expect(getCurrentPriceCents(retail, tiers, 85)).toBe(300);
    expect(getCurrentPriceCents(retail, tiers, 120)).toBe(250);
  });
});
