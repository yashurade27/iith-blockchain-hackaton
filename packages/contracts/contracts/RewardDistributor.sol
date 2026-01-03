// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GDGToken.sol";

/**
 * @title RewardDistributor
 * @dev Handles distribution of GDG tokens to users for activities
 */
contract RewardDistributor is AccessControl, ReentrancyGuard {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    GDGToken public token;

    event TokensDistributed(
        address indexed to,
        uint256 amount,
        string activityType,
        string description,
        uint256 timestamp
    );

    event BatchDistributionCompleted(
        uint256 totalRecipients,
        uint256 totalAmount,
        uint256 timestamp
    );

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        token = GDGToken(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Distributes tokens to a single address
     * @param to Recipient address
     * @param amount Amount of tokens to distribute
     * @param activityType Type of activity (e.g., "CONTEST", "EVENT")
     * @param description Description of the distribution
     */
    function distributeTokens(
        address to,
        uint256 amount,
        string memory activityType,
        string memory description
    ) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        require(to != address(0), "Cannot distribute to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(activityType).length > 0, "Activity type required");

        string memory reason = string(
            abi.encodePacked(activityType, ": ", description)
        );

        token.mint(to, amount, reason);

        emit TokensDistributed(
            to,
            amount,
            activityType,
            description,
            block.timestamp
        );
    }

    /**
     * @dev Distributes tokens to multiple addresses in a batch
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts
     * @param descriptions Array of distribution descriptions
     */
    function batchDistribute(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata descriptions
    ) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        require(
            recipients.length == amounts.length &&
            recipients.length == descriptions.length,
            "Array lengths must match"
        );
        require(recipients.length > 0, "Empty arrays");
        require(recipients.length <= 100, "Batch size too large");

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] > 0, "Amount must be greater than 0");

            string memory reason = string(
                abi.encodePacked("Batch Distribution: ", descriptions[i])
            );

            token.mint(recipients[i], amounts[i], reason);
            totalAmount += amounts[i];

            emit TokensDistributed(
                recipients[i],
                amounts[i],
                "BATCH",
                descriptions[i],
                block.timestamp
            );
        }

        emit BatchDistributionCompleted(
            recipients.length,
            totalAmount,
            block.timestamp
        );
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
