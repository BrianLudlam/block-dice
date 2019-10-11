# Block Dice

Block Dice is a smart contract implementation that allows a pseudo-random multi dice roll on-chain. The main contract extends a contract called Block Shuffler, which handles the actual randomization. Relative (low-stake) randomization is accomplished by having the user write a hash value to the chain, while retaining it's hash key as a secret. The user also writes a specified number of verification blocks, which translates to the shuffle's finishing block number. After the specified number of verification blocks, the key can be combined with preset block's resulting blockhash, to reveal the shuffle result. The Block Dice contract extends Block Shuffler, by adding dice roll functionality to the randomization, with up to 256 dice with up ot 256 sides each. A user's roll is started by writing a hash value (with key retained as secret) and a number of verification blocks. After verification blocks, roll value can be read, and roll completed, by sending retained hash key, along with the number of sides and dice count to translate. The result will be the value of each die. The contract is entirely functional, and retains no long-term data, apart from event logging. It only stores data on-chain temporarily, per roll, per account, and cleans up after itself after each roll completes. 

## Deployment

The BlockDice contract can be deployed on Ethereum mainnet or testnet, side-chain, or compatible chain.

Run `truffle compile` to compile, `truffle deploy` to deploy (default local chain).

## Testing 

Run `truffle test` for thorough testing.

## extdev-plasma-us1 Deployed Contract Address

0x4b5D49a47a2031724Ad990C4D74461BC94E3db42