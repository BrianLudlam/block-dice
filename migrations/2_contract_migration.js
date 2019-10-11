const BlockDice = artifacts.require("BlockDice");
module.exports = function(deployer) {
  deployer.deploy(BlockDice);
};
