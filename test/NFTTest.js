const chai = require('chai');
const assert = chai.assert;

const { Universal, MemoryAccount, Node } = require('@aeternity/aepp-sdk');

const NETWORKS = require('../config/network.json');
const NETWORK_NAME = "local";

const {defaultWallets: WALLETS} = require('../config/wallets.json');

const contractUtils = require('../utils/contract-utils');
const CONTRACT_SOURCE = './contracts/NFT.aes';
const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

describe('NFT Contract', () => {
    const ownerKeypair = WALLETS[0]
    const otherKeypair = WALLETS[1]

    let contract;
    let exampleContract;
    let otherClient;
    let contractContent;

    before(async () => {
        const node = await Node({ url: NETWORKS[NETWORK_NAME].nodeUrl });
        const client = await Universal({
            nodes: [
              { name: NETWORK_NAME, instance: node },
            ],
            compilerUrl: NETWORKS[NETWORK_NAME].compilerUrl,
            accounts: [MemoryAccount({ keypair: ownerKeypair })],
            address: ownerKeypair.publicKey
        });

        otherClient = await Universal({
            nodes: [
              { name: NETWORK_NAME, instance: node },
            ],
            compilerUrl: NETWORKS[NETWORK_NAME].compilerUrl,
            accounts: [MemoryAccount({ keypair: otherKeypair })],
            address: otherKeypair.publicKey
        });

        try {
            // a filesystem object must be passed to the compiler if the contract uses custom includes
            const filesystem = contractUtils.getFilesystem(CONTRACT_SOURCE);
            // get content of contract
            contractContent = contractUtils.getContractContent(CONTRACT_SOURCE);
            // initialize the contract instance
            contract = await client.getContractInstance(contractContent, {filesystem});
        } catch(err) {
            console.error(err);
            assert.fail('Could not initialize contract instance');
        }

        try {
            // a filesystem object must be passed to the compiler if the contract uses custom includes
            const filesystem = contractUtils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);
            // get content of contract
            const exampleContractContent = contractUtils.getContractContent(EXAMPLE_CONTRACT_SOURCE);
            // initialize the contract instance
            exampleContract = await client.getContractInstance(exampleContractContent, {filesystem});
        } catch(err) {
            console.error(err);
            assert.fail('Could not initialize contract instance');
        }
    });

    it('Should deploy NFT Contract', async () => {
        await contract.deploy(["Test NFT", "TST"]);
        //TODO Check metadata
    });

    it('Should mint only once', async () => {
        await contract.methods.mint(ownerKeypair.publicKey, 0);
        try {
            await assert.isRejected(await contract.methods.mint(ownerKeypair.publicKey, 0));
            assert.fail('second minting of same tokenID did not fail');
        } catch(err) {
            assert.include(err.message, 'Already minted', 'expected error message not found');
        }
    });

    it('Should return the owner', async () => {
        const owner = (await contract.methods.owner_of(0)).decodedResult;
        assert(owner == ownerKeypair.publicKey, 'Invalid owner');
    });

    it('Should return the balance', async () => {
        const b = (await contract.methods.balance_of(ownerKeypair.publicKey)).decodedResult;
        assert(b == 1, 'Incorrect balance');
    });

    it('Should transfer a token and update the balances', async () => {
        await contract.methods.transfer_from(ownerKeypair.publicKey, otherKeypair.publicKey, 0);

        const b1 = (await contract.methods.balance_of(ownerKeypair.publicKey)).decodedResult;
        assert(b1 == 0, 'Incorrect balance');

        const b2 = (await contract.methods.balance_of(otherKeypair.publicKey)).decodedResult;
        assert(b2 == 1, 'Incorrect balance');

    });

    it('Should transfer a token by approval and update the balances', async () => {
        const c = await otherClient.getContractInstance(contractContent, {contractAddress: contract.deployInfo.address });
        await c.methods.approve(ownerKeypair.publicKey, 0);
       
        const approvedAddress = (await contract.methods.get_approved(0)).decodedResult;
        assert(approvedAddress == ownerKeypair.publicKey, 'approve failed')

        await contract.methods.transfer_from(otherKeypair.publicKey, ownerKeypair.publicKey, 0);

        const b1 = (await contract.methods.balance_of(ownerKeypair.publicKey)).decodedResult;
        assert(b1 == 1, 'Incorrect balance');

        const b2 = (await contract.methods.balance_of(otherKeypair.publicKey)).decodedResult;
        assert(b2 == 0, 'Incorrect balance');

    });

    it('Should transfer a token by operator and update the balances', async () => {
        await contract.methods.set_approval_for_all(otherKeypair.publicKey, true);

        const isApproved = (await contract.methods.is_approved_for_all(ownerKeypair.publicKey, otherKeypair.publicKey)).decodedResult
        assert(isApproved, 'set_approval_for_all failed')

        const c = await otherClient.getContractInstance(contractContent, {contractAddress: contract.deployInfo.address });
        await c.methods.transfer_from(ownerKeypair.publicKey, otherKeypair.publicKey, 0);

        // const b1 = (await contract.methods.balance_of(ownerKeypair.publicKey)).decodedResult;
        // assert(b1 == 0, 'Incorrect balance');

        // const b2 = (await contract.methods.balance_of(otherKeypair.publicKey)).decodedResult;
        // assert(b2 == 1, 'Incorrect balance');

    });

    it('Should burn a token and update the balances', async () => {
        const c = await otherClient.getContractInstance(contractContent, {contractAddress: contract.deployInfo.address });
        await c.methods.burn(0);

        const b = (await c.methods.balance_of(otherKeypair.publicKey)).decodedResult;
        assert(b == 0, 'Incorrect balance');
    });

    it('Should deploy Example Receiver Contract', async () => {
        await exampleContract.deploy([]);
        // console.log(exampleContract.deployInfo.address);
    });

    it('Should do safe transfer to example contract', async () => {
        await contract.methods.mint(ownerKeypair.publicKey, 1);

        // This is needed to prevent the call from failing. The call can't be made with
        // a ct_ address.
        const contract_address = "ak" + exampleContract.deployInfo.address.slice(2);
        await contract.methods.safe_transfer_from(ownerKeypair.publicKey, contract_address, 1);
    });

});