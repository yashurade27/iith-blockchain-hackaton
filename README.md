<div align="center">

# G-CORE Token Rewards Platform

### *Blockchain-Powered Community Engagement for GDG PCCOER*

# [**🚀 LIVE LINK 🚀**](https://iith-blockchain-hackaton-web.vercel.app/)

[![Frontend](https://img.shields.io/badge/Frontend-Live-success?style=for-the-badge&logo=vercel)](https://iith-blockchain-hackaton-web.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Live-blue?style=for-the-badge&logo=render)](https://gcore-api.onrender.com)

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A Web3-based rewards platform where GDG PCCOER community members earn G-CORE (ERC-20) tokens for participating in coding contests, hackathons, workshops, and events. Tokens can be redeemed for exclusive merchandise and goodies.**

# 🎥 [**WATCH DEMO VIDEO**](https://drive.google.com/drive/folders/1tjm5P7TLu4rMy4PibE9hWyycAcSvskED?usp=sharing) 🎥

---

## 🚀 Live Deployment

The platform is fully deployed and accessible at the following endpoints:

| Service | Status | URL |
| :--- | :--- | :--- |
| **🌐 Frontend App** | [![Vercel](https://img.shields.io/badge/Vercel-Live-success?style=flat&logo=vercel)](https://iith-blockchain-hackaton-web.vercel.app/) | [iith-blockchain-hackaton-web.vercel.app](https://iith-blockchain-hackaton-web.vercel.app/) |
| **⚙️ Backend API** | [![Render](https://img.shields.io/badge/Render-Live-blue?style=flat&logo=render)](https://gcore-api.onrender.com) | [gcore-api.onrender.com](https://gcore-api.onrender.com) |
| **🏥 API Health** | [![Status](https://img.shields.io/badge/Status-Healthy-success?style=flat)](https://gcore-api.onrender.com/health) | [/health](https://gcore-api.onrender.com/health) |

---

### [⚡ **GO TO SETUP & INSTALLATION** ⚡](#setup--installation)

[Features](#features) | [Tech Stack](#tech-stack)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo Video](#demo-video)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**G-CORE Token Rewards Platform** is a comprehensive Web3 solution designed to incentivize and reward active participation in GDG PCCOER community activities.

### Problem Statement

Community engagement in tech communities often lacks tangible incentives. Volunteers and active participants invest significant time and effort without recognition or rewards.

### Our Solution

We've built a blockchain-based reward system where:
- **Community members** earn G-CORE tokens for verified activities
- **Admins** can distribute tokens transparently on-chain
- **Users** can redeem tokens for real-world merchandise
- **Everyone** can view rankings on a public leaderboard

---

## Demo Video

**Watch our complete platform demonstration:**

# 👉 [**CLICK HERE TO WATCH DEMO VIDEO**](https://drive.google.com/drive/folders/1tjm5P7TLu4rMy4PibE9hWyycAcSvskED?usp=sharing) 👈


---

## Features

### For Community Members
| Feature | Description |
|---------|-------------|
| **Wallet Authentication** | Secure login using MetaMask wallet signatures |
| **Token Balance** | View real-time G-CORE token balance from blockchain |
| **Activity Dashboard** | Track all earning activities and transaction history |
| **Leaderboard** | View rankings filtered by time period and activity type |
| **Reward Marketplace** | Browse and redeem tokens for merchandise |

### For Administrators
| Feature | Description |
|---------|-------------|
| **Token Distribution** | Award tokens to users for verified activities |
| **Batch Distribution** | Distribute tokens to multiple users at once |
| **Activity Verification** | Verify user participation in events |
| **Redemption Management** | View and fulfill redemption requests |

### Blockchain Features
| Feature | Description |
|---------|-------------|
| **ERC-20 Token** | Standard-compliant G-CORE token |
| **Role-Based Access** | Secure admin-only minting and distribution |
| **Pausable Transfers** | Emergency pause functionality |
| **Token Burning** | Tokens burned on redemption |

---

## Tech Stack

### Monorepo Structure
- **Turborepo** - Monorepo build system
- **TypeScript** - End-to-end type safety

### Frontend (`apps/web`)
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Ethers.js v6** - Blockchain integration
- **TanStack Query** - State management

### Backend (`apps/api`)
- **Node.js + Express** - REST API
- **PostgreSQL** - Database
- **Prisma ORM** - Database access
- **JWT** - Authentication
- **Ethers.js** - Blockchain interactions

### Smart Contracts (`packages/contracts`)
- **Hardhat** - Development framework
- **Solidity 0.8.20** - Smart contract language
- **OpenZeppelin** - Contract libraries

---

## Project Structure

```
gdg-token-rewards/
├── apps/
│   ├── web/                      # React Frontend Application
│   └── api/                      # Express Backend Application
├── packages/
│   ├── contracts/                # Solidity Smart Contracts
│   ├── types/                    # Shared TypeScript types
│   └── config/                   # Shared configurations
├── turbo.json                    # Turborepo configuration
└── package.json                  # Root package.json
```

---

## Smart Contracts

Our platform consists of three interconnected smart contracts deployed on the Ethereum Sepolia testnet:

### 1. GDGToken.sol
The core ERC-20 token contract implementing the G-CORE token with minting, burning, and pausing capabilities.

### 2. RewardDistributor.sol
Handles automated token distribution to community members for verified activities.

### 3. RewardMarketplace.sol
Manages token-to-merchandise redemption, handling the burning of tokens upon redemption.

---

## Setup & Installation

> **⚠️ IMPORTANT:** Before starting, please [**Watch the Demo Video**](https://drive.google.com/drive/folders/1tjm5P7TLu4rMy4PibE9hWyycAcSvskED?usp=sharing) to understand the workflow.

### Prerequisites
- Node.js 18+
- PostgreSQL
- MetaMask Wallet

### 1. Clone and Install

```bash
git clone https://github.com/yashurade27/iith-blockchain-hackaton.git
cd iith-blockchain-hackaton
npm install
```

### 2. Database Setup

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 3. Start Development Servers

```bash
# From root directory
npm run dev
```

---

## Environment Variables

Create `.env` files in the respective directories using these templates. 
**Note:** The contract addresses below are for the deployed Sepolia testnet version.

### Backend (`apps/api/.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/db_name?sslmode=require"

# Security
JWT_SECRET="your-super-secret-key"
CORS_ORIGIN="http://localhost:5173"

# Server
PORT=3001
NODE_ENV="development"

# Admin
ADMIN_WALLET_ADDRESS="0x..."

# Blockchain Configuration
RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
PRIVATE_KEY="your-wallet-private-key"

# Contract Addresses (Sepolia)
CONTRACT_ADDRESS="0x88aA29447A86a22311295f9edCA7040020844ddB"
DISTRIBUTOR_ADDRESS="0xe33F2D04bEf43bb88606c3767107B30cd1a8d822"
MARKETPLACE_ADDRESS="0x2A81b7b2716Dd56AE0DA79bae4f234E7A3d705D1"
```

### Frontend (`apps/web/.env`)

```env
VITE_API_URL="https://gcore-api.onrender.com"
VITE_CHAIN_ID=11155111

# Contract Addresses (Sepolia)
VITE_CONTRACT_ADDRESS="0x88aA29447A86a22311295f9edCA7040020844ddB"
VITE_DISTRIBUTOR_ADDRESS="0xe33F2D04bEf43bb88606c3767107B30cd1a8d822"
VITE_MARKETPLACE_ADDRESS="0x2A81b7b2716Dd56AE0DA79bae4f234E7A3d705D1"
```

### Contracts (`packages/contracts/.env`)

```env
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
PRIVATE_KEY="your-deployer-private-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"
REPORT_GAS=false
```

---

## License

This project is licensed under the **MIT License**.

---
