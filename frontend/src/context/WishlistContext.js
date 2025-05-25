import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { handleApiError } from '../utils/errorHandler';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser } = useContext(AuthContext);

  // Fetch wishlist items on component mount or when user changes
  useEffect(() => {
    if (currentUser) {
      fetchWishlistItems();
    } else {
      // For non-logged in users, get wishlist from localStorage
      const localWishlist = localStorage.getItem('wishlist');
      if (localWishlist) {
        try {
          setWishlistItems(JSON.parse(localWishlist));
        } catch (err) {
          console.error('Error parsing local wishlist:', err);
          setWishlistItems([]);
          localStorage.removeItem('wishlist');
        }
      } else {
        setWishlistItems([]);
      }
    }
  }, [currentUser]);

  // Fetch wishlist items from the API
  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/wishlist');
      setWishlistItems(response.data.items || []);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // For logged-in users, add to server-side wishlist
        await axios.post('/api/wishlist/add', { product_id: productId });
        await fetchWishlistItems(); // Refresh wishlist
      } else {
        // For guests, store in localStorage
        const isInWishlist = wishlistItems.some(item => item.product_id === productId);
        
        if (!isInWishlist) {
          // Fetch product details
          const productResponse = await axios.get(`/api/products/${productId}`);
          const product = productResponse.data;
          
          const newItem = { product_id: productId, product };
          const updatedWishlist = [...wishlistItems, newItem];
          
          setWishlistItems(updatedWishlist);
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        }
      }
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // For logged-in users, remove from server-side wishlist
        await axios.delete(`/api/wishlist/remove/${productId}`);
        await fetchWishlistItems(); // Refresh wishlist
      } else {
        // For guests, update localStorage
        const updatedWishlist = wishlistItems.filter(item => item.product_id !== productId);
        setWishlistItems(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      }
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  // Move all wishlist items to cart
  const moveAllToCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // For logged-in users, use API
        await axios.post('/api/wishlist/move-to-cart');
        await fetchWishlistItems(); // Refresh wishlist after moving
      } else {
        // For guests, this would require interaction with the CartContext
        // We'll leave this as a placeholder - in a real app, you would use CartContext here
        console.log('Move all to cart for guests not implemented');
      }
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // For logged-in users, use API
        await axios.delete('/api/wishlist/clear');
        setWishlistItems([]);
      } else {
        // For guests, clear localStorage
        setWishlistItems([]);
        localStorage.removeItem('wishlist');
      }
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Merge local wishlist with server wishlist on login
  const mergeWishlist = async () => {
    const localWishlist = localStorage.getItem('wishlist');
    
    if (localWishlist && currentUser) {
      try {
        const items = JSON.parse(localWishlist);
        
        // Add each local item to the server wishlist
        for (const item of items) {
          await axios.post('/api/wishlist/add', { product_id: item.product_id });
        }
        
        // Clear local wishlist
        localStorage.removeItem('wishlist');
        
        // Fetch updated wishlist
        await fetchWishlistItems();
      } catch (err) {
        console.error('Error merging wishlist:', err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveAllToCart,
        clearWishlist,
        mergeWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
