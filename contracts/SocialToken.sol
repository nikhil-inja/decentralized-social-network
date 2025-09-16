// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// We import the standard contracts from OpenZeppelin.
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SocialToken
 * @dev A standard ERC20 token for the dApp's economy. Inherits Ownable so
 * only the deployer can mint initial tokens.
 */
contract SocialToken is ERC20, Ownable {
    /**
     * @dev The constructor sets the token's name and symbol.
     * It calls the parent ERC20 constructor.
     */
    constructor() ERC20("Social Token", "SCL") Ownable(msg.sender) {}

    /**
     * @dev Creates new tokens. Can only be called by the contract owner (deployer).
     * @param to The address to mint tokens to.
     * @param amount The number of tokens to mint (with 18 decimals).
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
