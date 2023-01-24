const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ID = 1; 
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe('Dappazon', () => {
  let deployer, buyer;
  let dappazon;

  beforeEach(async() => {
    //Setup accounts
    [deployer, buyer] = await ethers.getSigners();

    //Deploy contract
    const Dappazon = await ethers.getContractFactory('Dappazon');
    dappazon = await Dappazon.deploy();
  }) 

  describe('Deployment', () => {
    it('sets the owner', async() => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    })
  })

  describe('Listing', () => {
    let transaction;
    
    beforeEach(async() => {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE,
                          COST, RATING, STOCK);  
      await transaction.wait();
    })

    describe('Success', () => {
      it('returns item attributes', async() => {
        const item = await dappazon.items(ID);
        expect(item.id).to.equal(ID);
        expect(item.name).to.equal(NAME);
        expect(item.category).to.equal(CATEGORY);
        expect(item.image).to.equal(IMAGE);
        expect(item.cost).to.equal(COST);
        expect(item.rating).to.equal(RATING);
        expect(item.stock).to.equal(STOCK);
      })    
  
      it('emits list event', () => {
        expect(transaction).to.emit(dappazon);
      }) 
  
      it('sets the owner', async() => { 
        const result = await dappazon.owner();
        expect(result).to.equal(deployer.address);
      }) 
    })

    describe('Failure', () => {
      it('rejects anyone than the owner', async() => {
        await expect(dappazon.connect(buyer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)).to.be.reverted;
      })
    })
  })

  describe('Buying', () => {
    let transaction;
    
    beforeEach(async() => {
      // List an item
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      // Buy an item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();
    })

    it('updates the contract balance', async() => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(COST);
    })

    it('updates buyer\'s order count', async() => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    })
  })
})
