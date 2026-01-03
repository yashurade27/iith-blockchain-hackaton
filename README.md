# GDG Token Rewards Platform

A blockchain-based community engagement platform where users earn ERC-20 tokens for participating in coding contests, events, and workshops. Tokens can be redeemed for merchandise and goodies.

## Tech Stack

### Monorepo Structure
- **Turborepo** - Monorepo build system
- **TypeScript** - Type safety across all packages

### Frontend (`apps/web`)
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Ethers.js v6** - Blockchain interactions
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Global state management
- **React Hook Form + Zod** - Form validation

### Backend (`apps/api`)
- **Node.js + Express** with TypeScript
- **PostgreSQL** - Database
- **Prisma ORM** - Type-safe database access
- **JWT** - Authentication
- **Winston** - Logging
- **Ethers.js** - Blockchain interactions

### Smart Contracts (`packages/contracts`)
- **Hardhat** - Development environment
- **Solidity 0.8.20** - Smart contract language
- **OpenZeppelin** - Secure contract libraries
- **TypeScript** - Contract testing and scripts

## Project Structure

```
gdg-token-rewards/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   ├── ui/         # shadcn components
│   │   │   │   ├── wallet/     # Wallet connection
│   │   │   │   └── layout/     # Layout components
│   │   │   ├── pages/          # Page components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities, API client, Web3 config
│   │   │   └── stores/         # Zustand stores
│   │   └── package.json
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── controllers/    # Route controllers
│       │   ├── middleware/     # Express middleware
│       │   ├── services/       # Business logic
│       │   └── utils/          # Utilities
│       ├── prisma/             # Database schema and migrations
│       └── package.json
├── packages/
│   ├── contracts/              # Solidity contracts
│   │   ├── contracts/          # Smart contracts
│   │   ├── scripts/            # Deployment scripts
│   │   └── test/               # Contract tests
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared configurations
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package.json
```

## Smart Contracts

### GDGToken.sol
ERC-20 token with:
- Minting capability (admin only)
- Burning functionality
- Pausable transfers
- Role-based access control

### RewardDistributor.sol
Token distribution contract with:
- Single user token distribution
- Batch distribution to multiple users
- Event emissions for tracking
- Admin-only access

### RewardMarketplace.sol
Token redemption contract with:
- Token burning on redemption
- Event tracking
- Integration with backend for fulfillment

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- MetaMask browser extension
- Infura account (for Sepolia testnet)
- Etherscan API key (for contract verification)

### 1. Clone and Install Dependencies

```bash
cd GDG-token
npm install
```

### 2. Set Up Environment Variables

**Backend (`apps/api/.env`):**
```bash
cd apps/api
cp .env.example .env
# Edit .env with your configuration
```

**Frontend (`apps/web/.env`):**
```bash
cd apps/web
cp .env.example .env
# Edit .env with your configuration
```

**Contracts (`packages/contracts/.env`):**
```bash
cd packages/contracts
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample rewards
npm run prisma:seed
```

### 4. Deploy Smart Contracts

**Local Development:**
```bash
# In one terminal, start local hardhat node
cd packages/contracts
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

**Sepolia Testnet:**
```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

**Save the deployed contract addresses** and update your `.env` files!

### 5. Start Development Servers

From the root directory:
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Prisma Studio** (optional): `cd apps/api && npm run prisma:studio`

## Usage

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and connect MetaMask
2. **View Dashboard**: See your token balance and activities
3. **Check Leaderboard**: View top contributors
4. **Redeem Rewards**: Browse marketplace and redeem tokens for rewards
5. **View Profile**: Check your transaction history

### For Admins

1. **Access Admin Panel**: Navigate to `/admin` (admin role required)
2. **Distribute Tokens**: Award tokens to users for activities
3. **Manage Redemptions**: View and approve redemption requests
4. **Verify Activities**: Verify user participation in events

## API Endpoints

### Authentication
- `POST /api/auth/connect` - Connect wallet and create/login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:address/balance` - Get token balance
- `GET /api/users/:address` - Get user profile

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (supports filters)

### Rewards
- `GET /api/rewards` - Get available rewards
- `POST /api/rewards/redeem` - Redeem tokens for reward

### Transactions
- `GET /api/transactions` - Get user transactions

### Admin (Protected)
- `POST /api/admin/distribute` - Distribute tokens
- `POST /api/admin/batch-distribute` - Batch distribute tokens
- `POST /api/admin/verify-activity` - Verify user activity
- `GET /api/admin/redemptions` - Get redemption requests
- `PATCH /api/admin/redemptions/:id` - Update redemption status

## Testing

### Smart Contracts
```bash
cd packages/contracts
npx hardhat test
```

### Backend
```bash
cd apps/api
npm test
```

### Frontend
```bash
cd apps/web
npm test
```

## Building for Production

```bash
# Build all packages
npm run build

# Start production backend
cd apps/api
npm start

# Preview production frontend
cd apps/web
npm run preview
```

## Database Schema

The platform uses PostgreSQL with the following main entities:
- **User**: User accounts and profiles
- **Transaction**: Token transaction history
- **Activity**: User activities and points
- **Reward**: Available rewards in marketplace
- **Redemption**: Token redemption records

## Contract Verification

After deploying to Sepolia:

```bash
cd packages/contracts
# Set contract addresses in .env
npm run verify
```

## Troubleshooting

### MetaMask Connection Issues
- Ensure you're on Sepolia testnet
- Try disconnecting and reconnecting
- Clear browser cache and restart

### Database Connection Errors
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Contract Deployment Failures
- Ensure you have Sepolia ETH (from faucet)
- Check PRIVATE_KEY in `.env`
- Verify RPC_URL is correct

### Build Errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Turbo cache: `npx turbo clean`
- Regenerate Prisma client: `cd apps/api && npx prisma generate`

## Useful Commands

```bash
# Development
npm run dev              # Start all dev servers
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run type-check       # Type check all packages

# Database
cd apps/api
npm run prisma:migrate   # Run migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio

# Smart Contracts
cd packages/contracts
npx hardhat compile      # Compile contracts
npx hardhat test         # Run tests
npx hardhat node         # Start local node
npm run deploy:local     # Deploy to local node
npm run deploy:sepolia   # Deploy to Sepolia
npm run verify           # Verify on Etherscan
```

## Network Configuration

### Sepolia Testnet
- Chain ID: 11155111
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team
- Check documentation

## Roadmap

- [ ] Add email notifications for token distribution
- [ ] Implement NFT rewards
- [ ] Add social media integrations
- [ ] Mobile app development
- [ ] Multi-chain support
- [ ] Governance token features

---

Built with ❤️ by GDG Community
