// frontend/contracts/config.js

// IMPORTANT: Make sure you have copied the ABI JSON files into this same directory
import EscrowFactoryABIJson from './EscrowFactory.abi.json';
import ArbiterRegistryABIJson from './ArbiterRegistry.abi.json';
import EscrowABIJson from './Escrow.abi.json';
import SocialTokenABIJson from './SocialToken.abi.json';

// --- PASTE YOUR DEPLOYED ADDRESSES HERE ---
// Make sure these are up to date after your last deployment
export const ESCROW_FACTORY_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
export const ARBITER_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// --- EXPORT ABIs ---
// We import the JSON with a temporary name (e.g., '...Json') and then
// export it with the final, clean name. This avoids duplicate declarations.
export const EscrowFactoryABI = EscrowFactoryABIJson;
export const ArbiterRegistryABI = ArbiterRegistryABIJson;
export const EscrowABI = EscrowABIJson;
export const SocialTokenABI = SocialTokenABIJson;