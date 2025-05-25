import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  IconButton,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Home,
  NavigateNext,
  Delete,
  ShoppingCart,
  Add,
  Remove,
  ArrowBack,
  CreditCard
} from '@mui/icons-material';

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { cartItems, loading, error, totalAmount, removeFromCart, updateCartItem, clearCart } = useContext(CartContext);
  
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  
  const handleQuantityChange = (itemId, event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      updateCartItem(itemId, value);
    }
  };
  
  const increaseQuantity = (item) => {
    if (item.product.stock > item.quantity) {
      updateCartItem(item.product_id, item.quantity + 1);
    }
  };
  
  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      updateCartItem(item.product_id, item.quantity - 1);
    }
  };
  
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setRemovingItemId(null);
  };
  
  const handleClearCart = () => {
    clearCart();
    setOpenClearDialog(false);
  };
  
  const handleCheckout = () => {
    if (currentUser) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">Shopping Cart</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ShoppingCart sx={{ mr: 1 }} />
        Shopping Cart
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" paragraph>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            size="large"
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ mb: { xs: 3, lg: 0 } }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={(item.product.images && item.product.images.length > 0)
                                ? item.product.images[0].image_url
                                : '/images/placeholder.png'}
                              alt={item.product.name}
                              sx={{ width: 70, height: 70, mr: 2, objectFit: 'contain' }}
                            />
                            <Box>
                              <Typography
                                component={RouterLink}
                                to={`/products/${item.product_id}`}
                                variant="subtitle1"
                                sx={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                {item.product.name}
                              </Typography>
                              {item.product.specifications && (
                                <Typography variant="body2" color="text.secondary">
                                  {(() => {
                                    const specs = typeof item.product.specifications === 'string'
                                      ? JSON.parse(item.product.specifications)
                                      : item.product.specifications;
                                    
                                    return (
                                      <>
                                        {specs.size && `Size: ${specs.size}`}
                                        {specs.size && specs.quantity && ' | '}
                                        {specs.quantity && `Qty: ${specs.quantity}`}
                                      </>
                                    );
                                  })()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          ${item.product.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => decreaseQuantity(item)}
                              disabled={item.quantity <= 1}
                              size="small"
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <TextField
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product_id, e)}
                              type="number"
                              variant="outlined"
                              size="small"
                              inputProps={{ 
                                min: 1, 
                                max: item.product.stock, 
                                style: { textAlign: 'center' } 
                              }}
                              sx={{ width: 60, mx: 1 }}
                            />
                            <IconButton
                              onClick={() => increaseQuantity(item)}
                              disabled={item.quantity >= item.product.stock}
                              size="small"
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => setRemovingItemId(item.product_id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  component={RouterLink}
                  to="/products"
                  startIcon={<ArrowBack />}
                >
                  Continue Shopping
                </Button>
                <Button
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setOpenClearDialog(true)}
                >
                  Clear Cart
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">${totalAmount.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping</Typography>
                <Typography variant="body1">Free</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Tax</Typography>
                <Typography variant="body1">
                  ${(totalAmount * 0.18).toFixed(2)}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${(totalAmount + (totalAmount * 0.18)).toFixed(2)}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<CreditCard />}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  We accept:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <img src="/images/visa.png" alt="Visa" width="40" />
                  <img src="/images/mastercard.png" alt="Mastercard" width="40" />
                  <img src="/images/amex.png" alt="American Express" width="40" />
                  <img src="/images/razorpay.png" alt="Razorpay" width="40" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Remove Item Dialog */}
      <Dialog
        open={removingItemId !== null}
        onClose={() => setRemovingItemId(null)}
      >
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovingItemId(null)}>Cancel</Button>
          <Button onClick={() => handleRemoveItem(removingItemId)} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Clear Cart Dialog */}
      <Dialog
        open={openClearDialog}
        onClose={() => setOpenClearDialog(false)}
      >
        <DialogTitle>Clear Cart</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove all items from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearDialog(false)}>Cancel</Button>
          <Button onClick={handleClearCart} color="error" autoFocus>
            Clear Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
