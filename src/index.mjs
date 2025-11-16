#!/usr/bin/env node

/**
 * PoE Atlas Tree CLI
 * Generates PoE Planner URLs from atlas data and tree profiles
 */

import { loadAtlasData, validateNodeIds } from './atlasData.mjs';
import { loadProfile, resolveProfileToIds } from './treeProfile.mjs';
import { generatePlannerUrl } from './encoder.mjs';

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArguments(args) {
  const parsed = {
    atlasJson: null,
    profile: null,
    baseUrl: 'https://poeplanner.com/atlas-tree/'
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--atlas-json' && i + 1 < args.length) {
      parsed.atlasJson = args[i + 1];
      i++;
    } else if (arg === '--profile' && i + 1 < args.length) {
      parsed.profile = args[i + 1];
      i++;
    } else if (arg === '--base-url' && i + 1 < args.length) {
      parsed.baseUrl = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    }
  }
  
  return parsed;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
PoE Atlas Tree CLI

Usage:
  node src/index.mjs --atlas-json <path> --profile <path> [options]

Required Arguments:
  --atlas-json <path>    Path to atlas JSON file containing node definitions
  --profile <path>       Path to profile JSON file with allocated nodes

Optional Arguments:
  --base-url <url>       Base URL for PoE Planner (default: https://poeplanner.com/atlas-tree/)
  --help, -h             Show this help message

Profile JSON Format:
  {
    "allocatedById": [1, 2, 3],           // Optional: Array of node IDs
    "allocatedByName": ["Node A", "Node B"] // Optional: Array of node names
  }

Atlas JSON Format:
  {
    "nodes": [
      { "id": 1, "name": "Node A", ... },
      { "id": 2, "name": "Node B", ... }
    ]
  }

Example:
  node src/index.mjs --atlas-json data/atlas.json --profile profiles/tree.json
`);
}

/**
 * Main CLI function
 */
async function main() {
  const args = parseArguments(process.argv.slice(2));
  
  // Show help if requested
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  
  // Validate required arguments
  if (!args.atlasJson) {
    console.error('Error: --atlas-json argument is required');
    console.error('Use --help for usage information');
    process.exit(1);
  }
  
  if (!args.profile) {
    console.error('Error: --profile argument is required');
    console.error('Use --help for usage information');
    process.exit(1);
  }
  
  try {
    // Load atlas data
    console.log(`Loading atlas data from: ${args.atlasJson}`);
    const atlasData = await loadAtlasData(args.atlasJson);
    console.log(`✓ Loaded ${atlasData.nodes.length} nodes from atlas`);
    
    // Load profile
    console.log(`Loading profile from: ${args.profile}`);
    const profile = await loadProfile(args.profile);
    console.log('✓ Profile loaded successfully');
    
    // Resolve profile to IDs
    console.log('Resolving node names to IDs...');
    const { allocatedIds, errors } = resolveProfileToIds(profile, atlasData);
    
    // Report any resolution errors
    if (errors.length > 0) {
      console.warn('\nWarnings during resolution:');
      errors.forEach(error => console.warn(`  ⚠ ${error}`));
    }
    
    if (allocatedIds.length === 0) {
      console.error('\nError: No valid nodes allocated in profile');
      process.exit(1);
    }
    
    console.log(`✓ Resolved ${allocatedIds.length} allocated nodes`);
    
    // Validate node IDs
    console.log('Validating node IDs...');
    const validation = validateNodeIds(allocatedIds, atlasData);
    
    if (validation.invalid.length > 0) {
      console.warn(`\nWarning: ${validation.invalid.length} invalid node IDs found:`);
      console.warn(`  Invalid IDs: ${validation.invalid.join(', ')}`);
    }
    
    if (validation.valid.length === 0) {
      console.error('\nError: No valid node IDs to encode');
      process.exit(1);
    }
    
    console.log(`✓ ${validation.valid.length} valid nodes confirmed`);
    
    // Generate URL
    console.log('\nGenerating PoE Planner URL...');
    const url = generatePlannerUrl(args.baseUrl, validation.valid);
    
    console.log('\n' + '='.repeat(80));
    console.log('PoE Planner URL:');
    console.log(url);
    console.log('='.repeat(80));
    
    console.log('\n✓ Complete!');
    
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Run the CLI
main();
