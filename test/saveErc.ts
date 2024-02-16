import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SaveErc20", () => {

    const deploySaveErc20 = async () => {

        // const erc20ContractAddr = "0x847eA1099143c0b40F03B39e997b69E9B91EBa6C";

        const addrZero = ethers.ZeroAddress;

        // const [name, symbol, decimal, amount] = ["Mano", "MoN", 18, 2000];

        const [owner, otherAccount] = await ethers.getSigners();
        
        const Erc20Token = await ethers.getContractFactory('MyToken');

        const erc20Token = await Erc20Token.deploy(owner);

        const SaveErc20 = await ethers.getContractFactory("SaveERC20");

        const saveErc20 = await SaveErc20.deploy(erc20Token.target);

        const contAddr = saveErc20.target;

        return {saveErc20, SaveErc20, owner, contAddr, otherAccount, addrZero, erc20Token};
     }

     describe("deployment", () => {

        it("should successfully deploy", async () => {
            const {saveErc20} = await loadFixture(deploySaveErc20);

            await expect(saveErc20).exist
        })

        it("should validate that savingToken is not addrzero", async () => {
            const {saveErc20, addrZero} = await loadFixture(deploySaveErc20);

            await expect(saveErc20.getSavingToken()).to.not.eql(addrZero)
        })

        it("should validate that savingToken is erc20 Token address", async () => {
            const {saveErc20, addrZero, erc20Token} = await loadFixture(deploySaveErc20);

            await expect(await saveErc20.getSavingToken()).to.equal(erc20Token.target);
        })
     })

     describe("deposit", () => {

        it("should deposit to savErc20 contract", async () => {
            const {saveErc20, contAddr, erc20Token, owner} = await loadFixture(deploySaveErc20);

            const savingBeforeDeposit = await saveErc20.checkUserBalance(owner);

            const ownerBalErc20TokenBeforeDeposit = await erc20Token.connect(owner).balanceOf(owner);

            await erc20Token.approve(contAddr, 200)

            await saveErc20.connect(owner).deposit(200);

            const savingsAfterDeposit = await saveErc20.checkUserBalance(owner)

            const ownerBalErc20TokenAfterDeposit = await erc20Token.connect(owner).balanceOf(owner);

            await expect(await saveErc20.checkUserBalance(owner)).eq(200)

            await expect(savingsAfterDeposit).to.be.greaterThan(savingBeforeDeposit);

            await expect(ownerBalErc20TokenBeforeDeposit).to.eq(2000)

            await expect(ownerBalErc20TokenAfterDeposit).to.eq(1800)
        })
     })

     describe("withdrawal", () => {
        it("should successful withdraw", async () => {
            const {saveErc20, contAddr, erc20Token, owner} = await loadFixture(deploySaveErc20);

            await erc20Token.approve(contAddr, 200)

            await saveErc20.connect(owner).deposit(200);

            const savingsBeforeWithdrawal = await saveErc20.checkUserBalance(owner)

            await saveErc20.connect(owner).withdraw(200);

            const savingsAfterWithdrawal = await saveErc20.checkUserBalance(owner)

            await expect(savingsBeforeWithdrawal).to.be.greaterThan(savingsAfterWithdrawal);

        })
     })

     describe("owner withdrawal", () => {
        it("should allow owner withdraw", async () => {
            const {saveErc20, owner, erc20Token, contAddr, otherAccount} = await loadFixture(deploySaveErc20);

            await erc20Token.approve(contAddr, 200)

            await saveErc20.connect(owner).deposit(200);

            const balanceBeforeWithdrawal = await saveErc20.checkContractBalance();

            await saveErc20.connect(owner).ownerWithdraw(20);

            const balanceAfterWithdrawal = await saveErc20.checkContractBalance();

            await expect(balanceBeforeWithdrawal).to.be.greaterThan(balanceAfterWithdrawal); 

            // console.log(balanceAfterWithdrawal, balanceBeforeWithdrawal)

        })
     })
})