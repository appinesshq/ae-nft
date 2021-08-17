# NFT contracts and tooling
This repo contains standard contracts and tooling for Non-Fungible Tokens.

The `NFT.aes` contract is made with the purpose to be as close as possible
to the ERC-721 standard. Anyone being able to work with these contracts should
be able to work with the contract on Aeternity as well.

## License

ISC License

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

## State

This repo is under heavy development. It's not recommended to use any of the 
provided code in a production environment or without a proper audit.

## Support
For support please use the [Aeternity Forum](https://forum.aeternity.com).
For bugs and feature requests please file an issue on this GitHub repo.

## How to use

N.B. Proper documentation will be provided once the project reaches a stable version.

### Deployment and initialization

Deploy the `NFT.aes` through your favorite SDK. The contract should be initialized with a `name` and `code`.

Example: `await contract.deploy(["My NFT", "MYN"]);`.

### Minting
There are two ways to mint a coin: 

Simple minting: `mint(_to: address, _tokenID: int)`. Requires the recipient's address and the tokenID that
will be minted.

Minting with metadata: `mintWithTokenData(_to: address, _tokenID: int, _tokenDataType: string, _tokenDataValue: string)`. 
Requires the recipient's address and the tokenID that will be minted. Additionally requires a type and value.

Metadata is kept simple by design. The idea is to store a pointer to where further data can be found.

Examples:

`mintWithTokenData("ak_2aJV4GK5YZXNRtyFF5i8yUHcFjS5NRLxpjxBKNHqE8Tfq4SYFa", 0, "uri", "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiirMJ8u2NLgmgszg13pYrDKEoip")`
`mintWithTokenData("ak_2aJV4GK5YZXNRtyFF5i8yUHcFjS5NRLxpjxBKNHqE8Tfq4SYFa", 0, "object_id", "123456")`