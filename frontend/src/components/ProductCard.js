import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Tooltip
} from '@mui/material';
import { ShoppingCart, Visibility } from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  // Handle both image formats (direct image_url or images array)
  let imageUrl = '/images/placeholder.png';
  
  if (product.image_url) {
    // Direct image URL format from mock server
    imageUrl = product.image_url;
  } else if (product.images && product.images.length > 0) {
    // Images array format
    const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
    imageUrl = primaryImage.image_url;
  }
  
  // Extract specifications
  const specs = typeof product.specifications === 'string' 
    ? JSON.parse(product.specifications) 
    : product.specifications;
  
  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }
    }}>
      {/* Product image */}
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={product.name}
        sx={{ objectFit: 'contain', padding: 1 }}
      />
      
      {/* Product details */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" className="text-truncate-2" sx={{ height: '3rem' }}>
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary" component="div">
            ${product.price.toFixed(2)}
          </Typography>
          <Chip 
            label={product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} 
            color={product.stock_quantity > 0 ? 'success' : 'error'} 
            size="small" 
          />
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Rating value={4.5} precision={0.5} readOnly size="small" />
        </Box>
        
        {/* Display key specifications */}
        <Box sx={{ mb: 1 }}>
          {specs && Object.keys(specs).length > 0 && (
            Object.entries(specs).slice(0, 2).map(([key, value]) => (
              <Tooltip key={key} title={key}>
                <Chip
                  label={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              </Tooltip>
            ))
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" className="text-truncate-3" sx={{ height: '4.5rem' }}>
          {product.description}
        </Typography>
      </CardContent>
      
      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          component={RouterLink}
          to={`/products/${product.id}`}
          size="small"
          startIcon={<Visibility />}
          color="primary"
        >
          View Details
        </Button>
        <Button
          size="small"
          startIcon={<ShoppingCart />}
          variant="contained"
          color="primary"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
