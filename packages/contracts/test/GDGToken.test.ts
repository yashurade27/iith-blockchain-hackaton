import { expect } from 'chai';
import hre from 'hardhat';
const { ethers } = hre;
import { GDGToken, RewardDistributor } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('GDG Token Rewards System', function () {
  let token: GDGToken;
  let distributor: RewardDistributor;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Token
    const GDGToken = await ethers.getContractFactory('GDGToken');
    token = (await GDGToken.deploy('G-CORE Token', 'GCORE')) as unknown as GDGToken;
    await token.waitForDeployment();

    // Deploy Distributor
    const RewardDistributor = await ethers.getContractFactory('RewardDistributor');
    distributor = (await RewardDistributor.deploy(await token.getAddress())) as unknown as RewardDistributor;
    await distributor.waitForDeployment();

    // Grant minter role to distributor
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, await distributor.getAddress());
  });

  describe('GDGToken', function () {
    it('Should have correct name and symbol', async function () {
      expect(await token.name()).to.equal('G-CORE Token');
      expect(await token.symbol()).to.equal('GCORE');
    });

    it('Should mint tokens by minter role', async function () {
      await token.mint(user1.address, ethers.parseEther('100'), 'Test mint');
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther('100'));
    });

    it('Should not allow non-minters to mint', async function () {
      await expect(
        token.connect(user1).mint(user2.address, ethers.parseEther('100'), 'Test')
      ).to.be.reverted;
    });

    it('Should burn tokens', async function () {
      await token.mint(user1.address, ethers.parseEther('100'), 'Test mint');
      await token.connect(user1).burn(ethers.parseEther('50'));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther('50'));
    });
  });

  describe('RewardDistributor', function () {
    it('Should distribute tokens to single user', async function () {
      await distributor.distributeTokens(
        user1.address,
        ethers.parseEther('100'),
        'CONTEST',
        'Won first place'
      );
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther('100'));
    });

    it('Should batch distribute tokens', async function () {
      await distributor.batchDistribute(
        [user1.address, user2.address],
        [ethers.parseEther('100'), ethers.parseEther('50')],
        ['Contest winner', 'Event participant']
      );
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther('100'));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther('50'));
    });

    it('Should emit distribution events', async function () {
      await expect(
        distributor.distributeTokens(
          user1.address,
          ethers.parseEther('100'),
          'EVENT',
          'Attended workshop'
        )
      )
        .to.emit(distributor, 'TokensDistributed')
        .withArgs(
          user1.address,
          ethers.parseEther('100'),
          'EVENT',
          'Attended workshop',
          await ethers.provider.getBlock('latest').then((b) => b!.timestamp + 1)
        );
    });

    it('Should not allow non-distributors to distribute', async function () {
      await expect(
        distributor
          .connect(user1)
          .distributeTokens(user2.address, ethers.parseEther('100'), 'TEST', 'Test')
      ).to.be.reverted;
    });
  });
});
