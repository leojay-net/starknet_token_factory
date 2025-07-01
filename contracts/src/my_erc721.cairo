use starknet::ContractAddress;

#[starknet::interface]
pub trait IMyERC721<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, token_id: u256);
    fn burn(ref self: TContractState, token_id: u256);
    fn get_creator(self: @TContractState) -> ContractAddress;
    fn get_next_token_id(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod MyERC721 {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::ContractAddress;
    use starknet::storage::{ StoragePointerReadAccess, StoragePointerWriteAccess };

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // #[abi(embed_v0)]
    // impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        creator: ContractAddress,
        next_token_id: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        base_uri: ByteArray,
        owner: ContractAddress,
    ) {
        self.erc721.initializer(name, symbol, base_uri);
        self.ownable.initializer(owner);
        self.creator.write(owner);
        self.next_token_id.write(1);
    }

    #[abi(embed_v0)]
    impl MyERC721Impl of super::IMyERC721<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
            self.ownable.assert_only_owner();
            self.erc721.mint(to, token_id);

            let current_next = self.next_token_id.read();
            if token_id >= current_next {
                self.next_token_id.write(token_id + 1);
            }
        }
        
        fn burn(ref self: ContractState, token_id: u256) {
            self.ownable.assert_only_owner();
            self.erc721.burn(token_id);
        }
        
        fn get_creator(self: @ContractState) -> ContractAddress {
            self.creator.read()
        }
        
        fn get_next_token_id(self: @ContractState) -> u256 {
            self.next_token_id.read()
        }
    }
}