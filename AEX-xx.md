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

A standard implementation of non-fungible tokens for the Aeternity ecosystem.

## Motivation

The following standard describes standard interfaces for non-fungible tokens. The proposal contains a primary interface and secondary interfaces for optional functionality that not everyone might need.

## Specification

```
contract interface NFT =
    /// Events.
    /// TransferEvent(_from, _to, _token_id)
    /// ApprovalEvent(_owner, _approved, _token_id)
    /// ApprovalForAllEvent(_owner, _operator, _approved)
    datatype event 
        = TransferEvent(indexed address, indexed address, indexed int)
        | ApprovalEvent(indexed address, indexed address, indexed int)
        | ApprovalForAllEvent(indexed address, indexed address, bool)

    stateful entrypoint mint : (address, int) => unit

    stateful entrypoint safe_mint : (address, int, string) => bool

    entrypoint balance_of : (address) => int

    entrypoint owner_of : (int) => option(address)
        
    stateful entrypoint safe_transfer_from_with_data : (address, address, int, string) => bool

    stateful entrypoint safe_transfer_from : (address, address, int) => bool

    stateful entrypoint transfer_from : (address, address, int) => unit

    stateful entrypoint approve : (address, int) => unit

    stateful entrypoint revoke_approval : (int) => unit

    stateful entrypoint set_approval_for_all : (address, bool) => unit

    entrypoint get_approved : (int) => option(address)

    entrypoint is_approved : (int, address) => bool

    entrypoint is_approved_for_all : (address, address) => bool

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

### NFT (Primary interface)

The design goal of the primary interface is to be as compatible with ERC-721 as possible, so that anyone who can work with ERC-721 can work with this interface. However, where Sophia offers a better way, performance and efficiency should prevail over compatibility.

`stateful entrypoint mint : (address, int) => unit`

Issues a new token to the provided address.

- @param _to is the address of the new token's owner
- @param _token_id is the id of the minted token
- @dev throws if already minted
- @dev Emits TransferEvent
  
`stateful entrypoint safe_mint : (address, int, string) => unit`

Issues a new token and calls the NFTReceiver implementation on the receiving contract. 
Does NOT throw if the call failes for ERC-721 compatibility reasons.

- @param _to is the address of the new token's owner
- @param _token_id is the id of the minted token
- @param _data is data that will be forwarded to contact recipients
- @dev throws if already minted
- @dev throws if the call to NFTReceiver implementation failed
- @dev Emits TransferEvent

`entrypoint balance_of : (address) => int`

Provides all tokens assigned to an owner.

- @param _owner is the address for whom to query the balance
- @return the number of tokens owned by `_owner` or 0

`entrypoint owner_of : (int) => option(address)`

Provides the owner of token.

- @param _token_id Token identifier
- @return Some(address) or None

`stateful entrypoint safe_transfer_from_with_data : (address, address, int, string) => unit`

Transfers the ownership of a token from one address to another address and calls the NFTReceiver implementation
on the receiving contract.

- @param _from The current owner of the token
- @param _to The new owner
- @param _token_id The token to transfer
- @param data Additional data sent in call to `_to`
- @dev Throws unless `msg.sender` is the current owner, an authorized operator, or the approved address for this NFT. 
- @dev Throws if `_from` is not the current owner. 
- @dev Throws if `_to` is the zero address. 
- @dev Throws if `_token_id` is not a valid token.
- @dev throws if the call to NFTReceiver implementation failed
- @dev Emits TransferEvent

`stateful entrypoint safe_transfer_from : (address, address, int) => unit`

Transfers the ownership of a token from one address to another address. Works identically to safe_transfer_from_with_data with that difference that the data parameter is set to an empty string.

- @param _from The current owner of the token
- @param _to The new owner
- @param _token_id The token to transfer
- @dev Throws unless `msg.sender` is the current owner, an authorized operator, or the approved address for this NFT. 
- @dev Throws if `_from` is not the current owner. 
- @dev Throws if `_to` is the zero address. 
- @dev Throws if `_token_id` is not a valid NFT.
- @dev throws if the call to NFTReceiver implementation failed
- @dev Emits TransferEvent

`stateful entrypoint transfer_from : (address, address, int) => unit` 

Transfers ownership of a token without any safety measures.
- @param _from The current owner of the token
- @param _to The new owner
- @param _token_id The NFT to transfer
- @dev Throws unless caller is the current owner, an authorized operator, or the approved address for this NFT. Throws if `_from` is not the current owner. Throws if _token_id` is not a valid token.
- @dev Emits TransferEvent

`stateful entrypoint approve : (address, int) => unit` 

Sets an approved address to interact on behalf of an owner for a token.

- @param _approved The new approved NFT controller
- @param _token_id The token to approve
- @dev The zero address indicates there is no approved address. Here for compatibility reasons. `revoke_approval` is a cleaner way to do this.
- @dev Throws unless caller is the current NFT owner, or an authorized operator of the current owner.
- @dev Emits ApprovalEvent

`stateful entrypoint revoke_approval : (int) => unit`

Revokes approval for the specified token.

- @param _token_id Token identifier
- @dev Throws unless caller is the current NFT owner, or an authorized operator of the current owner.
- @dev Emits ApprovalEvent

`stateful entrypoint set_approval_for_all : (address, bool) => unit`

Enables or disable approval for a manager (operator) to manage all of the caller's assets. 
Common is to allow multiple operators per owner.

- @param _operator Address to add to the set of authorized operators.
- @param _approved True if the operator is approved, false to revoke approval
- @dev Emits ApprovalForAllEvent. 

`entrypoint get_approved : (int) => option(address)`    

Provides the approved address for a token.

- @param _token_id The token to find the approved address for
- @dev Throws if `_token_id` is not a valid token
- @return The approved address for this token, or None if none is set
    
`entrypoint is_approved : (int, address) => bool`

Indicates whether the provided address is approved to transact for the provided token id.

- @param _token_id Token identifier
- @param _approved Potential approved address
- @dev Throws if `_token_id` is not a valid token

`entrypoint is_approved_for_all : (address, address) => bool`

Indicates wether an address is an authorized operator for another address.

- @param _owner The address that owns the tokens
- @param _operator The address to act on behalf of the owner
- @return True or false to indicate whether `_operator` is an approved operator or not
     
#### Events

```
datatype event 
        = TransferEvent(indexed address, indexed address, indexed int)
        | ApprovalEvent(indexed address, indexed address, indexed int)
        | ApprovalForAllEvent(indexed address, indexed address, bool)
```

##### TransferEvent
Parameters: from, to, token

Emitted after any form of transfers of tokens.

##### ApprovalEvent
Parameters: owner, approved, token_id

Emitted after approval of `approved` to transact on behalf of `owner` for `token_id`.

##### ApprovalForAllEvent
Parameters: owner, operator, approved

Emitted after a change in an operator's approval status. Indicates that `operator` is approved to transact on behalf of `owner` if `approved` is true. If `approved` is false then approval has been revoked. 

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
- @dev Emits TransferEvent
    

`stateful entrypoint safe_mint_with_token_data : (address, int, string, string, string) => unit`

Issues a new token with token data to the provided address and calls the NFTReceiver implementation on the receiving contract. 

- @param _to is the address of the new token's owner
- @param _token_id is the id of the minted token
- @param _token_data_type is the type of data the value represents, e.g. uri, object_id
- @param _token_data_value is the data's value
- @param _data is data that will be forwarded to contact recipients
- @dev throws if already minted
- @dev throws if the call to NFTReceiver implementation failed
- @dev Emits TransferEvent
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