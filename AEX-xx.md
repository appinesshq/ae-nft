# AEX Non-Fungible Token Standard

```
AEX: TBD
Title: Non-Fungible Token Standard
Author: Arjan van Eersel <arjan@appiness.solutions> (@zkvonsnarkenstein)
License: ISC
Discussions-To: <URL>
Status: Draft
Type: Interface
Created: 2021-09-11
```

## Abstract

A standard implementation of non-fungible tokens for the Aeternity ecosystem. The design goal of the primary interface is to be as compatible with ERC-721 as possible, so that anyone who can work with ERC-721 can work with this interface. However, where Sophia offers a better way, performance and efficiency should prevail over compatibility.

There is no support for unsafe transactions. Therefore all transactions are ought to be safe.

## Motivation

The following standard describes standard interfaces for non-fungible tokens. The proposal contains a primary interface and secondary interfaces for optional functionality that not everyone might need. 

# Basic NFT

## Interface

```
contract interface NFT =
    datatype metadata_type = URL | IPFS | OBJECT_ID | MAP
    datatype metadata = Url(string) | Ipfs(string) | ObjectID(string) | Internal(map(string,string))

    record meta_info = 
        { name: string
        , symbol: string 
        , base_url: option(string)
        , metadata : metadata_type
        , token_data: map(int, metadata)}

    datatype event 
        = Transfer(indexed address, indexed address, indexed int)
        | Approval(indexed address, indexed address, indexed int)
        | ApprovalForAll(indexed address, indexed address, bool)

    entrypoint aexX_extensions() : list(string)

    entrypoint meta_info() : meta_info

    entrypoint metadata(int): option(metadata)

    stateful entrypoint mint : (address, option(string)) => int

    entrypoint balance : (address) => option(int)

    entrypoint owner : (int) => option(address)
        
    stateful transfer : (from address, to address, token int, data option(string)) => unit

    stateful entrypoint approve : (address, int) => unit

    stateful entrypoint approve_all : (address, bool) => unit

    stateful entrypoint revoke_approval : (int) => unit

    entrypoint get_approved : (int) => option(address)

    entrypoint is_approved : (int, address) => bool

    entrypoint is_approved_for_all : (address, address) => bool
```

## Methods

### aexX_extensions\(\)

This function **returns** a hardcoded list of all implemented extensions on the deployed contract.
X is to be replaced with the approriate number allocated to this AEX proposal. At this stage the number is unknown.

```sophia
entrypoint aex9_extensions() : list(string)
```

### meta_info\(\)

Returns meta information associated with the token contract.

```sophia
entrypoint meta_info() : meta_info
```

| return | type |
| :--- | :--- |
| meta_info | meta_info |

### meta_data\(\)

Returns meta data associated with a token. The function is a part of the basic interface, because metadata can be set in the constructor, as well as by implementing the Mintable extention.

```entrypoint metadata(id int): option(metadata)```

| parameter | type |
| :--- | :--- |
| id | int |

| return | type |
| :--- | :--- |
| data | option(metadata) |

### balance\(\)

Returns the account balance of another account with address `owner`, if the account exists. If the owner address is unknown to the contract `None` will be returned. Using `option` type as a return value allows us to determine if the account has balance of 0, more than 0, or the account has never had balance and is still unknown to the contract.

```sophia
entrypoint balance : (owner address) => int
```

| parameter | type |
| :--- | :--- |
| owner | address |

| return | type |
| :--- | :--- |
| balance | option(int) |

### owner\(\)

Returns the owner's address for the provided `token`, if the token is minted. If the token isn't minted `None` will be returned. 

```sophia
entrypoint owner : (token int) => option(address)
```

| parameter | type |
| :--- | :--- |
| token | int |

| return | type |
| :--- | :--- |
| owner | option(address) |

### transfer\(\)
Transfers `token` from the `from` address to the `to` address. Will invoke `NFTReceiver` if `to` is a contract receiver. If provided `data` will be submitted with the invocation of `NFTReceiver`. Emits the `Transfer` event.

Should throw if:
- `Call.caller` is not the current owner, an authorized operator or the approved address for this token;
- `from` isn't the current owner;
- `token` isn't a valid token;
- the invocation of `NFTReceiver` fails.


```sophia
stateful transfer : (from address, to address, token int, data option(string)) => unit
```

| parameter | type |
| :--- | :--- |
| from | address |
| to | address |
| token | int |
| data | option(string) |

### approve\(\)

Sets the `approved` address to interact on behalf of an owner for the `token`. Throws unless caller is the current NFT owner, or an authorized operator of the current owner. Emits the `Approval` event.

```sophia
stateful entrypoint approve : (approved address, token int) => unit
```

| parameter | type |
| :--- | :--- |
| approved | address |
| token | int |

### revoke_approval\(\)

Revokes approval for the specified `token`. Throws unless caller is the current NFT owner, or an authorized operator of the current owner. Emits the `Approval` event.

```sophia
stateful entrypoint revoke_approval : (int) => unit
```

| parameter | type |
| :--- | :--- |
| token | int |

### approve_all\(\)

Enables or disables approval for an `operator` to manage all of the caller's assets. If `enabled` is true the operator is approved, if `false` the approval is revoked. Emits the `ApprovalForAll` event.

