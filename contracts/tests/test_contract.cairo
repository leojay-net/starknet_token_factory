use starknet::{ContractAddress, contract_address_const};
// use starknet::class_hash::ClassHash;

use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, 
    stop_cheat_caller_address, spy_events, EventSpyAssertionsTrait, EventSpy};

use contracts::token_factory::{ITokenFactoryDispatcher, ITokenFactoryDispatcherTrait};
use contracts::my_erc20::{IMyERC20Dispatcher, IMyERC20DispatcherTrait};
use contracts::my_erc721::{IMyERC721Dispatcher, IMyERC721DispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
use openzeppelin::token::erc721::interface::{ERC721ABIDispatcher, ERC721ABIDispatcherTrait};

fn OWNER() -> ContractAddress {
    contract_address_const::<'owner'>()
}

fn USER1() -> ContractAddress {
    contract_address_const::<'user1'>()
}

fn USER2() -> ContractAddress {
    contract_address_const::<'user2'>()
}

fn deploy_contract(name: ByteArray, args: Array<felt252>) -> ContractAddress {
    let contract = declare(name).unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@args).unwrap();
    contract_address
}

fn deploy_token_factory() -> ContractAddress {
    let erc20_class_hash = declare("MyERC20").unwrap().contract_class().class_hash;
    let erc721_class_hash = declare("MyERC721").unwrap().contract_class().class_hash;
    
    let mut constructor_args = array![];
    constructor_args.append((*erc20_class_hash).into());
    constructor_args.append((*erc721_class_hash).into());

    deploy_contract("TokenFactory", constructor_args)
}

fn setup_factory() -> ITokenFactoryDispatcher {
    let _factory_address = deploy_token_factory();
    ITokenFactoryDispatcher { contract_address: _factory_address }
}

// UNIT TESTS

#[test]
fn test_constructor() {
    let factory = setup_factory();

    // Test that factory is deployed correctly
    assert!(factory.get_total_tokens_created() == 0, "Initial count should be 0");
    assert!(factory.get_token_count(OWNER()) == 0, "Owner count should be 0");
}

#[test]
fn test_create_erc20_token() {
    let factory = setup_factory();
    let mut spy = spy_events();

    start_cheat_caller_address(factory.contract_address, OWNER());

    let token_address = factory
        .create_erc20(
            "Test Token", "TEST", 18, 1000000000000000000000
        );

    stop_cheat_caller_address(factory.contract_address);

    let erc20_token = IERC20MixinDispatcher { contract_address: token_address };
    assert!(erc20_token.name() == "Test Token", "Wrong token name");
    assert!(erc20_token.symbol() == "TEST", "Wrong token symbol");
    assert!(erc20_token.decimals() == 18, "Wrong decimals");
    assert!(erc20_token.total_supply() == 1000000000000000000000, "Wrong total supply");
    assert!(erc20_token.balance_of(OWNER()) == 1000000000000000000000, "Wrong owner balance");

    assert!(factory.get_total_tokens_created() == 1, "Total count should be 1");
    assert!(factory.get_token_count(OWNER()) == 1, "Owner count should be 1");
    assert!(factory.is_token_created_by_factory(token_address), "Token should be tracked");

    let created_tokens = factory.get_created_tokens(OWNER());
    assert!(created_tokens.len() == 1, "Should have 1 token");

    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
                    contracts::token_factory::TokenFactory::Event::TokenCreated(
                        contracts::token_factory::TokenFactory::TokenCreated {
                            creator: OWNER(),
                            token_address,
                            token_type: 0,
                            name: "Test Token",
                            symbol: "TEST",
                        },
                    ),
                ),
            ],
        );
}

