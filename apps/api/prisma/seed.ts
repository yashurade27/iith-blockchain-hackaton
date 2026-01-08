import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample rewards
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: 'Google Developer Hoodie',
        description: 'Premium cotton blend hoodie with embroidered Google Developer logo. Perfect for coding sessions.',
        cost: 500,
        stock: 15,
        category: 'Swag',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Mechanical Keyboard',
        description: 'Wireless mechanical keyboard with custom G-CORE keycaps and RGB lighting.',
        cost: 1200,
        stock: 5,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Google Cloud Credits $50',
        description: 'Get $50 worth of Google Cloud Platform credits for your next project.',
        cost: 200,
        stock: 50,
        category: 'Digital',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Android Plushie',
        description: 'Adorable Android mascot plushie. A must-have for every Android developer.',
        cost: 150,
        stock: 0,
        category: 'Swag',
        imageUrl: 'https://images.unsplash.com/photo-1601057298562-4d649d295727?auto=format&fit=crop&q=80&w=800',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Tech Backpack',
        description: 'Water-resistant laptop backpack with multiple compartments for all your gadgets.',
        cost: 800,
        stock: 8,
        category: 'Swag',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Clean Code Book',
        description: 'Classic guide to software craftsmanship. Essential reading for every developer.',
        cost: 300,
        stock: 12,
        category: 'Books',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
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
