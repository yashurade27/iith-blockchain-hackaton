import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying GDG Token Rewards contracts...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy GDGToken
  console.log('\n1. Deploying GDGToken...');
  const GDGToken = await ethers.getContractFactory('GDGToken');
  const token = await GDGToken.deploy('GDG Token', 'GDG');
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('GDGToken deployed to:', tokenAddress);

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

  console.log('\n✅ Deployment completed!');
  console.log('\nContract Addresses:');
  console.log('===================');
  console.log('GDGToken:', tokenAddress);
  console.log('RewardDistributor:', distributorAddress);
  console.log('RewardMarketplace:', marketplaceAddress);
  console.log('\nSave these addresses in your .env files!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
