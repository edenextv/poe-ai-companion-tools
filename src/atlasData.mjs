/**
 * Atlas data loader and validator
 */

import { readFile } from 'fs/promises';

/**
 * Load and parse atlas JSON data
 * @param {string} filePath - Path to atlas JSON file
 * @returns {Promise<Object>} Parsed atlas data
 */
export async function loadAtlasData(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!validateAtlasData(data)) {
      throw new Error('Invalid atlas data structure');
    }
    
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Atlas file not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Validate atlas data structure
 * @param {Object} data - Atlas data to validate
 * @returns {boolean} True if valid
 */
export function validateAtlasData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Atlas data should have nodes array
  if (!Array.isArray(data.nodes)) {
    return false;
  }
  
  // Each node should have an id and name
  for (const node of data.nodes) {
    if (typeof node.id !== 'number' || typeof node.name !== 'string') {
      return false;
    }
  }
  
  return true;
}

/**
 * Create a map of node names to IDs for quick lookup
 * @param {Object} atlasData - Atlas data
 * @returns {Map<string, number>} Map of names to IDs
 */
export function createNameToIdMap(atlasData) {
  const map = new Map();
  
  for (const node of atlasData.nodes) {
    map.set(node.name.toLowerCase(), node.id);
  }
  
  return map;
}

/**
 * Validate that all node IDs exist in the atlas
 * @param {number[]} nodeIds - Array of node IDs to validate
 * @param {Object} atlasData - Atlas data
 * @returns {Object} Validation result with valid/invalid IDs
 */
export function validateNodeIds(nodeIds, atlasData) {
  const validIds = new Set(atlasData.nodes.map(n => n.id));
  const result = {
    valid: [],
    invalid: []
  };
  
  for (const id of nodeIds) {
    if (validIds.has(id)) {
      result.valid.push(id);
    } else {
      result.invalid.push(id);
    }
  }
  
  return result;
}
