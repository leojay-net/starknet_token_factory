use starknet::ContractAddress;


#[starknet::interface]
pub trait IMyERC20<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, from: ContractAddress, amount: u256);
    fn get_creator(self: @TContractState) -> ContractAddress;
    fn set_decimals(ref self: TContractState, new_decimals: u8);
    fn get_decimals(self: @TContractState) -> u8;
}

#[starknet::contract]
pub mod MyERC20 {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin::token::erc20::interface::IERC20Mixin;
    use starknet::ContractAddress;
    use starknet::storage::{ StoragePointerReadAccess, StoragePointerWriteAccess };
    

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        creator: ContractAddress,
        decimals: u8,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        initial_supply: u256,
        owner: ContractAddress,
    ) {
        self.erc20.initializer(name, symbol);
        self.ownable.initializer(owner);
        self.creator.write(owner);
        self.decimals.write(decimals);
        
        if initial_supply > 0 {
            self.erc20.mint(owner, initial_supply);
        }
    }

    #[abi(embed_v0)]
    impl MyERC20Impl of super::IMyERC20<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            self.ownable.assert_only_owner();
            self.erc20.mint(to, amount);
        }
        
        fn burn(ref self: ContractState, from: ContractAddress, amount: u256) {
            self.ownable.assert_only_owner();
            self.erc20.burn(from, amount);
        }
        
        fn get_creator(self: @ContractState) -> ContractAddress {
            self.creator.read()
        }
        
        fn set_decimals(ref self: ContractState, new_decimals: u8) {
            self.ownable.assert_only_owner();
            self.decimals.write(new_decimals);
        }
        
        fn get_decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }
    }

    #[abi(embed_v0)]
    impl ERC20 of IERC20Mixin<ContractState> {
        fn total_supply(self: @ContractState) -> u256 {
            self.erc20.total_supply()
        }

        fn totalSupply(self: @ContractState) -> u256 {
            self.erc20.total_supply()
        }
        
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.erc20.balance_of(account)
        }

        fn balanceOf(self: @ContractState, account: ContractAddress) -> u256 {
            self.erc20.balance_of(account)
        }
        
        fn allowance(self: @ContractState, owner: ContractAddress, spender: ContractAddress) -> u256 {
            self.erc20.allowance(owner, spender)
        }
        
        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            self.erc20.transfer(recipient, amount)
        }
        
        fn transfer_from(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
            self.erc20.transfer_from(sender, recipient, amount)
        }

        fn transferFrom(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
            self.erc20.transfer_from(sender, recipient, amount)
        }
        
        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            self.erc20.approve(spender, amount)
        }
        
        fn name(self: @ContractState) -> ByteArray {
            self.erc20.name()
        }
        
        fn symbol(self: @ContractState) -> ByteArray {
            self.erc20.symbol()
        }
        
        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }

        
    }
}