#[test]
fn test_create_erc721_token() {
    let factory = setup_factory();
    let mut spy = spy_events();

    start_cheat_caller_address(factory.contract_address, OWNER());

    let token_address = factory
        .create_erc721("Test NFT", "TNFT", "https://api.example.com/metadata/");

    stop_cheat_caller_address(factory.contract_address);

    let erc721_token = ERC721ABIDispatcher { contract_address: token_address };
    assert!(erc721_token.name() == "Test NFT", "Wrong token name");
    assert!(erc721_token.symbol() == "TNFT", "Wrong token symbol");
    // assert!(erc721_token.token_uri() == "https://api.example.com/metadata/", "Wrong base URI");
    assert!(factory.get_total_tokens_created() == 1, "Total count should be 1");
    assert!(factory.get_token_count(OWNER()) == 1, "Owner count should be 1");
    assert!(factory.is_token_created_by_factory(token_address), "Token should be tracked");

    let created_tokens = factory.get_created_tokens(OWNER());
    assert!(created_tokens.len() == 1, "Should have 1 token");

    // Verify event emission
    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
                    contracts::token_factory::TokenFactory::Event::TokenCreated(
                        contracts::token_factory::TokenFactory::TokenCreated {
                            creator: OWNER(),
                            token_address,
                            token_type: 1,
                            name: "Test NFT",
                            symbol: "TNFT",
                        },
                    ),
                ),
            ],
        );
}

#[test]
fn test_multiple_users_create_tokens() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, USER1());
    let user1_erc20 = factory.create_erc20("User1 Token", "U1T", 18, 1000000000000000000000);
    let user1_erc721 = factory.create_erc721("User1 NFT", "U1N", "https://user1.com/");
    stop_cheat_caller_address(factory.contract_address);

    start_cheat_caller_address(factory.contract_address, USER2());
    let user2_erc20 = factory.create_erc20("User2 Token", "U2T", 6, 500000000);
    stop_cheat_caller_address(factory.contract_address);

    assert!(factory.get_total_tokens_created() == 3, "Total should be 3");
    assert!(factory.get_token_count(USER1()) == 2, "User1 should have 2");
    assert!(factory.get_token_count(USER2()) == 1, "User2 should have 1");
    assert!(factory.get_token_count(OWNER()) == 0, "Owner should have 0");

    assert!(factory.is_token_created_by_factory(user1_erc20), "User1 ERC20 should be tracked");
    assert!(factory.is_token_created_by_factory(user1_erc721), "User1 ERC721 should be tracked");
    assert!(factory.is_token_created_by_factory(user2_erc20), "User2 ERC20 should be tracked");

    let user1_tokens = factory.get_created_tokens(USER1());
    assert!(user1_tokens.len() == 2, "User1 should have 2 tokens");

    let user2_tokens = factory.get_created_tokens(USER2());
    assert!(user2_tokens.len() == 1, "User2 should have 1 token");
}

#[test]
fn test_erc20_mint_and_burn() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let token_address = factory.create_erc20("Mintable Token", "MINT", 18, 0);
    stop_cheat_caller_address(factory.contract_address);

    let erc20_token = IERC20MixinDispatcher { contract_address: token_address };
    let my_erc20_token = IMyERC20Dispatcher { contract_address: token_address };

    assert!(erc20_token.total_supply() == 0, "Initial supply should be 0");

    start_cheat_caller_address(token_address, OWNER());
    my_erc20_token.mint(USER1(), 1000000000000000000000);
    stop_cheat_caller_address(token_address);

    assert!(erc20_token.total_supply() == 1000000000000000000000, "Total supply should be 1000");
    assert!(
        erc20_token.balance_of(USER1()) == 1000000000000000000000, "User1 balance should be 1000",
    );

    // Only owner can burn
    start_cheat_caller_address(token_address, OWNER());
    my_erc20_token.burn(USER1(), 500000000000000000000);
    stop_cheat_caller_address(token_address);

    assert!(erc20_token.total_supply() == 500000000000000000000, "Total supply should be 500");
    assert!(erc20_token.balance_of(USER1()) == 500000000000000000000, "User1 balance should be 500");
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_erc20_mint_unauthorized() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let token_address = factory.create_erc20("Test Token", "TEST", 18, 0);
    stop_cheat_caller_address(factory.contract_address);

    let my_erc20_token = IMyERC20Dispatcher { contract_address: token_address };

    start_cheat_caller_address(token_address, USER1());
    my_erc20_token.mint(USER1(), 1000000000000000000000);
}

