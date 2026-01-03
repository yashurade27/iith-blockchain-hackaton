import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample rewards
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: 'GDG T-Shirt',
        description: 'Official GDG branded t-shirt',
        cost: 100,
        stock: 50,
        category: 'Apparel',
        imageUrl: 'https://via.placeholder.com/300x300?text=GDG+T-Shirt',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'GDG Hoodie',
        description: 'Premium GDG hoodie',
        cost: 250,
        stock: 25,
        category: 'Apparel',
        imageUrl: 'https://via.placeholder.com/300x300?text=GDG+Hoodie',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Sticker Pack',
        description: 'Pack of 10 assorted GDG stickers',
        cost: 25,
        stock: 200,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x300?text=Sticker+Pack',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Water Bottle',
        description: 'Insulated GDG water bottle',
        cost: 75,
        stock: 100,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x300?text=Water+Bottle',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Laptop Sticker',
        description: 'Premium vinyl laptop sticker',
        cost: 15,
        stock: 300,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x300?text=Laptop+Sticker',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Coffee Mug',
        description: 'Ceramic GDG coffee mug',
        cost: 50,
        stock: 75,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x300?text=Coffee+Mug',
      },
    }),
  ]);

  console.log(`Created ${rewards.length} rewards`);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
