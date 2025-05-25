/**
 * Utility functions for handling Razorpay payment integration
 */

/**
 * Initialize Razorpay checkout
 * @param {Object} options - Razorpay options
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const initializeRazorpay = (options, onSuccess, onError) => {
  if (!window.Razorpay) {
    onError(new Error('Razorpay SDK not loaded'));
    return;
  }

  try {
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.success', (response) => {
      if (onSuccess) {
        onSuccess(response);
      }
    });
    
    razorpay.on('payment.error', (response) => {
      if (onError) {
        onError(response);
      }
    });
    
    razorpay.open();
  } catch (error) {
    if (onError) {
      onError(error);
    }
  }
};

/**
 * Load Razorpay script dynamically
 * @returns {Promise} - Resolves when script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay SDK'));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Create Razorpay payment options
 * @param {Object} paymentData - Payment data from backend
 * @param {Object} user - User information
 * @param {string} orderId - Order ID
 * @returns {Object} - Razorpay options
 */
export const createRazorpayOptions = (paymentData, user, orderId) => {
  return {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: paymentData.amount * 100, // Razorpay expects amount in paise
    currency: paymentData.currency,
    name: 'Hardware Store',
    description: `Order #${orderId}`,
    order_id: paymentData.order_id,
    prefill: {
      name: user ? `${user.first_name} ${user.last_name}` : '',
      email: user ? user.email : '',
      contact: user ? user.phone : ''
    },
    notes: {
      order_id: orderId
    },
    theme: {
      color: '#1976d2'
    }
  };
};
