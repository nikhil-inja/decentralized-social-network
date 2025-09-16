// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserProfile (Refactored)
 * @dev Manages user profiles for the decentralized social network.
 * This version includes soft-deletion functionality for user control.
 */
contract UserProfile {
    struct Profile {
        string username;
        string bio;
        string profileImageHash; // IPFS hash of the profile image
        bool isActive;           // NEW: Flag for soft-deleting profiles.
    }

    mapping(address => Profile) public profiles;

    event ProfileUpdated(address indexed user, string username, string bio, string profileImageHash);
    event ProfileDeleted(address indexed user); // NEW: Event for soft deletion.


    /**
     * @dev Creates or updates a user's profile, ensuring it is marked as active.
     */
    function setProfile(string memory _username, string memory _bio, string memory _profileImageHash) public {
        // UPDATED: Now includes the 'isActive' flag, set to true.
        profiles[msg.sender] = Profile(_username, _bio, _profileImageHash, true);
        emit ProfileUpdated(msg.sender, _username, _bio, _profileImageHash);
    }

    /**
     * @dev NEW: Allows a user to soft-delete their profile.
     */
    function deleteProfile() public {
        // This sets the user's active status to false but preserves their data history.
        profiles[msg.sender].isActive = false;
        emit ProfileDeleted(msg.sender);
    }

    /**
     * @dev A view function to retrieve a user's profile data.
     */
    function getProfile(address _user) public view returns (Profile memory) {
        return profiles[_user];
    }
}

