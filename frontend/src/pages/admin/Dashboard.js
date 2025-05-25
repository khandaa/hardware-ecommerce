import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ShoppingBag,
  People,
  Inventory,
  AttachMoney,
  TrendingUp,
  Category,
  DateRange,
  ShoppingCart
} from '@mui/icons-material';

// Dashboard stats card component
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, you would have an endpoint to fetch all dashboard data
        // For demonstration, we'll use separate endpoints
        
        // Fetch stats (in a real app, this would be a single API call)
        const ordersResponse = await axios.get('/api/orders/admin?per_page=5');
        const productsResponse = await axios.get('/api/products?per_page=100');
        
        // Calculate stats
        const totalOrders = ordersResponse.data.total || 0;
        const totalRevenue = ordersResponse.data.orders.reduce(
          (sum, order) => sum + order.total_amount, 0
        );
        const totalProducts = productsResponse.data.total || 0;
        const totalUsers = 20; // Hardcoded for demo; would come from a users API
        
        setStats({
          totalOrders,
          totalRevenue,
          totalProducts,
          totalUsers
        });
        
        // Set recent orders
        setRecentOrders(ordersResponse.data.orders.slice(0, 5));
        
        // Set top products (normally would be sorted by sales, but we'll just use the first few)
        setTopProducts(productsResponse.data.products.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingBag />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={<AttachMoney />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={<Inventory />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={stats.totalUsers}
            icon={<People />}
            color="error.main"
          />
        </Grid>
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={4}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Recent Orders
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/orders"
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentOrders.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No orders found
              </Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {recentOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <ListItem
                      button
                      component={RouterLink}
                      to={`/orders/${order.id}`}
                      alignItems="flex-start"
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ShoppingCart />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${order.id}`}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ${order.total_amount.toFixed(2)}
                            </Typography>
                            {" — "}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {new Date(order.created_at).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Top Products
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/products"
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {topProducts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No products found
              </Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {topProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    <ListItem
                      button
                      component={RouterLink}
                      to={`/products/${product.id}`}
                      alignItems="flex-start"
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={(product.images && product.images.length > 0) ? product.images[0].image_url : ''}
                          alt={product.name}
                          variant="rounded"
                        >
                          <Inventory />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ${product.price.toFixed(2)}
                            </Typography>
                            {" — "}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Stock: {product.stock}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Category: {product.category}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/admin/products/new"
              variant="outlined"
              fullWidth
              startIcon={<Inventory />}
              sx={{ height: '100%' }}
            >
              Add Product
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/admin/orders"
              variant="outlined"
              fullWidth
              startIcon={<ShoppingBag />}
              sx={{ height: '100%' }}
            >
              Manage Orders
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/admin/categories"
              variant="outlined"
              fullWidth
              startIcon={<Category />}
              sx={{ height: '100%' }}
            >
              Categories
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              component={RouterLink}
              to="/admin/reports"
              variant="outlined"
              fullWidth
              startIcon={<TrendingUp />}
              sx={{ height: '100%' }}
            >
              Sales Reports
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard;
