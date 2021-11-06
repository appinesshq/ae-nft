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
    /// Events.
    /// Transfer(from, to, token_id)
    /// Approval(owner, approved, token_id)
    /// ApprovalForAll(owner, operator, approved)
    datatype event 
        = Transfer(indexed address, indexed address, indexed int)
        | Approval(indexed address, indexed address, indexed int)
        | ApprovalForAll(indexed address, indexed address, bool)

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

### mint\(\)

Issues a new token to the provided address. If the `owner` is a contract, NFTReceiver will be called with `data` if provided.
Emits a Transfer event.
Throws if the call to NFTReceiver implementation failed (safe transfer). 

```sophia
stateful entrypoint mint : (owner address, data option(string)) => int
```
| parameter | type | 
| :--- | :--- | 
| owner | address |
| data  | string | 

| return | type |
| :--- | :--- |
| token id | int |

### balance\(\)

```sophia
entrypoint balance : (owner address) => int
```

Returns the account balance of another account with address `owner`, if the account exists. If the owner address is unknown to the contract `None` will be returned. Using `option` type as a return value allows us to determine if the account has balance of 0, more than 0, or the account has never had balance and is still unknown to the contract.

| parameter | type |
| :--- | :--- |
| owner | address |

| return | type |
| :--- | :--- |
| balance | option(int) |

### owner\(\)

```sophia
entrypoint owner : (token int) => option(address)
```
Returns the owner's address for the provided `token`, if the token is minted. If the token isn't minted `None` will be returned. 

| parameter | type |
| :--- | :--- |
| token | int |

| return | type |
| :--- | :--- |
| owner | option(address) |

### transfer\(\)

```sophia
stateful transfer : (from address, to address, token int, data option(string)) => unit
```

Transfers `token` from the `from` address to the `to` address. Will invoke `NFTReceiver` if `to` is a contract receiver. If provided `data` will be submitted with the invocation of `NFTReceiver`. Emits the `Transfer` event.

Should throw if:
- `Call.caller` is not the current owner, an authorized operator or the approved address for this token;
- `from` isn't the current owner;
- `token` isn't a valid token;
- the invocation of `NFTReceiver` fails.

| parameter | type |
| :--- | :--- |
| from | address |
| to | address |
| token | int |
| data | option(string) |

### approve\(\)

```sophia
stateful entrypoint approve : (approved address, token int) => unit
```

Sets the `approved` address to interact on behalf of an owner for the `token`. Throws unless caller is the current NFT owner, or an authorized operator of the current owner. Emits the `Approval` event.

| parameter | type |
| :--- | :--- |
| approved | address |
| token | int |

### revoke_approval\(\)

```sophia
stateful entrypoint revoke_approval : (int) => unit
```

Revokes approval for the specified `token`. Throws unless caller is the current NFT owner, or an authorized operator of the current owner. Emits the `Approval` event.

| parameter | type |
| :--- | :--- |
| token | int |

### approve_all\(\)

```sophia
stateful entrypoint approve_all : (operator address, enabled bool) => unit
```

Enables or disables approval for an `operator` to manage all of the caller's assets. If `enabled` is true the operator is approved, if `false` the approval is revoked. Emits the `ApprovalForAll` event.

| parameter | type |
| :--- | :--- |
| operator | address |
| enabled | bool |

### get_approved\(\)

```sophia
entrypoint get_approved : (token int) => option(address)
``` 

Returns the address approved to interact with the `token` or returns None if no approval has been set. Throws if `token` is an invalid token ID.

| parameter | type |
| :--- | :--- |
| token | int |

| return | type |
| :--- | :--- |
| approved | option(address) |

### is_approved\(\)

```sophia
entrypoint is_approved : (token int, approved address) => bool
``` 

Returns `true` if `approved` is approved to transact for `token`.

| parameter | type |
| :--- | :--- |
| token | int |
| approved | address |

| return | type |
| :--- | :--- |
| approved | bool |
    
### is_approved_for_all\(\)

```sophia
entrypoint is_approved_for_all : (owner address, operator address) => bool
``` 

Returns `true` if `operator` is approved to commit transactions on behalf of `owner`.

Indicates wether an address is an authorized operator for another address.

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

```sophia
Transfer(indexed address, indexed address, indexed int)
```

This event MUST be triggered and emitted when tokens are transferred, including zero value transfers.

The event arguments should be as follows: `(from_account, to_account, token_id)`

| parameter | type |
| :--- | :--- |
| from_account | address |
| to_account | address |
| token_id | int |

### *Approval*

