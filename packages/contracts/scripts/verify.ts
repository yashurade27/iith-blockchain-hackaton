import { run } from 'hardhat';

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || '';
  const DISTRIBUTOR_ADDRESS = process.env.DISTRIBUTOR_ADDRESS || '';
  const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || '';

  if (!TOKEN_ADDRESS || !DISTRIBUTOR_ADDRESS || !MARKETPLACE_ADDRESS) {
    console.error('Please set contract addresses in .env file');
    process.exit(1);
  }

  console.log('Verifying contracts on Etherscan...');

  // Verify GDGToken
  console.log('\n1. Verifying GDGToken...');
  try {
    await run('verify:verify', {
      address: TOKEN_ADDRESS,
      constructorArguments: ['GDG Token', 'GDG'],
    });
    console.log('✅ GDGToken verified');
  } catch (error: any) {
    console.log('❌ GDGToken verification failed:', error.message);
  }

  // Verify RewardDistributor
  console.log('\n2. Verifying RewardDistributor...');
  try {
    await run('verify:verify', {
      address: DISTRIBUTOR_ADDRESS,
      constructorArguments: [TOKEN_ADDRESS],
    });
    console.log('✅ RewardDistributor verified');
  } catch (error: any) {
    console.log('❌ RewardDistributor verification failed:', error.message);
  }

  // Verify RewardMarketplace
  console.log('\n3. Verifying RewardMarketplace...');
  try {
    await run('verify:verify', {
      address: MARKETPLACE_ADDRESS,
      constructorArguments: [TOKEN_ADDRESS],
    });
    console.log('✅ RewardMarketplace verified');
  } catch (error: any) {
    console.log('❌ RewardMarketplace verification failed:', error.message);
  }

  console.log('\n✅ Verification completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