#[test]
fn test_erc721_mint_and_burn() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let token_address = factory.create_erc721("Test NFT", "TNFT", "https://api.test.com/");
    stop_cheat_caller_address(factory.contract_address);

    let erc721_token = ERC721ABIDispatcher { contract_address: token_address };
    let my_erc721_token = IMyERC721Dispatcher { contract_address: token_address };

    start_cheat_caller_address(token_address, OWNER());
    my_erc721_token.mint(USER1(), 1);
    my_erc721_token.mint(USER1(), 2);
    stop_cheat_caller_address(token_address);

    assert!(erc721_token.owner_of(1) == USER1(), "User1 should own token 1");
    assert!(erc721_token.owner_of(2) == USER1(), "User1 should own token 2");
    assert!(erc721_token.balance_of(USER1()) == 2, "User1 should have 2 tokens");

    start_cheat_caller_address(token_address, OWNER());
    my_erc721_token.burn(1);
    stop_cheat_caller_address(token_address);

    assert!(erc721_token.balance_of(USER1()) == 1, "User1 should have 1 token after burn");
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_erc721_mint_unauthorized() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let token_address = factory.create_erc721("Test NFT", "TNFT", "https://api.test.com/");
    stop_cheat_caller_address(factory.contract_address);

    let my_erc721_token = IMyERC721Dispatcher { contract_address: token_address };

    start_cheat_caller_address(token_address, USER1());
    my_erc721_token.mint(USER1(), 1);
}

#[test]
fn test_token_creator_verification() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let erc20_address = factory.create_erc20("Owner Token", "OWN", 18, 1000000000000000000000);
    stop_cheat_caller_address(factory.contract_address);

    start_cheat_caller_address(factory.contract_address, USER1());
    let erc721_address = factory.create_erc721("User NFT", "UNFT", "https://user.com/");
    stop_cheat_caller_address(factory.contract_address);

    let erc20_token = IMyERC20Dispatcher { contract_address: erc20_address };
    let erc721_token = IMyERC721Dispatcher { contract_address: erc721_address };

    assert!(erc20_token.get_creator() == OWNER(), "ERC20 creator should be OWNER");
    assert!(erc721_token.get_creator() == USER1(), "ERC721 creator should be USER1");
}

#[test]
fn test_dynamic_decimals() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let token_address = factory.create_erc20("Dynamic Token", "DYN", 18, 1000000000000000000000);
    stop_cheat_caller_address(factory.contract_address);

    let erc20_token = IERC20MixinDispatcher { contract_address: token_address };
    let my_erc20_token = IMyERC20Dispatcher { contract_address: token_address };

    assert(erc20_token.decimals() == 18, 'Initial decimals should be 18');
    assert(my_erc20_token.get_decimals() == 18, 'Get decimals should be 18');

    start_cheat_caller_address(token_address, OWNER());
    my_erc20_token.set_decimals(6);
    stop_cheat_caller_address(token_address);

    assert(erc20_token.decimals() == 6, 'Decimals should be 6');
    assert(my_erc20_token.get_decimals() == 6, 'Get decimals should be 6');

    start_cheat_caller_address(token_address, OWNER());
    my_erc20_token.set_decimals(0);
    stop_cheat_caller_address(token_address);

    assert(erc20_token.decimals() == 0, 'Decimals should be 0');
    assert(my_erc20_token.get_decimals() == 0, 'Get decimals should be 0');
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_set_decimals_unauthorized() {
    let factory = setup_factory();

    start_cheat_caller_address(factory.contract_address, OWNER());
    let token_address = factory.create_erc20("Test Token", "TEST", 18, 1000000000000000000000);
    stop_cheat_caller_address(factory.contract_address);

    let my_erc20_token = IMyERC20Dispatcher { contract_address: token_address };

    start_cheat_caller_address(token_address, USER1());
    my_erc20_token.set_decimals(6);
}