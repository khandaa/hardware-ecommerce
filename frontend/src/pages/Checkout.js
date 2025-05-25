import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import {
  Person,
  LocalShipping,
  Payment,
  CheckCircle
} from '@mui/icons-material';

const steps = ['Shipping Information', 'Payment Method', 'Order Confirmation'];

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { cartItems, totalAmount, clearCart } = useContext(CartContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Shipping information state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [orderId, setOrderId] = useState(null);
  
  // Razorpay options
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  
  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingInfo[field]) {
        setError(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
        return false;
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate phone (simple validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };
  
  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate shipping information
      if (!validateShippingInfo()) {
        return;
      }
    }
    
    if (activeStep === 1) {
      // Create order and initialize payment
      try {
        setLoading(true);
        setError(null);
        
        // Prepare shipping address string
        const shippingAddress = `${shippingInfo.firstName} ${shippingInfo.lastName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.zipCode}, ${shippingInfo.country}. Phone: ${shippingInfo.phone}`;
        
        // Create order
        const orderResponse = await axios.post('/api/orders', {
          shipping_address: shippingAddress
        });
        
        const newOrderId = orderResponse.data.order.id;
        setOrderId(newOrderId);
        
        // Initialize Razorpay payment
        const paymentResponse = await axios.post(`/api/payment/create-order/${newOrderId}`);
        
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID, // This should be set in your .env file
          amount: paymentResponse.data.amount * 100, // Amount in paise
          currency: paymentResponse.data.currency,
          name: 'Hardware Store',
          description: `Order #${newOrderId}`,
          order_id: paymentResponse.data.order_id,
          handler: function(response) {
            handlePaymentSuccess(newOrderId, response);
          },
          prefill: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email,
            contact: shippingInfo.phone
          },
          notes: {
            order_id: newOrderId
          },
          theme: {
            color: '#1976d2'
          }
        };
        
        setRazorpayOptions(options);
        
        // Move to next step
        setActiveStep(prevStep => prevStep + 1);
      } catch (err) {
        console.error('Error creating order:', err);
        setError(err.response?.data?.message || 'Failed to create order. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Just move to next step
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const openRazorpayCheckout = () => {
    if (!razorpayOptions) {
      setError('Payment initialization failed. Please try again.');
      return;
    }
    
    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();
  };
  
  const handlePaymentSuccess = async (orderId, response) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verify payment with backend
      await axios.post('/api/payment/verify', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: orderId
      });
      
      // Clear cart
      clearCart();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Payment successful! Your order has been placed.',
        severity: 'success'
      });
      
      // Redirect to order success page
      navigate('/order-success', { state: { orderId } });
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Calculate totals
  const subtotal = totalAmount;
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;
  
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            {/* Step 1: Shipping Information */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Shipping Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="State"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Zip Code"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingInfoChange}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Step 2: Payment Method */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Payment sx={{ mr: 1 }} />
                  Payment Method
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select Payment Method</FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <FormControlLabel
                      value="razorpay"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <img src="/images/razorpay.png" alt="Razorpay" width="80" style={{ marginRight: 8 }} />
                          <Typography>Razorpay (Credit/Debit Card, UPI, Netbanking)</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="cod"
                      control={<Radio />}
                      label="Cash on Delivery"
                      disabled
                    />
                  </RadioGroup>
                </FormControl>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    By proceeding with the payment, you agree to our Terms of Service and Privacy Policy.
                  </Typography>
                </Box>
              </Box>
            )}
            
            {/* Step 3: Order Confirmation */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ mr: 1 }} />
                  Order Confirmation
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Information:
                </Typography>
                <Typography variant="body1" paragraph>
                  {shippingInfo.firstName} {shippingInfo.lastName}<br />
                  {shippingInfo.address}<br />
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                  {shippingInfo.country}<br />
                  Phone: {shippingInfo.phone}<br />
                  Email: {shippingInfo.email}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Payment Method:
                </Typography>
                <Typography variant="body1" paragraph>
                  {paymentMethod === 'razorpay' ? 'Razorpay (Credit/Debit Card, UPI, Netbanking)' : 'Cash on Delivery'}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Order Summary:
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {cartItems.map((item) => (
                    <Box
                      key={item.product_id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                        pb: 1,
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      <Typography variant="body2">
                        {item.product.name} x {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={openRazorpayCheckout}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                </Button>
              </Box>
            )}
            
            {/* Navigation Buttons */}
            {activeStep !== 2 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Next'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping</Typography>
                <Typography variant="body1">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Tax (18%)</Typography>
                <Typography variant="body1">${tax.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">${total.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <LocalShipping sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Free shipping on all orders
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                All prices are inclusive of tax.
              </Typography>
            </CardContent>
          </Card>
          
          {/* Items Preview */}
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Items in Cart ({cartItems.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {cartItems.map((item) => (
                <Box
                  key={item.product_id}
                  sx={{
                    display: 'flex',
                    mb: 2,
                    pb: 2,
                    borderBottom: item !== cartItems[cartItems.length - 1] ? '1px solid #eee' : 'none'
                  }}
                >
                  <Box
                    component="img"
                    src={(item.product.images && item.product.images.length > 0)
                      ? item.product.images[0].image_url
                      : '/images/placeholder.png'}
                    alt={item.product.name}
                    sx={{ width: 50, height: 50, mr: 2, objectFit: 'contain' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {item.product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Checkout;
