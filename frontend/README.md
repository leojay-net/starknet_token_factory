# Token Factory Frontend

A Next.js frontend application for the Token Factory smart contract system on Starknet. This application allows users to create, deploy, and manage ERC20 and ERC721 tokens without writing any code.

## Features

### 🏠 Landing Page
- Modern, responsive design with your brand colors (#4E3F95 primary, #2E2A56 dark)
- Feature highlights and statistics
- Call-to-action sections
- How it works guide

### 📊 Dashboard
- Wallet connection with Starknet wallets
- User token overview and statistics
- Recent activity feed
- Quick actions for token creation

### 🎨 Token Creation
- No-code ERC20 token creation
- No-code ERC721 NFT collection creation
- Form validation and real-time preview
- Transaction status tracking

### 🔍 Token Explorer
- Browse all tokens created through the factory
- Search and filter functionality
- Token statistics and performance metrics
- Recent platform activity

### 📱 Token Details
- Comprehensive token information
- Transaction history
- Holder analytics
- Market data (when available)

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Starknet Integration**: Starknet.js & get-starknet-core
- **Charts**: Recharts
- **State Management**: React Context
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- A Starknet wallet (ArgentX, Braavos, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd token_factory/frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the values in `.env.local`:
   ```env
   NEXT_PUBLIC_FACTORY_ADDRESS=your_deployed_factory_address
   NEXT_PUBLIC_ERC20_CLASS_HASH=your_erc20_class_hash
   NEXT_PUBLIC_ERC721_CLASS_HASH=your_erc721_class_hash
   NEXT_PUBLIC_NETWORK=testnet  # or mainnet
   NEXT_PUBLIC_RPC_URL=your_rpc_url
   ```

4. **Run the development server:**
   ```bash
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── create/            # Token creation page
│   ├── dashboard/         # User dashboard
│   ├── explorer/          # Token explorer
│   ├── tokens/[address]/  # Token details page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── Navbar.tsx        # Navigation component
│   └── Footer.tsx        # Footer component
├── context/              # React Context providers
│   └── WalletContext.tsx # Wallet connection state
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
├── services/             # API and service layer
│   └── tokenFactory.ts   # Smart contract interactions
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
└── config/               # Configuration
    └── index.ts          # App configuration
```

## Key Components

### WalletProvider
Manages Starknet wallet connection state and provides wallet context throughout the app.

### TokenFactoryService
Handles all smart contract interactions including:
- Token creation (ERC20/ERC721)
- Fetching user tokens
- Transaction history
- Token details

### UI Components
Consistent, reusable components following your design system:
- Buttons with variants (primary, secondary, outline, ghost)
- Cards for content organization
- Form inputs with validation
- Navigation and layout components

## Smart Contract Integration

The frontend integrates with three main contracts:
- **TokenFactory**: Main factory for creating tokens
- **MyERC20**: Enhanced ERC20 implementation
- **MyERC721**: Enhanced ERC721 implementation

### Contract Functions Used

```typescript
// Create ERC20 token
await tokenFactory.create_erc20(name, symbol, decimals, initialSupply)

// Create ERC721 token
await tokenFactory.create_erc721(name, symbol, baseUri)

// Get user's created tokens
await tokenFactory.get_created_tokens(userAddress)

// Get token statistics
await tokenFactory.get_total_tokens_created()
```

## Deployment

### Build for Production

```bash
yarn build
```

### Deploy to Vercel

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FACTORY_ADDRESS` | Deployed TokenFactory contract address | Yes |
| `NEXT_PUBLIC_ERC20_CLASS_HASH` | ERC20 contract class hash | Yes |
| `NEXT_PUBLIC_ERC721_CLASS_HASH` | ERC721 contract class hash | Yes |
| `NEXT_PUBLIC_NETWORK` | Starknet network (testnet/mainnet) | Yes |
| `NEXT_PUBLIC_RPC_URL` | Starknet RPC endpoint | Yes |
| `NEXT_PUBLIC_EXPLORER_URL` | Block explorer URL | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Design System

### Colors
- **Primary**: #4E3F95 (Dark Purple)
- **Primary Dark**: #2E2A56 
- **Background**: #FAFAFA (Light Gray)
- **Text**: #374151 (Dark Gray)
- **Success**: #10B981 (Green)
- **Error**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: Bold, varying sizes
- **Body**: Regular weight, 1.6 line height

### Components
All components follow consistent spacing, typography, and color schemes aligned with your brand identity.

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Ensure you have a Starknet wallet installed
   - Check if wallet is connected to the correct network

2. **Contract Calls Fail**
   - Verify contract addresses in environment variables
   - Check RPC endpoint connectivity
   - Ensure sufficient account balance for gas

3. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && yarn install`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the troubleshooting guide above
2. Review existing issues in the repository
3. Create a new issue with detailed information
4. Join our Discord community (if applicable)
