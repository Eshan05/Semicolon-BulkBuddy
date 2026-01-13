import { prisma } from "../../src/server/data/prisma/client";

async function main() {
  const business = await prisma.business.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      name: "Demo SME",
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo SME",
      address: "Mumbai, India",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {
      name: "Demo Supplier",
      businessId: business.id,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      businessId: business.id,
      name: "Demo Supplier",
      factoryAddress: "Navi Mumbai, India",
    },
  });

  const product = await prisma.product.upsert({
    where: { id: "00000000-0000-0000-0000-000000000100" },
    update: {
      name: "Steel Rod",
      unit: "kg",
      basePricePaise: 5000,
      supplierId: supplier.id,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000100",
      supplierId: supplier.id,
      name: "Steel Rod",
      unit: "kg",
      basePricePaise: 5000,
    },
  });

  await prisma.pricingTier.createMany({
    data: [
      {
        id: "00000000-0000-0000-0000-000000001001",
        productId: product.id,
        thresholdQuantity: 0,
        unitPricePaise: 5000,
        sortOrder: 1,
      },
      {
        id: "00000000-0000-0000-0000-000000001002",
        productId: product.id,
        thresholdQuantity: 1000,
        unitPricePaise: 4700,
        sortOrder: 2,
      },
      {
        id: "00000000-0000-0000-0000-000000001003",
        productId: product.id,
        thresholdQuantity: 5000,
        unitPricePaise: 4400,
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.pool.upsert({
    where: { id: "00000000-0000-0000-0000-000000010000" },
    update: {
      businessId: business.id,
      productId: product.id,
      status: "OPEN",
      radiusKm: 50,
    },
    create: {
      id: "00000000-0000-0000-0000-000000010000",
      businessId: business.id,
      productId: product.id,
      status: "OPEN",
      radiusKm: 50,
      totalQuantity: 0,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