```sophia
Approval(indexed address, indexed address, indexed int)
```

This event MUST be triggered and emitted upon approval, including revocation of approval.

The event arguments should be as follows: `(owner, approved, token_id)`

| parameter | type |
| :--- | :--- |
| owner | address |
| approved | address |
| token_id | int |

## *ApprovalForAll*
```sophia
ApprovalForAll(indexed address, indexed address, bool)
```
This event MUST be triggered and emitted upon a change of operator status, including revocation of approval.

The event arguments should be as follows: `(owner, operator, approved)`

| parameter | type |
| :--- | :--- |
| owner | address |
| operator | address |
| approved | bool |

=============== TODO ===============

### ControlledMinting (Secondary interface)
Option to control who may mint tokens.

`stateful entrypoint set_minter : (address) => unit`

Set an address which is allowed to mint new tokens.

- @param _minter Address of the new minter
- @dev Throws if Caller isn't the contract's owner

`stateful entrypoint remove_minter : (address) => unit`

Removes a minter from the list of allowed minters.

- @param _minter Address of the minter
- @dev Throws if Caller isn't the contract's owner or the minter

`entrypoint is_minter : (address) => bool`

Indicates whether the provided `address` is listed as a minter.

- @param minter Address of a potential minter
- @return `true` if the minter is listed, `false` if not

### Burnable (Secondary interface)
`stateful entrypoint burn : (int) => unit`

Burn a token.

@param _token_id Token identifier

### WithTokenData (Secondary interface)
The idea of token data is to store relevant data on a per token basis, this could be a URI to a digital object or 
an identifier of a physical object. Token data should be consize, for this purpose it's a tuple consisting of the data type (for example uri)and data value.

Allthough the user should be free to implement own types, this AEX defines common types.

`entrypoint get_token_data : (int) => option((string * string))`

Provides the token data for the requested token (if any).

- @param _token_id is the token id for which the uri is requested
- @return Some((type, value)) or None if no uri has been set for this token

`stateful entrypoint mint_with_token_data : (address, int, string, string) => unit`  

Issues a new token with token data to the provided address.

- @param _to is the address of the new token's owner
- @param _token_id is the id of the minted token
- @param _token_data_type is the type of data the value represents, e.g. uri, object_id
- @param _token_data_value is the data's value
- @dev throws if already minted
- @dev Emits Transfer
    

`stateful entrypoint safe_mint_with_token_data : (address, int, string, string, string) => unit`

Issues a new token with token data to the provided address and calls the NFTReceiver implementation on the receiving contract. 

- @param _to is the address of the new token's owner
- @param _token_id is the id of the minted token
- @param _token_data_type is the type of data the value represents, e.g. uri, object_id
- @param _token_data_value is the data's value
- @param _data is data that will be forwarded to contact recipients
- @dev throws if already minted
- @dev throws if the call to NFTReceiver implementation failed
- @dev Emits Transfer
- @return true if the call to the NFTReceiver was succesfull and false if the call failed.

#### Common data types
- uri: Unified Resource Identifier to a digital object, for example: http, ipfs, etc.
- uoid: Unique Object IDentifier of a physical object.

### WithMetaInfo (Secondary interface)

```
contract interface WithMetaInfo = 
    record meta_info = 
    { name: string
    , symbol: string }

    // meta_info is a getter for meta info.
    entrypoint meta_info : () => meta_info
```

Part of this AEX specification to ensure compatibility with the meta info structure of AEX-9 Fungible tokens. Perhaps this should be an AEX of its own.

### NFTReceiver (Receiver contract interface)

`entrypoint on_nft_received : (address, address, int, string) => unit`

Contracts receiving NFT tokens should implement this interface. Safe functions will invoke the `on_nft_received` function.

- @param _from is the current owner of the token. Will be the NFT contract's address on newly minted tokens.
- @param _to is the address of the new token's owner
- @param _token_id is the token identifier
- @param _data is data passed on from the calling function

## Extensions

contract interface ControlledMinting =

    stateful entrypoint set_minter : (address) => unit

    stateful entrypoint remove_minter : (address) => unit

    entrypoint is_minter : (address) => bool

contract interface Burnable = 
    stateful entrypoint burn : (int) => unit

contract interface WithTokenData = 
    entrypoint get_token_data : (int) => option((string * string))

    stateful entrypoint mint_with_token_data : (address, int, string, string) => unit

    stateful entrypoint safe_mint_with_token_data : (address, int, string, string, string) => unit

contract interface NFTReceiver = 
    entrypoint on_nft_received : (address, address, int, string) => unit
```