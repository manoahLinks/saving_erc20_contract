// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Erc20 {

    // state variables
    string public name;
    string public symbol;
    uint public decimal;
    uint totalSupply;

    mapping (address => uint256) balances;
    mapping (address => mapping(address => uint256)) allowance;

    // events
    event transferSuccessful (address _from, address _to, uint _amount);
    event allowanceSuccessful (address _from, address _recipient, uint _amount);
    
    // constucts 
    constructor (string memory _name, string memory _symbol, uint _decimal, uint _amount) {
        name = _name;
        symbol = _symbol;
        decimal = _decimal;
        _mint(msg.sender, _amount);
    }

    // ===== view functions ==================

    // getTotalSupply
    function TotalSupply () external  view returns (uint) {
        return (totalSupply / 10 ** decimal) - (balances[address(0)] / 10 ** decimal);
    }

    // getBalanceOf
    function balanceOf (address _acct) external view returns (uint) {
        return balances[_acct] / 10 ** decimal;
    }

    // ====== state changing functions =======

    // approve func
    function approve (address _spender, uint _amount) external {

        require(msg.sender != address(0), "function cant be called by zero addr");
        
        uint _decimalAmt = _amount * (10 ** decimal);

        allowance[msg.sender][_spender] = _decimalAmt;
        emit allowanceSuccessful(msg.sender, _spender, _amount);
    }

    // transfer func
    function transfer (address _to, uint _amount) external returns (bool) {

        require(msg.sender != address(0), "function cant be called by zero addr");

        uint _decimalAmt = _amount * (10 ** decimal);

        require(_decimalAmt > 0, "you cannot trnsfr zero");

        uint _charges = calculatePercentToBurn(_decimalAmt);

        require(balances[msg.sender] >= _decimalAmt + _charges, "You dont not have enough money trnsfr and for charges");

        balances[msg.sender] -= _decimalAmt + _charges;

        _burn(address(0), _charges);

        balances[_to] += _decimalAmt;

        emit transferSuccessful(msg.sender, _to, _amount);

        return true;
    }

    // transferFrom func
    function transferFrom (address _from, address _to, uint _amount) external returns(bool) {
        require(_from != address(0), "function cant be called by zero addr");
        
        uint _decimalAmt = _amount * (10 ** decimal);
        
        uint _charges = calculatePercentToBurn(_decimalAmt);
        
        require(balances[_from] >= _decimalAmt + _charges, "You dont not have enough money trnsfr and for charges");
        
        require(allowance[_from][_to] >= _decimalAmt, "you dont not have enough allowance bal to spend");
        
        balances[_from] -= _decimalAmt + _charges;
        
        _burn(address(0), _charges);

        allowance[_from][_to] -= _decimalAmt;

        balances[_to] += _decimalAmt;

        emit transferSuccessful(_from, _to, _amount);

        return true;
    }

    // mint func
    function _mint(address _to, uint _amount) private {
        uint _decimalAmt = _amount * (10 ** decimal);
        totalSupply += _decimalAmt;
        balances[_to] += _decimalAmt;
    }

    // burn func
    function _burn(address _to, uint _amount) private {
        totalSupply -= _amount;
        balances[_to] += _amount;
    }

    // calc 10% func
    function calculatePercentToBurn (uint _amount) internal pure returns (uint) {
        uint _burnAmt = (_amount * 10 / 100);
        return  _burnAmt;
    }
}