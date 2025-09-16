// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserProfile {
    struct Profile {
        string username;
        string bio;
        string profileImageHash; // For the IPFS hash of the image
    }

    mapping(address => Profile) public profiles;

    event ProfileUpdated(address indexed user, string username, string bio, string profileImageHash);

    function setProfile(string memory _username, string memory _bio, string memory _profileImageHash) public {
        profiles[msg.sender] = Profile(_username, _bio, _profileImageHash);
        emit ProfileUpdated(msg.sender, _username, _bio, _profileImageHash);
    }

    function getProfile(address _user) public view returns (Profile memory) {
        return profiles[_user];
    }
}