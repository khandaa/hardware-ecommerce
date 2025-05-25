import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const { currentUser } = useContext(AuthContext);
  
  // Fetch cart items when user changes
  useEffect(() => {
    if (currentUser) {
      fetchCartItems();
    } else {
      // If no user, try to get cart from localStorage
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          setCartItems(parsedCart);
          calculateCartTotals(parsedCart);
        } catch (err) {
          console.error('Error parsing local cart:', err);
          localStorage.removeItem('cart');
          setCartItems([]);
          setTotalItems(0);
          setTotalAmount(0);
        }
      } else {
        setCartItems([]);
        setTotalItems(0);
        setTotalAmount(0);
      }
    }
  }, [currentUser]);
  
  // Calculate cart totals
  const calculateCartTotals = (items) => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const amount = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    
    setTotalItems(itemCount);
    setTotalAmount(amount);
  };
  
  // Fetch cart items from API (for logged in users)
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/cart');
      setCartItems(response.data.cart_items);
      setTotalItems(response.data.total_items);
      setTotalAmount(response.data.total_amount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart items');
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // User is logged in, use API
        const response = await axios.post('/api/cart/add', {
          product_id: productId,
          quantity
        });
        
        await fetchCartItems(); // Refresh cart after adding item
      } else {
        // User is not logged in, use localStorage
        const existingItemIndex = cartItems.findIndex(
          item => item.product_id === productId
        );
        
        // Need to fetch product details if not in cart
        if (existingItemIndex === -1) {
          const productResponse = await axios.get(`/api/products/${productId}`);
          const product = productResponse.data;
          
          const newItem = {
            product_id: productId,
            quantity,
            product
          };
          
          const updatedCart = [...cartItems, newItem];
          setCartItems(updatedCart);
          calculateCartTotals(updatedCart);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        } else {
          // Update quantity if product already in cart
          const updatedCart = [...cartItems];
          updatedCart[existingItemIndex].quantity += quantity;
          
          setCartItems(updatedCart);
          calculateCartTotals(updatedCart);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      console.error('Add to cart error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // User is logged in, use API
        await axios.put(`/api/cart/update/${itemId}`, { quantity });
        await fetchCartItems(); // Refresh cart after update
      } else {
        // User is not logged in, use localStorage
        const updatedCart = cartItems.map(item => {
          if (item.product_id === itemId) {
            return { ...item, quantity };
          }
          return item;
        });
        
        setCartItems(updatedCart);
        calculateCartTotals(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart item');
      console.error('Update cart error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // User is logged in, use API
        await axios.delete(`/api/cart/remove/${itemId}`);
        await fetchCartItems(); // Refresh cart after removal
      } else {
        // User is not logged in, use localStorage
        const updatedCart = cartItems.filter(
          item => item.product_id !== itemId
        );
        
        setCartItems(updatedCart);
        calculateCartTotals(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      console.error('Remove from cart error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        // User is logged in, use API
        await axios.delete('/api/cart/clear');
        setCartItems([]);
        setTotalItems(0);
        setTotalAmount(0);
      } else {
        // User is not logged in, use localStorage
        localStorage.removeItem('cart');
        setCartItems([]);
        setTotalItems(0);
        setTotalAmount(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      console.error('Clear cart error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Sync local cart with server after login
  const syncCartWithServer = async () => {
    if (!currentUser || cartItems.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Add each local cart item to server
      for (const item of cartItems) {
        await axios.post('/api/cart/add', {
          product_id: item.product_id,
          quantity: item.quantity
        });
      }
      
      // Clear local cart
      localStorage.removeItem('cart');
      
      // Fetch updated cart from server
      await fetchCartItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync cart with server');
      console.error('Sync cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalItems,
        totalAmount,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        syncCartWithServer
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
