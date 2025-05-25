import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
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
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Home,
  NavigateNext,
  ShoppingBag,
  Inventory,
  LocalShipping,
  CheckCircle,
  ArrowBack
} from '@mui/icons-material';

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

// Order status steps
const orderSteps = ['Pending', 'Paid', 'Shipped', 'Delivered'];

// Helper function to get active step
const getActiveStep = (status) => {
  switch (status) {
    case 'pending':
      return 0;
    case 'paid':
      return 1;
    case 'shipped':
      return 2;
    case 'delivered':
      return 3;
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || 'Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Order not found'}</Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            component={RouterLink}
            to="/orders"
            startIcon={<ArrowBack />}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Calculate totals
  const subtotal = order.order_items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  const tax = subtotal * 0.18; // 18% tax
  
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
        <Link
          component={RouterLink}
          to="/orders"
          color="inherit"
        >
          My Orders
        </Link>
        <Typography color="text.primary">Order #{order.id}</Typography>
      </Breadcrumbs>
      
      {/* Order header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingBag sx={{ mr: 1 }} />
          Order #{order.id}
        </Typography>
        <Button
          component={RouterLink}
          to="/orders"
          startIcon={<ArrowBack />}
          sx={{ mb: 1 }}
        >
          Back to Orders
        </Button>
      </Box>
      
      {/* Order Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
              <Typography variant="body1">{formatDate(order.created_at)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Order Status</Typography>
              <Chip
                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                color={getStatusColor(order.status)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Payment ID</Typography>
              <Typography variant="body1">{order.payment_id || 'N/A'}</Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <Box sx={{ mt: 4 }}>
            <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
              {orderSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
        
        {/* Cancelled Status */}
        {order.status === 'cancelled' && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography variant="subtitle1" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ mr: 1 }} />
              This order has been cancelled
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Order Details */}
      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: { xs: 3, md: 0 } }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Order Items</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.order_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            src={(item.product?.images && item.product.images.length > 0)
                              ? item.product.images[0].image_url
                              : '/images/placeholder.png'}
                            alt={item.product?.name || 'Product'}
                            sx={{ width: 50, height: 50, mr: 2, objectFit: 'contain' }}
                          />
                          <Box>
                            <Typography
                              component={RouterLink}
                              to={`/products/${item.product_id}`}
                              variant="subtitle2"
                              sx={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {item.product?.name || `Product #${item.product_id}`}
                            </Typography>
                            {item.product?.specifications && (
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
                      <TableCell align="center">${item.price.toFixed(2)}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
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
                <Typography variant="body1">Free</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Tax (18%)</Typography>
                <Typography variant="body1">${tax.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">${order.total_amount.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* Shipping Information */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping sx={{ mr: 1, fontSize: 20 }} />
                Shipping Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                {order.shipping_address}
              </Typography>
              
              {order.status === 'shipped' || order.status === 'delivered' ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tracking Information
                  </Typography>
                  <Chip 
                    label="ABC123456789" 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                    clickable
                  />
                </Box>
              ) : null}
            </CardContent>
          </Card>
          
          {/* Additional Actions */}
          <Box sx={{ mt: 2 }}>
            {order.status === 'pending' && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mb: 1 }}
              >
                Cancel Order
              </Button>
            )}
            <Button
              variant="outlined"
              fullWidth
            >
              Need Help?
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Additional Information */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" paragraph>
          If you have any questions or issues with this order, please contact our customer support:
        </Typography>
        <Typography variant="body2" paragraph>
          Email: support@hardwarestore.com | Phone: +1 (123) 456-7890
        </Typography>
        <Typography variant="body2">
          Please include your order number (#{order.id}) in all communications.
        </Typography>
      </Paper>
    </Container>
  );
};

export default OrderDetail;
