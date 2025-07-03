use starknet::ContractAddress;

#[derive(Drop, Clone, Serde, starknet::Store)]
pub struct TokenInfo {
    pub token_address: ContractAddress,
    pub token_type: u8,
    pub name: ByteArray,
    pub symbol: ByteArray,
    pub created_at: u64,
}

#[starknet::interface]
pub trait ITokenFactory<TContractState> {
    fn create_erc20(
        ref self: TContractState,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        initial_supply: u256,
    ) -> ContractAddress;

    fn create_erc721(
        ref self: TContractState, name: ByteArray, symbol: ByteArray,
    ) -> ContractAddress;

    fn get_created_tokens(self: @TContractState, creator: ContractAddress) -> Array<TokenInfo>;
    fn get_token_count(self: @TContractState, creator: ContractAddress) -> u32;
    fn get_total_tokens_created(self: @TContractState) -> u32;
    fn is_token_created_by_factory(self: @TContractState, token_address: ContractAddress) -> bool;
    fn get_all_tokens(self: @TContractState) -> Array<TokenInfo>;
}

#[starknet::contract]
pub mod TokenFactory {
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::syscalls::deploy_syscall;
    use starknet::{ClassHash, ContractAddress, get_block_timestamp, get_caller_address};
    use super::{ITokenFactory, TokenInfo};

    #[storage]
    struct Storage {
        creator_token_count: Map<ContractAddress, u32>,
        creator_token_by_index: Map<(ContractAddress, u32), TokenInfo>,
        total_tokens_created: u32,
        token_by_global_index: Map<u32, TokenInfo>,
        factory_tokens: Map<ContractAddress, bool>,
        erc20_class_hash: ClassHash,
        erc721_class_hash: ClassHash,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        TokenCreated: TokenCreated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TokenCreated {
        pub creator: ContractAddress,
        pub token_address: ContractAddress,
        pub token_type: u8,
        pub name: ByteArray,
        pub symbol: ByteArray,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, erc20_class_hash: ClassHash, erc721_class_hash: ClassHash,
    ) {
        self.erc20_class_hash.write(erc20_class_hash);
        self.erc721_class_hash.write(erc721_class_hash);
        self.total_tokens_created.write(0);
    }

    #[abi(embed_v0)]
    impl TokenFactoryImpl of ITokenFactory<ContractState> {
        fn create_erc20(
            ref self: ContractState,
            name: ByteArray,
            symbol: ByteArray,
            decimals: u8,
            initial_supply: u256,
        ) -> ContractAddress {
            let creator = get_caller_address();
            let class_hash = self.erc20_class_hash.read();

            let mut calldata = array![];
            name.serialize(ref calldata);
            symbol.serialize(ref calldata);
            decimals.serialize(ref calldata);
            initial_supply.serialize(ref calldata);
            creator.serialize(ref calldata);

            let (token_address, _) = deploy_syscall(class_hash, 0, calldata.span(), false).unwrap();

            let token_info = TokenInfo {
                token_address,
                token_type: 0,
                name: name.clone(),
                symbol: symbol.clone(),
                created_at: get_block_timestamp(),
            };

            self._add_token_to_creator(creator, token_info);
            self.factory_tokens.write(token_address, true);

            self.emit(TokenCreated { creator, token_address, token_type: 0, name, symbol });

            token_address
        }

        fn create_erc721(
            ref self: ContractState, name: ByteArray, symbol: ByteArray,
        ) -> ContractAddress {
            let creator = get_caller_address();
            let class_hash = self.erc721_class_hash.read();

            let mut calldata = array![];
            name.serialize(ref calldata);
            symbol.serialize(ref calldata);
            creator.serialize(ref calldata);

            let (token_address, _) = deploy_syscall(class_hash, 0, calldata.span(), false).unwrap();

            let token_info = TokenInfo {
                token_address,
                token_type: 1,
                name: name.clone(),
                symbol: symbol.clone(),
                created_at: get_block_timestamp(),
            };

            self._add_token_to_creator(creator, token_info);
            self.factory_tokens.write(token_address, true);

            self.emit(TokenCreated { creator, token_address, token_type: 1, name, symbol });

            token_address
        }

        fn get_created_tokens(self: @ContractState, creator: ContractAddress) -> Array<TokenInfo> {
            let count = self.creator_token_count.read(creator);
            let mut tokens = array![];
            let mut i = 0;

            while i < count {
                let token_info = self.creator_token_by_index.read((creator, i));
                tokens.append(token_info);
                i += 1;
            }

            tokens
        }

        fn get_token_count(self: @ContractState, creator: ContractAddress) -> u32 {
            self.creator_token_count.read(creator)
        }

        fn get_total_tokens_created(self: @ContractState) -> u32 {
            self.total_tokens_created.read()
        }

        fn is_token_created_by_factory(
            self: @ContractState, token_address: ContractAddress,
        ) -> bool {
            self.factory_tokens.read(token_address)
        }

        fn get_all_tokens(self: @ContractState) -> Array<TokenInfo> {
            let total = self.total_tokens_created.read();
            let mut tokens = array![];
            let mut i = 0;
            while i < total {
                let token_info = self.token_by_global_index.read(i);
                tokens.append(token_info);
                i += 1;
            }
            tokens
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _add_token_to_creator(
            ref self: ContractState, creator: ContractAddress, token_info: TokenInfo,
        ) {
            let current_count = self.creator_token_count.read(creator);
            self.creator_token_by_index.write((creator, current_count), token_info.clone());

            self.creator_token_count.write(creator, current_count + 1);

            let total_count = self.total_tokens_created.read();
            self.token_by_global_index.write(total_count, token_info.clone());
            self.total_tokens_created.write(total_count + 1);
        }
    }
}
