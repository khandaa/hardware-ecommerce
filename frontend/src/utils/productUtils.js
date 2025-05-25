/**
 * Utility functions for handling and formatting product data
 */

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, currency = 'USD') => {
  if (price === undefined || price === null) return '';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(price);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} - Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
  
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Sort products by different criteria
 * @param {Array} products - Array of products
 * @param {string} sortBy - Sort criteria
 * @returns {Array} - Sorted products
 */
export const sortProducts = (products, sortBy) => {
  if (!products || !Array.isArray(products)) return [];
  
  const productsCopy = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
      return productsCopy.sort((a, b) => a.price - b.price);
    case 'price-high-low':
      return productsCopy.sort((a, b) => b.price - a.price);
    case 'newest':
      return productsCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'name-a-z':
      return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-z-a':
      return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
    case 'popularity':
      return productsCopy.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    default:
      return productsCopy;
  }
};

/**
 * Filter products by category
 * @param {Array} products - Array of products
 * @param {string} category - Category to filter by
 * @returns {Array} - Filtered products
 */
export const filterProductsByCategory = (products, category) => {
  if (!products || !Array.isArray(products)) return [];
  if (!category || category === 'all') return products;
  
  return products.filter(product => product.category === category);
};

/**
 * Filter products by price range
 * @param {Array} products - Array of products
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} - Filtered products
 */
export const filterProductsByPriceRange = (products, minPrice, maxPrice) => {
  if (!products || !Array.isArray(products)) return [];
  
  return products.filter(product => {
    const price = parseFloat(product.price);
    
    if (minPrice && maxPrice) {
      return price >= minPrice && price <= maxPrice;
    } else if (minPrice) {
      return price >= minPrice;
    } else if (maxPrice) {
      return price <= maxPrice;
    }
    
    return true;
  });
};

/**
 * Filter products by availability
 * @param {Array} products - Array of products
 * @param {boolean} inStockOnly - Whether to show only in-stock products
 * @returns {Array} - Filtered products
 */
export const filterProductsByAvailability = (products, inStockOnly) => {
  if (!products || !Array.isArray(products)) return [];
  if (!inStockOnly) return products;
  
  return products.filter(product => product.stock_quantity > 0);
};

/**
 * Search products by keyword
 * @param {Array} products - Array of products
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered products
 */
export const searchProducts = (products, searchTerm) => {
  if (!products || !Array.isArray(products)) return [];
  if (!searchTerm) return products;
  
  const term = searchTerm.toLowerCase().trim();
  
  return products.filter(product => {
    return (
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term))
    );
  });
};

/**
 * Get related products based on category
 * @param {Array} products - Array of all products
 * @param {Object} currentProduct - Current product
 * @param {number} limit - Maximum number of related products
 * @returns {Array} - Related products
 */
export const getRelatedProducts = (products, currentProduct, limit = 4) => {
  if (!products || !Array.isArray(products) || !currentProduct) return [];
  
  // Filter products by the same category, excluding the current product
  const relatedProducts = products.filter(
    product => product.category === currentProduct.category && product.id !== currentProduct.id
  );
  
  // Shuffle the array to get random products
  const shuffled = relatedProducts.sort(() => 0.5 - Math.random());
  
  // Return up to the limit
  return shuffled.slice(0, limit);
};

/**
 * Check if a product is new (added in the last 7 days)
 * @param {Object} product - Product to check
 * @returns {boolean} - True if product is new
 */
export const isNewProduct = (product) => {
  if (!product || !product.created_at) return false;
  
  const productDate = new Date(product.created_at);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - productDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
};
