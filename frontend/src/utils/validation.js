/**
 * Form validation utility functions
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password (at least 6 characters)
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  const regex = /^\d{10}$/;
  return regex.test(phone);
};

/**
 * Validate required field
 * @param {string} value - Field value
 * @returns {boolean} - True if valid
 */
export const isNotEmpty = (value) => {
  return value && value.trim() !== '';
};

/**
 * Validate passwords match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {boolean} - True if valid
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validate credit card number (basic validation)
 * @param {string} cardNumber - Card number
 * @returns {boolean} - True if valid
 */
export const isValidCreditCard = (cardNumber) => {
  // Remove spaces and dashes
  const sanitized = cardNumber.replace(/[\s-]/g, '');
  // Check if it's a number and has between 13-19 digits
  return /^\d{13,19}$/.test(sanitized);
};

/**
 * Validate CVV (3-4 digits)
 * @param {string} cvv - CVV code
 * @returns {boolean} - True if valid
 */
export const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Validate expiry date (MM/YY format)
 * @param {string} expiryDate - Expiry date
 * @returns {boolean} - True if valid
 */
export const isValidExpiryDate = (expiryDate) => {
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split('/');
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  // Convert to numbers
  const numYear = parseInt(year, 10);
  const numMonth = parseInt(month, 10);
  
  // Check if the card is expired
  if (numYear < currentYear || (numYear === currentYear && numMonth < currentMonth)) {
    return false;
  }
  
  return true;
};

/**
 * Validate zip/postal code (5 digits)
 * @param {string} zipCode - Zip code
 * @returns {boolean} - True if valid
 */
export const isValidZipCode = (zipCode) => {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
};

/**
 * Validate product price (positive number)
 * @param {number} price - Price to validate
 * @returns {boolean} - True if valid
 */
export const isValidPrice = (price) => {
  return !isNaN(price) && parseFloat(price) > 0;
};

/**
 * Validate product stock (non-negative integer)
 * @param {number} stock - Stock to validate
 * @returns {boolean} - True if valid
 */
export const isValidStock = (stock) => {
  return !isNaN(stock) && parseInt(stock) >= 0 && Number.isInteger(parseFloat(stock));
};

/**
 * Validate form fields
 * @param {Object} values - Form values
 * @param {Object} validations - Validation rules
 * @returns {Object} - Validation errors
 */
export const validateForm = (values, validations) => {
  const errors = {};
  
  Object.keys(validations).forEach(field => {
    const value = values[field];
    const validation = validations[field];
    
    if (validation.required && !isNotEmpty(value)) {
      errors[field] = `${validation.label || field} is required`;
    } else if (validation.email && value && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
    } else if (validation.password && value && !isValidPassword(value)) {
      errors[field] = 'Password must be at least 6 characters';
    } else if (validation.match && value !== values[validation.match]) {
      errors[field] = `${validation.label || field} does not match`;
    } else if (validation.phone && value && !isValidPhone(value)) {
      errors[field] = 'Invalid phone number format';
    } else if (validation.zipCode && value && !isValidZipCode(value)) {
      errors[field] = 'Invalid zip code format';
    } else if (validation.price && !isValidPrice(value)) {
      errors[field] = 'Price must be a positive number';
    } else if (validation.stock && !isValidStock(value)) {
      errors[field] = 'Stock must be a non-negative integer';
    }
  });
  
  return errors;
};
