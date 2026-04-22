/**
 * Centralized Financial Conversion Utilities for IC Points System
 * Rule: 1 IC Point = 50 Rupees
 */

const CONVERSION_RATE = 50.0;

/**
 * Converts Rupee amount to IC Points
 * @param {number} rupees 
 * @returns {number} points
 */
export const toIC = (rupees) => {
  if (!rupees) return 0;
  return parseFloat((parseFloat(rupees) / CONVERSION_RATE).toFixed(4));
};

/**
 * Converts IC Points to Rupee amount
 * @param {number} points 
 * @returns {number} rupees
 */
export const toRupees = (points) => {
  if (!points) return 0;
  return parseFloat((parseFloat(points) * CONVERSION_RATE).toFixed(2));
};

/**
 * Formats points for display (max 2 decimal places)
 * @param {number|string} points 
 * @returns {string}
 */
export const formatIC = (points) => {
  if (points === undefined || points === null) return '0.00';
  return parseFloat(points).toFixed(2);
};
