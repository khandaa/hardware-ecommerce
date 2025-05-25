import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle,
  ShoppingBag,
  Home,
  ArrowForward
} from '@mui/icons-material';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'Unknown';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Thank you for your purchase
          </Typography>
          <Typography variant="body1">
            Your order has been received and is now being processed.
          </Typography>
          <Typography variant="body1">
            Order ID: <strong>#{orderId}</strong>
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We've sent an order confirmation email to your registered email address.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipping
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your order will be shipped within 1-2 business days. You will receive tracking information via email.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If you have any questions about your order, please contact our customer support team.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/orders"
            startIcon={<ShoppingBag />}
          >
            View My Orders
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<Home />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          You might also like
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Check out some of our most popular products
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            component={RouterLink}
            to="/products"
            endIcon={<ArrowForward />}
            color="primary"
          >
            Explore Products
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OrderSuccess;
