// frontend/contracts/config.js

// IMPORTANT: Make sure you have copied the ABI JSON files into this same directory
import EscrowFactoryABIJson from './EscrowFactory.abi.json';
import ArbiterRegistryABIJson from './ArbiterRegistry.abi.json';
import SocialTokenABIJson from './SocialToken.abi.json';

// --- PASTE YOUR DEPLOYED ADDRESSES HERE ---
// Make sure these are up to date after your last deployment
export const ESCROW_FACTORY_ADDRESS = '0x0B306BF915C4d645ff596e518fAf3F9669b97016';
export const ARBITER_REGISTRY_ADDRESS = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';

// --- EXPORT ABIs ---
export const EscrowFactoryABI = EscrowFactoryABIJson;
export const ArbiterRegistryABI = ArbiterRegistryABIJson;
export const SocialTokenABI = SocialTokenABIJson;