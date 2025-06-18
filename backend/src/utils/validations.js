/**
 * Validation utilities for backend
 * Contains validation functions for Ecuadorian documents and other data
 * @module utils/validations
 */

/**
 * Validates an Ecuadorian cedula (national ID)
 * @param {string} cedula - Cedula to validate
 * @returns {boolean} - true if cedula is valid, false otherwise
 */
function validateCedula(cedula) {
  // Verify it has 10 digits
  if (!/^\d{10}$/.test(cedula)) return false;

  // Ecuadorian cedula validation algorithm
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const verifier = parseInt(cedula.substring(9, 10));
  const province = parseInt(cedula.substring(0, 2));

  // Validate province code (from 01 to 24)
  if (province < 1 || province > 24) return false;

  // Verify third digit (less than 6 for natural persons)
  if (parseInt(cedula.charAt(2)) > 6) return false;

  let sum = 0;

  // Apply algorithm
  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula.charAt(i)) * coefficients[i];
    sum += value >= 10 ? value - 9 : value;
  }

  const verifierDigit = 10 - (sum % 10);
  const resultMod = verifierDigit === 10 ? 0 : verifierDigit;

  return resultMod === verifier;
}

/**
 * Validates an Ecuadorian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - true if phone is valid, false otherwise
 */
function validateEcuadorianPhone(phone) {
  return /^09\d{8}$/.test(phone); // Must start with 09 and have 10 digits
}

/**
 * Validates that text contains only letters and spaces
 * @param {string} text - Text to validate
 * @returns {boolean} - true if text contains only letters and spaces, false otherwise
 */
function validateOnlyLetters(text) {
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(text);
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - true if email is valid, false otherwise
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 8)
 * @returns {boolean} - true if password meets minimum requirements, false otherwise
 */
function validatePasswordStrength(password, minLength = 8) {
  return password.length >= minLength;
}

module.exports = {
  validateCedula,
  validateEcuadorianPhone,
  validateOnlyLetters,
  validateEmail,
  validatePasswordStrength,
};
