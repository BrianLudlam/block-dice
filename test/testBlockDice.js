const truffleAssert = require('truffle-assertions');
const BlockDice = artifacts.require("BlockDice");

const DICE_SIDES = 6;
const ROLL_COUNT = 5;
const VERIFY_BLOCKS = 1;

let dice;

const consoleLog = (msg) => { console.log ('LOG >>> ', msg); }

const sleep = async (time) => {
  return new Promise(resolve => setTimeout(() => resolve(), time));
}

const sleepUntilBlock = async (blockNumber) => {
  let _blockNumber = 0;
  while (_blockNumber <= blockNumber) {
    await sleep(1200);
    const block = await web3.eth.getBlock("latest");
    _blockNumber = block.number;
  }
}

contract("BlockDice", (accounts) => {

  const owner = accounts[0];
  const alice = accounts[1];
  const aliceOp = accounts[2];
  const bob = accounts[3];

  beforeEach(async () => {
    dice = await BlockDice.new({from: owner});
  });

  afterEach(async () => {
    await dice.destroy({from: owner});
  });

  it("should roll dice", async () => {
	try{
	  const key = web3.utils.soliditySha3 (Date.now());
	  let tx = await dice.startRoll(web3.utils.soliditySha3(key), VERIFY_BLOCKS, {from: alice});
	  //const block = await web3.eth.getBlock("latest");
	  let finishBlock;
	  truffleAssert.eventEmitted(tx, 'Rolling', (e) => (
  		e.account.toString() === alice && 
  		(finishBlock = parseInt(e.block.toString(), 10)) !== 0
  	  ));

  	  await sleepUntilBlock(finishBlock);

	  tx = await dice.finishRoll(key, DICE_SIDES, ROLL_COUNT, {from: alice});
	  truffleAssert.eventEmitted(tx, 'Rolled', (e) => (
  		e.account.toString() === alice && 
    	e.sides.toString() === DICE_SIDES.toString() && 
    	e.count.toString() === ROLL_COUNT.toString() && 
    	e.roll.length === ROLL_COUNT 
  	  ));
	} catch(e) {
	  assert(false);
	  return;
	}
  })

  it("should have roll predictable by roller", async () => {
	try{
	  const key = web3.utils.soliditySha3 (Date.now());
	  let tx = await dice.startRoll(web3.utils.soliditySha3(key), VERIFY_BLOCKS, {from: alice});
	  //const block = await web3.eth.getBlock("latest");
	  let finishBlock;
	  truffleAssert.eventEmitted(tx, 'Rolling', (e) => (
  		e.account.toString() === alice && 
  		(finishBlock = parseInt(e.block.toString(), 10)) !== 0
  	  ));

  	  await sleepUntilBlock(finishBlock);

      let rollView = await dice.getRoll(key, DICE_SIDES, ROLL_COUNT, {from: alice});
      rollView = rollView.map((each) => parseInt(each.toString(), 10) + 1)
      consoleLog('rollView');
  	  consoleLog(rollView);

	  let roll;
	  tx = await dice.finishRoll(key, DICE_SIDES, ROLL_COUNT, {from: alice});
	  truffleAssert.eventEmitted(tx, 'Rolled', (e) => (
  		e.account.toString() === alice && 
    	e.sides.toString() === DICE_SIDES.toString() && 
    	e.count.toString() === ROLL_COUNT.toString() && 
    	e.roll.length === ROLL_COUNT && 
    	(roll = e.roll).every((one) => (one >= 0 && one < DICE_SIDES))
  	  ));

	  roll = roll.map((each) => parseInt(each.toString(), 10) + 1)
	  consoleLog('block roll');
  	  consoleLog(roll);

      for (let i = 0; i < ROLL_COUNT; i++) {
         assert(rollView[i] === roll[i]);
      }

	} catch(e) {
	  assert(false);
	  return;
	}
  })

  it("should not allow more than one roll at a time per account", async () => {
	let key;
	let finishBlock;
	try{
      key = web3.utils.soliditySha3 (Date.now());
	  const tx = await dice.startRoll(web3.utils.soliditySha3(key), VERIFY_BLOCKS, {from: alice});
	  truffleAssert.eventEmitted(tx, 'Rolling', (e) => (
  		e.account.toString() === alice && 
  		(finishBlock = parseInt(e.block.toString(), 10)) !== 0
  	  ));
	  await dice.startRoll(web3.utils.soliditySha3(key), VERIFY_BLOCKS, {from: alice});
	  assert(false);
	} catch(e) {
	  assert(true);
	} finally {
	  await sleepUntilBlock(finishBlock);
	  await dice.finishRoll(key, DICE_SIDES, ROLL_COUNT, {from: alice});
	}
  })

  it("should allow multiple accounts rolling dice at once", async () => {
	try{
	  const keyA = web3.utils.soliditySha3 (Date.now());
	  await dice.startRoll(web3.utils.soliditySha3(keyA), VERIFY_BLOCKS, {from: alice});
	  const keyB = web3.utils.soliditySha3 (Date.now());
	  const tx = await dice.startRoll(web3.utils.soliditySha3(keyB), VERIFY_BLOCKS, {from: bob});
	  let finishBlock;
	  truffleAssert.eventEmitted(tx, 'Rolling', (e) => (
  		e.account.toString() === bob && 
  		(finishBlock = parseInt(e.block.toString(), 10)) !== 0
  	  ));
  	  await sleepUntilBlock(finishBlock);
	  await dice.finishRoll(keyB, DICE_SIDES, ROLL_COUNT, {from: bob});
	  await dice.finishRoll(keyA, DICE_SIDES, ROLL_COUNT, {from: alice});
	} catch(e) {
	  assert(false);
	  return;
	}
  })

});