```sophia
stateful entrypoint approve_all : (operator address, enabled bool) => unit
```

| parameter | type |
| :--- | :--- |
| operator | address |
| enabled | bool |

### get_approved\(\)

Returns the address approved to interact with the `token` or returns None if no approval has been set. Throws if `token` is an invalid token ID.

```sophia
entrypoint get_approved : (token int) => option(address)
``` 

| parameter | type |
| :--- | :--- |
| token | int |

| return | type |
| :--- | :--- |
| approved | option(address) |

### is_approved\(\)

Returns `true` if `approved` is approved to transact for `token`.

```sophia
entrypoint is_approved : (token int, approved address) => bool
``` 

| parameter | type |
| :--- | :--- |
| token | int |
| approved | address |

| return | type |
| :--- | :--- |
| approved | bool |
    
### is_approved_for_all\(\)

Returns `true` if `operator` is approved to commit transactions on behalf of `owner`.

Indicates wether an address is an authorized operator for another address.

```sophia
entrypoint is_approved_for_all : (owner address, operator address) => bool
``` 

| parameter | type |
| :--- | :--- |
| owner | address |
| approved | address |

| return | type |
| :--- | :--- |
| approved | bool |
     
## Events

```
datatype event 
        = Transfer(indexed address, indexed address, indexed int)
        | Approval(indexed address, indexed address, indexed int)
        | ApprovalForAll(indexed address, indexed address, bool)
```

### *Transfer*

This event MUST be triggered and emitted when tokens are transferred, including zero value transfers.

The event arguments should be as follows: `(from_account, to_account, token_id)`

```sophia
Transfer(indexed address, indexed address, indexed int)
```

| parameter | type |
| :--- | :--- |
| from_account | address |
| to_account | address |
| token_id | int |

### *Approval*

This event MUST be triggered and emitted upon approval, including revocation of approval.

The event arguments should be as follows: `(owner, approved, token_id)`

```sophia
Approval(indexed address, indexed address, indexed int)
```

| parameter | type |
| :--- | :--- |
| owner | address |
| approved | address |
| token_id | int |

## *ApprovalForAll*

This event MUST be triggered and emitted upon a change of operator status, including revocation of approval.

The event arguments should be as follows: `(owner, operator, approved)`

```sophia
ApprovalForAll(indexed address, indexed address, bool)
```

| parameter | type |
| :--- | :--- |
| owner | address |
| operator | address |
| approved | bool |

## Extension Mintable ("mintable")

### mint\(\)

Issues a new token to the provided address. If the `owner` is a contract, NFTReceiver will be called with `data` if provided.
Emits a Transfer event.
Throws if the call to NFTReceiver implementation failed (safe transfer). 

```sophia
stateful entrypoint mint : (owner address, token_data option(metadata), data option(string)) => int
```
| parameter | type | 
| :--- | :--- | 
| owner | address |
| token_data | option(metadata) |
| data  | option(string) | 

| return | type |
| :--- | :--- |
| token id | int |

## Extension Burnable ("burnable")

### burn\(\)

This function burns the token of the provided token id from `Call.caller`. Triggers the `Transfer` event.

```sophia
stateful entrypoint burn(token: int) : unit
```

| parameter | type |
| :--- | :--- |
| token | int |

## Extension Swappable ("swappable")

### swap\(\)

This function burns the whole balance of the `Call.caller` and stores the same amount in the `swapped` map. 

```sophia
stateful entrypoint swap() : unit
```

| parameter | type |
| :--- | :--- |
| value | int |

| return | type |
| :--- | :--- |
| () | unit |

### check_swap\(\)

This function returns the amount of tokens that were burned trough `swap` for the provided account. 

```sophia
stateful entrypoint check_swap(account: address) : int
```

| parameter | type |
| :--- | :--- |
| account | address |

| return | type |
| :--- | :--- |
| int | int |

### swapped\(\)

This function returns all of the swapped tokens that are stored in contract state. 

```sophia
stateful entrypoint swapped() : map(address, int)
```

| return | type |
| :--- | :--- |
| swapped | map(address, int) |

## Events

**Swap** - MUST trigger when tokens are swapped using the `swap` function.

The swap event arguments should be as follows: `(account,  value)`

```sophia
Swap(address, int)
```

| parameter | type |
| :--- | :--- |
| account| address |
| value | int |

## Extension Batch Transfer ("batch_transfer")

### batch_transfer\(\)

Transfer multiple tokens to an address.

```sophia
stateful entrypoint batch_transfer(to : address, tokens : list(int)) : unit
```

| parameter | type |
| :--- | :--- |
| to | address |
| tokens | list(int) |

# Receiver contract interface

## NFTReceiver

contract interface NFTReceiver = 
    entrypoint on_nft_received : (address, address, int, option(string)) => unit

### on_nft_received\(\)

Deals with receiving NFT tokens on behalf of a smart contract. Contracts receiving NFT tokens should implement this interface. Mint and transfer transactions will invoke the `on_nft_received` function.

```sofia
entrypoint on_nft_received : (address, address, int, option(string)) => unit
```
| parameter | type |
| :--- | :--- |
| from | address |
| to | address |
| token | int |
| data | option(string) |