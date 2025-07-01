# Token Factory Contracts

A Cairo smart contract system for creating and managing ERC20 and ERC721 tokens on Starknet.

## Overview

The Token Factory is a comprehensive smart contract system that allows users to deploy and manage their own ERC20 and ERC721 tokens with enhanced functionality. The system consists of three main contracts:

- **TokenFactory**: The main factory contract for deploying tokens
- **MyERC20**: Enhanced ERC20 token implementation with minting, burning, and dynamic decimals
- **MyERC721**: Enhanced ERC721 token implementation with minting, burning, and creator tracking

## Architecture

### TokenFactory Contract

The main factory contract that handles the deployment and tracking of tokens.

#### Features
- Deploy ERC20 tokens with custom parameters
- Deploy ERC721 tokens with custom parameters
- Track all tokens created by each user
- Maintain global statistics of created tokens
- Emit events for token creation
- Verify token authenticity

#### Key Functions

```cairo
fn create_erc20(
    ref self: TContractState,
    name: ByteArray,
    symbol: ByteArray,
    decimals: u8,
    initial_supply: u256,
) -> ContractAddress

fn create_erc721(
    ref self: TContractState,
    name: ByteArray,
    symbol: ByteArray,
    base_uri: ByteArray,
) -> ContractAddress

fn get_created_tokens(self: @TContractState, creator: ContractAddress) -> Array<TokenInfo>
fn get_token_count(self: @TContractState, creator: ContractAddress) -> u32
fn get_total_tokens_created(self: @TContractState) -> u32
fn is_token_created_by_factory(self: @TContractState, token_address: ContractAddress) -> bool
```

#### TokenInfo Structure

```cairo
struct TokenInfo {
    pub token_address: ContractAddress,
    pub token_type: u8,  // 0 for ERC20, 1 for ERC721
    pub name: ByteArray,
    pub symbol: ByteArray,
    pub created_at: u64,
}
```

### MyERC20 Contract

Enhanced ERC20 token implementation based on OpenZeppelin components.

#### Features
- Standard ERC20 functionality (transfer, approve, allowance)
- Minting and burning capabilities (owner only)
- Dynamic decimals adjustment (owner only)
- Creator tracking
- Ownable access control

#### Key Functions

```cairo
fn mint(ref self: TContractState, to: ContractAddress, amount: u256)
fn burn(ref self: TContractState, from: ContractAddress, amount: u256)
fn set_decimals(ref self: TContractState, new_decimals: u8)
fn get_decimals(self: @TContractState) -> u8
fn get_creator(self: @TContractState) -> ContractAddress
```

### MyERC721 Contract

Enhanced ERC721 token implementation based on OpenZeppelin components.

#### Features
- Standard ERC721 functionality (transfer, approve, tokenURI)
- Minting and burning capabilities (owner only)
- Automatic token ID management
- Creator tracking
- Ownable access control
- SRC5 interface support

#### Key Functions

```cairo
fn mint(ref self: TContractState, to: ContractAddress, token_id: u256)
fn burn(ref self: TContractState, token_id: u256)
fn get_creator(self: @TContractState) -> ContractAddress
fn get_next_token_id(self: @TContractState) -> u256
```

## Installation and Setup

### Prerequisites

- [Scarb](https://docs.swmansion.com/scarb/) (Cairo package manager)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) (Testing framework)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd token_factory
```

2. Navigate to the contracts directory:
```bash
cd contracts
```

3. Build the contracts:
```bash
scarb build
```

## Testing

The project includes comprehensive tests covering all contract functionality.

### Running Tests

```bash
# Run all tests
scarb test

# Run tests with detailed output
snforge test

# Run specific test
snforge test test_create_erc20_token
```

### Test Coverage

The test suite includes:

- **Constructor Tests**: Verify proper contract initialization
- **Token Creation Tests**: Test ERC20 and ERC721 token deployment
- **Multi-user Tests**: Verify multiple users can create tokens independently
- **Minting and Burning Tests**: Test token lifecycle management
- **Access Control Tests**: Verify only authorized users can perform restricted operations
- **Dynamic Features Tests**: Test decimal adjustment and other dynamic features
- **Event Emission Tests**: Verify proper event emission
- **Token Tracking Tests**: Test factory's ability to track created tokens

## Deployment

### Deploy to Starknet

1. Declare the contracts:
```bash
# Declare MyERC20
starkli declare target/dev/contracts_MyERC20.contract_class.json

# Declare MyERC721
starkli declare target/dev/contracts_MyERC721.contract_class.json

# Declare TokenFactory
starkli declare target/dev/contracts_TokenFactory.contract_class.json
```

2. Deploy the TokenFactory:
```bash
starkli deploy <token_factory_class_hash> <erc20_class_hash> <erc721_class_hash>
```

### Constructor Parameters

The TokenFactory contract requires two parameters:
- `erc20_class_hash`: Class hash of the declared MyERC20 contract
- `erc721_class_hash`: Class hash of the declared MyERC721 contract

## Usage Examples

### Creating an ERC20 Token

```cairo
let factory = ITokenFactoryDispatcher { contract_address: factory_address };

let token_address = factory.create_erc20(
    "My Token",           // name
    "MTK",               // symbol
    18,                  // decimals
    1000000000000000000000  // initial_supply (1000 tokens with 18 decimals)
);
```

### Creating an ERC721 Token

```cairo
let factory = ITokenFactoryDispatcher { contract_address: factory_address };

let token_address = factory.create_erc721(
    "My NFT Collection",  // name
    "MNC",               // symbol
    "https://api.example.com/metadata/"  // base_uri
);
```

### Managing Created Tokens

```cairo
// Get all tokens created by a user
let tokens = factory.get_created_tokens(user_address);

// Get token count for a user
let count = factory.get_token_count(user_address);

// Verify if a token was created by the factory
let is_valid = factory.is_token_created_by_factory(token_address);
```

## Security Considerations

- All minting and burning operations require owner privileges
- Dynamic decimal adjustment is restricted to token owners
- Factory tracks all deployed tokens to prevent counterfeiting
- Comprehensive access control using OpenZeppelin's Ownable component

## Dependencies

- **Starknet**: 2.11.4
- **OpenZeppelin Contracts**: v1.0.0
- **Starknet Foundry**: 0.41.0 (dev dependency)

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
