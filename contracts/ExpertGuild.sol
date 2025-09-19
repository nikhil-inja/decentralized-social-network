// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/access/Ownable.sol";

// contract ExpertGuild is Ownable {
//     // The different categories of work that can be disputed
//     enum Specialty {
//         GENERAL,
//         SOFTWARE_DEVELOPMENT,
//         GRAPHIC_DESIGN,
//         LEGAL
//     }

//     struct Expert {
//         Specialty specialty;
//         bool isActive;
//     }

//     // Mapping from an expert's address to their data
//     mapping(address => Expert) public experts;
//     // Mapping from a specialty to a list of experts in that guild
//     mapping(Specialty => address[]) public guildMembers;

//     event ExpertAdded(address indexed expertAddress, Specialty specialty);
//     event ExpertRemoved(address indexed expertAddress);

//     constructor() Ownable(msg.sender) {}

//     /**
//      * @dev Adds a new expert to a specific guild. Only callable by the platform owner.
//      */
//     function addExpert(address _expertAddress, Specialty _specialty) external onlyOwner {
//         require(!experts[_expertAddress].isActive, "Expert already exists.");

//         experts[_expertAddress] = Expert({
//             specialty: _specialty,
//             isActive: true
//         });

//         guildMembers[_specialty].push(_expertAddress);
//         emit ExpertAdded(_expertAddress, _specialty);
//     }

//     function removeExpert(address _expertAddress) external onlyOwner {
//         require(experts[_expertAddress].isActive, "Expert not active.");
//         experts[_expertAddress].isActive = false;
//         // Note: For simplicity, we don't remove from the array. Frontend filters.
//         emit ExpertRemoved(_expertAddress);
//     }

//     function isExpertInGuild(address _expertAddress, Specialty _specialty) external view returns (bool) {
//         return experts[_expertAddress].isActive && experts[_expertAddress].specialty == _specialty;
//     }

//     // In a full implementation, this contract would also contain the logic for
//     // creating new votes, tallying results, and distributing rewards to jurors.
// }
