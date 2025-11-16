/**
 * Encodes atlas tree data for PoE Planner URL format
 */

/**
 * Encode allocated node IDs into a base64 string for PoE Planner
 * @param {number[]} allocatedIds - Array of allocated node IDs
 * @returns {string} Base64 encoded string
 */
export function encodeAllocatedNodes(allocatedIds) {
  if (!allocatedIds || allocatedIds.length === 0) {
    return '';
  }

  // Sort IDs to ensure consistent encoding
  const sortedIds = [...allocatedIds].sort((a, b) => a - b);

  // Convert IDs to a compact binary format
  // Each ID is encoded as a variable-length integer
  const bytes = [];
  
  for (const id of sortedIds) {
    // Use variable-length encoding for efficiency
    if (id < 128) {
      bytes.push(id);
    } else if (id < 16384) {
      bytes.push((id & 0x7F) | 0x80);
      bytes.push((id >> 7) & 0x7F);
    } else {
      bytes.push((id & 0x7F) | 0x80);
      bytes.push(((id >> 7) & 0x7F) | 0x80);
      bytes.push((id >> 14) & 0x7F);
    }
  }

  // Convert bytes to base64
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64url'); // Use URL-safe base64
}

/**
 * Generate the full PoE Planner URL with encoded tree data
 * @param {string} baseUrl - Base URL for PoE Planner
 * @param {number[]} allocatedIds - Array of allocated node IDs
 * @returns {string} Complete URL
 */
export function generatePlannerUrl(baseUrl, allocatedIds) {
  const encoded = encodeAllocatedNodes(allocatedIds);
  
  // Ensure baseUrl ends with a slash
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  return `${normalizedBaseUrl}${encoded}`;
}
