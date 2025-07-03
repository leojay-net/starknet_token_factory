use starknet::ContractAddress;

#[starknet::interface]
pub trait IMyERC721<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, token_uri: ByteArray);
    fn mint_with_id(ref self: TContractState, to: ContractAddress, token_id: u256, token_uri: ByteArray);
    fn burn(ref self: TContractState, token_id: u256);
    fn set_token_uri(ref self: TContractState, token_id: u256, token_uri: ByteArray);
    fn get_creator(self: @TContractState) -> ContractAddress;
    fn get_next_token_id(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod MyERC721 {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::ContractAddress;
    use starknet::storage::{ 
        Map, StorageMapReadAccess, StorageMapWriteAccess,
        StoragePointerReadAccess, StoragePointerWriteAccess 
    };

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // #[abi(embed_v0)]
    // impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

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
        token_uris: Map<u256, ByteArray>,
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
        owner: ContractAddress,
    ) {
        self.erc721.initializer(name, symbol, ""); 
        self.ownable.initializer(owner);
        self.creator.write(owner);
        self.next_token_id.write(1);
    }

    #[abi(embed_v0)]
    impl MyERC721Impl of super::IMyERC721<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, token_uri: ByteArray) {
            self.ownable.assert_only_owner();
            let token_id = self.next_token_id.read();
            self.erc721.mint(to, token_id);
            self.token_uris.write(token_id, token_uri);
            self.next_token_id.write(token_id + 1);
        }

        fn mint_with_id(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: ByteArray) {
            self.ownable.assert_only_owner();
            self.erc721.mint(to, token_id);
            self.token_uris.write(token_id, token_uri);

            let current_next = self.next_token_id.read();
            if token_id >= current_next {
                self.next_token_id.write(token_id + 1);
            }
        }
        
        fn burn(ref self: ContractState, token_id: u256) {
            self.ownable.assert_only_owner();
            self.erc721.burn(token_id);
            self.token_uris.write(token_id, "");
        }

        fn set_token_uri(ref self: ContractState, token_id: u256, token_uri: ByteArray) {
            self.ownable.assert_only_owner();
            self.erc721.owner_of(token_id);
            self.token_uris.write(token_id, token_uri);
        }
        
        fn get_creator(self: @ContractState) -> ContractAddress {
            self.creator.read()
        }
        
        fn get_next_token_id(self: @ContractState) -> u256 {
            self.next_token_id.read()
        }
    }

    #[abi(embed_v0)]
    impl ERC721ABIImpl of openzeppelin::token::erc721::interface::ERC721ABI<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            self.erc721.owner_of(token_id);
            self.token_uris.read(token_id)
        }
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.erc721.balance_of(account)
        }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            self.erc721.owner_of(token_id)
        }

        fn safe_transfer_from(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) {
            self.erc721.safe_transfer_from(from, to, token_id, data);
        }

        fn transfer_from(ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256) {
            self.erc721.transfer_from(from, to, token_id);
        }
        fn approve(ref self: ContractState, to: ContractAddress, token_id: u256){
            self.erc721.approve(to, token_id);
        }
        fn set_approval_for_all(ref self: ContractState, operator: ContractAddress, approved: bool){
            self.erc721.set_approval_for_all(operator, approved);
        }
        fn get_approved(self: @ContractState, token_id: u256) -> ContractAddress {
            self.erc721.get_approved(token_id)
        }
        fn is_approved_for_all(
            self: @ContractState, owner: ContractAddress, operator: ContractAddress,
        ) -> bool {
            self.erc721.is_approved_for_all(owner, operator)
        }

        fn supports_interface(self: @ContractState, interface_id: felt252) -> bool {
            self.erc721.supports_interface(interface_id)
        }


        fn balanceOf(self: @ContractState, account: ContractAddress) -> u256 {
            self.erc721.balance_of(account)
        }
        fn ownerOf(self: @ContractState, tokenId: u256) -> ContractAddress {
            self.erc721.owner_of(tokenId)
        }
        fn safeTransferFrom(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            tokenId: u256,
            data: Span<felt252>,
        ) {
            self.erc721.safe_transfer_from(from, to, tokenId, data);
        }
        fn transferFrom(ref self: ContractState, from: ContractAddress, to: ContractAddress, tokenId: u256) {
            self.erc721.transfer_from(from, to, tokenId);
        }
        fn setApprovalForAll(ref self: ContractState, operator: ContractAddress, approved: bool) {
            self.erc721.set_approval_for_all(operator, approved);
        }
        fn getApproved(self: @ContractState, tokenId: u256) -> ContractAddress {
            self.erc721.get_approved(tokenId)
        }
        fn isApprovedForAll(self: @ContractState, owner: ContractAddress, operator: ContractAddress) -> bool {
            self.erc721.is_approved_for_all(owner, operator)
        }

        fn tokenURI(self: @ContractState, tokenId: u256) -> ByteArray {
            self.erc721.owner_of(tokenId);
            self.token_uris.read(tokenId)
        }
    }

}