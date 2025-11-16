/**
 * Tree profile loader and resolver
 */

import { readFile } from 'fs/promises';
import { createNameToIdMap } from './atlasData.mjs';

/**
 * Load and parse profile JSON data
 * @param {string} filePath - Path to profile JSON file
 * @returns {Promise<Object>} Parsed profile data
 */
export async function loadProfile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!validateProfile(data)) {
      throw new Error('Invalid profile data structure');
    }
    
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Profile file not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Validate profile data structure
 * @param {Object} data - Profile data to validate
 * @returns {boolean} True if valid
 */
export function validateProfile(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Profile should have at least one allocation method
  const hasAllocatedById = Array.isArray(data.allocatedById);
  const hasAllocatedByName = Array.isArray(data.allocatedByName);
  
  return hasAllocatedById || hasAllocatedByName;
}

/**
 * Resolve profile allocations to node IDs
 * @param {Object} profile - Profile data
 * @param {Object} atlasData - Atlas data
 * @returns {Object} Resolved data with IDs and any errors
 */
export function resolveProfileToIds(profile, atlasData) {
  const allocatedIds = new Set();
  const errors = [];
  
  // Add IDs from allocatedById
  if (Array.isArray(profile.allocatedById)) {
    for (const id of profile.allocatedById) {
      if (typeof id === 'number') {
        allocatedIds.add(id);
      } else {
        errors.push(`Invalid ID in allocatedById: ${id} (not a number)`);
      }
    }
  }
  
  // Resolve names to IDs from allocatedByName
  if (Array.isArray(profile.allocatedByName)) {
    const nameToIdMap = createNameToIdMap(atlasData);
    
    for (const name of profile.allocatedByName) {
      if (typeof name !== 'string') {
        errors.push(`Invalid name in allocatedByName: ${name} (not a string)`);
        continue;
      }
      
      const id = nameToIdMap.get(name.toLowerCase());
      if (id !== undefined) {
        allocatedIds.add(id);
      } else {
        errors.push(`Node name not found in atlas: "${name}"`);
      }
    }
  }
  
  return {
    allocatedIds: Array.from(allocatedIds).sort((a, b) => a - b),
    errors
  };
}
