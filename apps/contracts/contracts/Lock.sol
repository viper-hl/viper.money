// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title Lock
 * @dev A sample contract that locks funds until a specified unlock time
 */
contract Lock {
    uint256 public unlockTime;
    address payable public owner;

    event Withdrawal(uint256 amount, uint256 when);

    error NotOwner();
    error UnlockTimeNotReached();
    error UnlockTimeInPast();

    constructor(uint256 _unlockTime) payable {
        if (block.timestamp >= _unlockTime) {
            revert UnlockTimeInPast();
        }

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        // Uncomment this line to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        if (block.timestamp < unlockTime) {
            revert UnlockTimeNotReached();
        }

        if (msg.sender != owner) {
            revert NotOwner();
        }

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
}
