import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  Favorite,
  Home,
  NavigateNext,
  ShoppingCartCheckout
} from '@mui/icons-material';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/productUtils';
import { AuthContext } from '../context/AuthContext';

const Wishlist = () => {
  const { wishlistItems, loading, error, removeFromWishlist, moveAllToCart, clearWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);

  const handleAddToCart = async (productId) => {
    await addToCart(productId);
    await removeFromWishlist(productId);
  };

  const handleMoveAllToCart = async () => {
    // If user is not logged in, we need to add each item to cart manually
    if (!currentUser) {
      for (const item of wishlistItems) {
        await addToCart(item.product_id);
      }
      await clearWishlist();
    } else {
      await moveAllToCart();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Typography color="text.primary">Wishlist</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Favorite sx={{ mr: 1 }} color="error" />
        My Wishlist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : wishlistItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Save items you're interested in by clicking the heart icon on product pages.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={clearWishlist}
              sx={{ mr: 2 }}
            >
              Clear Wishlist
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartCheckout />}
              onClick={handleMoveAllToCart}
            >
              Move All to Cart
            </Button>
          </Box>

          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.product_id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.product.image_url || 'https://via.placeholder.com/300x200'}
                    alt={item.product.name}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component={RouterLink}
                      to={`/products/${item.product_id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {item.product.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                      {formatPrice(item.product.price)}
                    </Typography>
                    {item.product.stock_quantity > 0 ? (
                      <Typography variant="body2" color="success.main">
                        In Stock
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="error">
                        Out of Stock
                      </Typography>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleAddToCart(item.product_id)}
                      disabled={item.product.stock_quantity === 0}
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => removeFromWishlist(item.product_id)}
                      aria-label="remove from wishlist"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Wishlist;
