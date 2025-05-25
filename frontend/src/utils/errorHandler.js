/**
 * Utility functions for handling API errors and responses
 */

/**
 * Format error message from API response
 * @param {Error} error - Axios error object
 * @returns {string} - Formatted error message
 */
export const getErrorMessage = (error) => {
  // If the error has a response from the server
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    
    // If the server sent a message, use that
    if (data && data.message) {
      return data.message;
    }
    
    // Otherwise, provide a generic message based on status code
    switch (status) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return `Error: ${status}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Handle API errors and show appropriate error message
 * @param {Error} error - Axios error object
 * @param {Function} setError - Function to set error state
 * @param {Function} setLoading - Function to set loading state
 */
export const handleApiError = (error, setError, setLoading = null) => {
  console.error('API Error:', error);
  const errorMessage = getErrorMessage(error);
  setError(errorMessage);
  
  if (setLoading) {
    setLoading(false);
  }
  
  // If unauthorized, handle logout if needed
  if (error.response && error.response.status === 401) {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // You can redirect to login page here if needed
    // window.location.href = '/login';
  }
};

/**
 * Process successful API response
 * @param {Object} response - Axios response object
 * @param {Function} callback - Callback function for successful response
 * @param {Function} setLoading - Function to set loading state
 */
export const handleApiSuccess = (response, callback, setLoading = null) => {
  if (setLoading) {
    setLoading(false);
  }
  
  if (callback && typeof callback === 'function') {
    callback(response.data);
  }
  
  return response.data;
};

/**
 * Create a handler function for API requests with consistent error handling
 * @param {Function} apiCall - Function that returns a Promise from an API call
 * @param {Object} options - Options for handling the API call
 * @returns {Function} - Handler function
 */
export const createApiHandler = (apiCall, options = {}) => {
  const { onSuccess, onError, setLoading, setError } = options;
  
  return async (...args) => {
    try {
      if (setLoading) {
        setLoading(true);
      }
      
      if (setError) {
        setError(null);
      }
      
      const response = await apiCall(...args);
      return handleApiSuccess(response, onSuccess, setLoading);
    } catch (error) {
      handleApiError(error, setError || console.error, setLoading);
      
      if (onError && typeof onError === 'function') {
        onError(error);
      }
      
      throw error;
    }
  };
};
