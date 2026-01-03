// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GDGToken.sol";

/**
 * @title RewardMarketplace
 * @dev Handles redemption of tokens for rewards
 */
contract RewardMarketplace is AccessControl, ReentrancyGuard {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    GDGToken public token;

    event TokensRedeemed(
        address indexed user,
        string rewardId,
        uint256 tokenAmount,
        uint256 quantity,
        uint256 timestamp
    );

    event RedemptionVerified(
        address indexed user,
        string rewardId,
        string redemptionId,
        uint256 timestamp
    );

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        token = GDGToken(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Redeems tokens for a reward
     * @param rewardId ID of the reward being redeemed
     * @param tokenAmount Amount of tokens to burn
     * @param quantity Quantity of items being redeemed
     */
    function redeemTokens(
        string memory rewardId,
        uint256 tokenAmount,
        uint256 quantity
    ) external nonReentrant {
        require(bytes(rewardId).length > 0, "Invalid reward ID");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(quantity > 0, "Quantity must be greater than 0");
        require(
            token.balanceOf(msg.sender) >= tokenAmount,
            "Insufficient token balance"
        );

        string memory reason = string(
            abi.encodePacked("Redemption for reward: ", rewardId)
        );

        token.burnFrom(msg.sender, tokenAmount, reason);

        emit TokensRedeemed(
            msg.sender,
            rewardId,
            tokenAmount,
            quantity,
            block.timestamp
        );
    }

    /**
     * @dev Verifies a redemption after fulfillment (called by operator)
     * @param user User address
     * @param rewardId Reward ID
     * @param redemptionId Backend redemption ID
     */
    function verifyRedemption(
        address user,
        string memory rewardId,
        string memory redemptionId
    ) external onlyRole(OPERATOR_ROLE) {
        require(user != address(0), "Invalid user address");
        require(bytes(rewardId).length > 0, "Invalid reward ID");
        require(bytes(redemptionId).length > 0, "Invalid redemption ID");

        emit RedemptionVerified(user, rewardId, redemptionId, block.timestamp);
    }

    /**
     * @dev Updates the token contract address (emergency function)
     * @param newTokenAddress New token contract address
     */
    function updateTokenAddress(address newTokenAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newTokenAddress != address(0), "Invalid token address");
        token = GDGToken(newTokenAddress);
    }
}
