import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Divider,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Home,
  NavigateNext,
  ShoppingCart,
  Add,
  Remove,
  Favorite,
  Share,
  CompareArrows
} from '@mui/icons-material';
import Carousel from 'react-material-ui-carousel';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        
        // Fetch related products (same category)
        if (response.data.category) {
          const relatedResponse = await axios.get(`/api/products?category=${response.data.category}&per_page=4`);
          // Filter out the current product
          const filtered = relatedResponse.data.products.filter(
            p => p.id !== parseInt(id)
          );
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      // Show a confirmation popup or notification here
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      addToCart(product.id, quantity);
      navigate('/checkout');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
      </Container>
    );
  }
  
  // Parse specifications
  const specs = typeof product.specifications === 'string' 
    ? JSON.parse(product.specifications) 
    : product.specifications;
  
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
          to="/products"
          color="inherit"
        >
          Products
        </Link>
        {product.category && (
          <Link
            component={RouterLink}
            to={`/products/category/${product.category}`}
            color="inherit"
          >
            {product.category}
          </Link>
        )}
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            {product.images && product.images.length > 0 ? (
              <Carousel
                animation="slide"
                autoPlay={false}
                indicators={true}
                navButtonsAlwaysVisible={true}
                sx={{ mb: 2 }}
              >
                {product.images.map((image, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={image.image_url}
                    alt={`${product.name} - Image ${i + 1}`}
                    sx={{
                      width: '100%',
                      height: 400,
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                ))}
              </Carousel>
            ) : (
              <Box
                component="img"
                src="/images/placeholder.png"
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            )}
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 1, py: 1 }}>
                {product.images.map((image, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={image.image_url}
                    alt={`Thumbnail ${i + 1}`}
                    sx={{
                      width: 70,
                      height: 70,
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
          
          {/* Product Quick Specs */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Specifications
            </Typography>
            <Grid container spacing={2}>
              {specs && specs.size && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Size</Typography>
                  <Typography variant="body2">{specs.size}</Typography>
                </Grid>
              )}
              {specs && specs.quantity && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Quantity in Package</Typography>
                  <Typography variant="body2">{specs.quantity}</Typography>
                </Grid>
              )}
              {specs && specs.material && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Material</Typography>
                  <Typography variant="body2">{specs.material}</Typography>
                </Grid>
              )}
              {specs && specs.weight && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Weight</Typography>
                  <Typography variant="body2">{specs.weight}</Typography>
                </Grid>
              )}
              {product.category && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body2">{product.category}</Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="subtitle2">Availability</Typography>
                <Chip 
                  label={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
                  color={product.stock > 0 ? 'success' : 'error'} 
                  size="small" 
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                (24 Reviews)
              </Typography>
            </Box>
            
            <Typography variant="h4" color="primary" gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Quantity Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quantity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={decreaseQuantity} 
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={handleQuantityChange}
                  type="number"
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 1, max: product.stock, style: { textAlign: 'center' } }}
                  sx={{ width: 60, mx: 1 }}
                />
                <IconButton 
                  onClick={increaseQuantity} 
                  disabled={quantity >= product.stock}
                  size="small"
                >
                  <Add />
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {product.stock} items available
                </Typography>
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                sx={{ flex: { xs: '1 0 100%', sm: '1 0 auto' } }}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                sx={{ flex: { xs: '1 0 100%', sm: '1 0 auto' } }}
              >
                Buy Now
              </Button>
            </Box>
            
            {/* Secondary Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button startIcon={<Favorite />} color="inherit" size="small">
                Add to Wishlist
              </Button>
              <Button startIcon={<CompareArrows />} color="inherit" size="small">
                Compare
              </Button>
              <Button startIcon={<Share />} color="inherit" size="small">
                Share
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Product Information Tabs */}
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="product information tabs"
        >
          <Tab label="Description" id="tab-0" />
          <Tab label="Specifications" id="tab-1" />
          <Tab label="Reviews" id="tab-2" />
          <Tab label="Shipping & Returns" id="tab-3" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Description Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Description
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              {/* Additional description content would go here */}
            </Box>
          )}
          
          {/* Specifications Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Detailed Specifications
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    {specs && Object.entries(specs).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell component="th" scope="row" sx={{ width: '30%', fontWeight: 'bold' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '30%', fontWeight: 'bold' }}>
                        Product ID
                      </TableCell>
                      <TableCell>{product.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '30%', fontWeight: 'bold' }}>
                        Category
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" paragraph>
                  No reviews yet. Be the first to review this product!
                </Typography>
                <Button variant="contained">Write a Review</Button>
              </Box>
            </Box>
          )}
          
          {/* Shipping & Returns Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Shipping & Returns
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Information
              </Typography>
              <Typography variant="body1" paragraph>
                We ship to all major cities in India. Standard shipping takes 3-5 business days.
                Express shipping options are available at checkout.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Return Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We accept returns within 30 days of delivery for most items.
                Please ensure the product is in its original packaging and unused condition.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Related Products
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                <Paper sx={{ p: 2 }}>
                  <Box
                    component="img"
                    src={(relatedProduct.images && relatedProduct.images.length > 0) 
                      ? relatedProduct.images[0].image_url 
                      : '/images/placeholder.png'}
                    alt={relatedProduct.name}
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'contain',
                      mb: 2
                    }}
                  />
                  <Typography 
                    variant="subtitle1" 
                    component={RouterLink} 
                    to={`/products/${relatedProduct.id}`}
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      display: 'block',
                      mb: 1,
                      height: 48,
                      overflow: 'hidden'
                    }}
                  >
                    {relatedProduct.name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${relatedProduct.price.toFixed(2)}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={`/products/${relatedProduct.id}`}
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    View Details
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetail;
