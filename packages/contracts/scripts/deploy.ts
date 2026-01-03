import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying G-CORE Token Rewards Contracts (GDG PCCOER)...');

  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);

  // Deploy G-CORE Token
  console.log('\n1. Deploying G-CORE Token...');
  const GDGToken = await ethers.getContractFactory('GDGToken');
  const token = await GDGToken.deploy('G-CORE Token', 'GCORE');
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('✅ G-CORE Token deployed to:', tokenAddress);

  // Deploy RewardDistributor
  console.log('\n2. Deploying RewardDistributor...');
  const RewardDistributor = await ethers.getContractFactory('RewardDistributor');
  const distributor = await RewardDistributor.deploy(tokenAddress);
  await distributor.waitForDeployment();
  const distributorAddress = await distributor.getAddress();
  console.log('RewardDistributor deployed to:', distributorAddress);

  // Deploy RewardMarketplace
  console.log('\n3. Deploying RewardMarketplace...');
  const RewardMarketplace = await ethers.getContractFactory('RewardMarketplace');
  const marketplace = await RewardMarketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log('RewardMarketplace deployed to:', marketplaceAddress);

  // Grant roles
  console.log('\n4. Granting roles...');
  const MINTER_ROLE = await token.MINTER_ROLE();
  
  const grantMinterTx = await token.grantRole(MINTER_ROLE, distributorAddress);
  await grantMinterTx.wait();
  console.log('Granted MINTER_ROLE to RewardDistributor');

  console.log('\n✅ G-CORE Token Deployment Completed!');
  console.log('\n🪙 Contract Addresses:');
  console.log('=======================');
  console.log('G-CORE Token (GCORE):', tokenAddress);
  console.log('RewardDistributor:', distributorAddress);
  console.log('RewardMarketplace:', marketplaceAddress);
  console.log('\n📋 Save these addresses in your .env files!');
  console.log('\nToken Details:');
  console.log('  Name: G-CORE Token');
  console.log('  Symbol: GCORE');
  console.log('  Powered by: GDG PCCOER');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
