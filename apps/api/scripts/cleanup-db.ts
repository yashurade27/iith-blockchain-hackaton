import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database cleanup for new contract deployment...');

  try {
    // Order matters due to potential (though here cascade) dependencies
    console.log('Deleting Redemptions...');
    await prisma.redemption.deleteMany({});

    console.log('Deleting Transactions...');
    await prisma.transaction.deleteMany({});

    console.log('Deleting Activities...');
    await prisma.activity.deleteMany({});

    console.log('Deleting Notifications...');
    await prisma.notification.deleteMany({});

    console.log('✅ Activity, Redemptions, Transactions, and Notifications cleared.');
    console.log('💡 User accounts and Reward definitions have been preserved.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
