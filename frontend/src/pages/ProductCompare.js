import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Rating,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Home,
  NavigateNext,
  CompareArrows
} from '@mui/icons-material';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { formatPrice } from '../utils/productUtils';
import { handleApiError } from '../utils/errorHandler';

const ProductCompare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const productIds = searchParams.getAll('ids');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSpecs, setAllSpecs] = useState([]);

  const { addToCart } = useContext(CartContext);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!productIds.length) {
          setError("No products selected for comparison");
          setLoading(false);
          return;
        }

        const requests = productIds.map(id => axios.get(`/api/products/${id}`));
        const responses = await Promise.all(requests);
        const fetchedProducts = responses.map(res => res.data);
        setProducts(fetchedProducts);

        // Extract all unique specification keys
        const allSpecKeys = new Set();
        fetchedProducts.forEach(product => {
          if (product.specifications) {
            Object.keys(product.specifications).forEach(key => allSpecKeys.add(key));
          }
        });
        setAllSpecs(Array.from(allSpecKeys).sort());

      } catch (err) {
        handleApiError(err, setError);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productIds]);

  const handleAddToCart = (productId) => {
    addToCart(productId);
  };

  const handleToggleWishlist = (productId) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleRemoveFromComparison = (productId) => {
    const updatedIds = productIds.filter(id => id !== productId.toString());
    if (updatedIds.length > 0) {
      const searchParams = new URLSearchParams();
      updatedIds.forEach(id => searchParams.append('ids', id));
      navigate(`/compare?${searchParams.toString()}`);
    } else {
      navigate('/products');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          component={RouterLink} 
          to="/products" 
          variant="contained" 
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">No products selected for comparison</Alert>
        <Button 
          component={RouterLink} 
          to="/products" 
          variant="contained" 
          sx={{ mt: 2 }}
        >
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Typography color="text.primary">Compare</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <CompareArrows sx={{ mr: 1 }} />
        Product Comparison
      </Typography>

      <Paper elevation={3} sx={{ mb: 4, overflow: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Product</TableCell>
                {products.map(product => (
                  <TableCell key={product.id} align="center" sx={{ minWidth: 250 }}>
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromComparison(product.id)}
                        sx={{ position: 'absolute', top: -10, right: -10 }}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                      <Box
                        component="img"
                        src={product.image_url || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        sx={{ 
                          height: 150, 
                          width: '100%', 
                          objectFit: 'contain',
                          mb: 2
                        }}
                      />
                      <Typography
                        variant="h6"
                        component={RouterLink}
                        to={`/products/${product.id}`}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'inherit',
                          display: 'block',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Price */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Price</TableCell>
                {products.map(product => (
                  <TableCell key={`${product.id}-price`} align="center">
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(product.price)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Rating */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Rating</TableCell>
                {products.map(product => (
                  <TableCell key={`${product.id}-rating`} align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Rating value={product.rating || 0} precision={0.5} readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({product.review_count || 0})
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Availability */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Availability</TableCell>
                {products.map(product => (
                  <TableCell key={`${product.id}-stock`} align="center">
                    {product.stock_quantity > 0 ? (
                      <Chip label="In Stock" color="success" size="small" />
                    ) : (
                      <Chip label="Out of Stock" color="error" size="small" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Brand */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Brand</TableCell>
                {products.map(product => (
                  <TableCell key={`${product.id}-brand`} align="center">
                    {product.brand || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Category */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Category</TableCell>
                {products.map(product => (
                  <TableCell key={`${product.id}-category`} align="center">
                    {product.category || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Specifications */}
              {allSpecs.map(spec => (
                <TableRow key={spec}>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                    {spec.charAt(0).toUpperCase() + spec.slice(1).replace(/_/g, ' ')}
                  </TableCell>
                  {products.map(product => (
                    <TableCell key={`${product.id}-${spec}`} align="center">
                      {product.specifications && product.specifications[spec] 
                        ? product.specifications[spec] 
                        : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {/* Actions */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Actions</TableCell>
                {products.map(product => (
                  <TableCell key={`${product.id}-actions`} align="center">
                    <Grid container spacing={1} justifyContent="center">
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock_quantity <= 0}
                          size="small"
                        >
                          Add to Cart
                        </Button>
                      </Grid>
                      <Grid item>
                        <IconButton
                          color="error"
                          onClick={() => handleToggleWishlist(product.id)}
                          size="small"
                        >
                          {isInWishlist(product.id) ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                      </Grid>
                    </Grid>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/products"
        >
          Back to Products
        </Button>
      </Box>
    </Container>
  );
};

export default ProductCompare;
