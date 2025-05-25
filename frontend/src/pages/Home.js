import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import { ArrowForward, Category } from '@mui/icons-material';
import Carousel from 'react-material-ui-carousel';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch featured products (first page, limited to 8)
        const productsResponse = await axios.get('/api/products?page=1&per_page=8');
        setFeaturedProducts(productsResponse.data.products);
        
        // Fetch categories
        const categoriesResponse = await axios.get('/api/products/categories');
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Banner slides for carousel
  const bannerSlides = [
    {
      image: '/images/banner1.jpg',
      title: 'Quality Hardware Products',
      description: 'Explore our wide range of high-quality hardware items for your projects',
      buttonText: 'Shop Now',
      buttonLink: '/products'
    },
    {
      image: '/images/banner2.jpg',
      title: 'Professional Tools',
      description: 'Find the right tools for your professional needs',
      buttonText: 'Discover Tools',
      buttonLink: '/products/category/tools'
    },
    {
      image: '/images/banner3.jpg',
      title: 'Special Offers',
      description: 'Limited time discounts on selected items',
      buttonText: 'See Offers',
      buttonLink: '/products'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Carousel */}
      <Carousel
        animation="slide"
        indicators={true}
        navButtonsAlwaysVisible={true}
        autoPlay={true}
        interval={6000}
      >
        {bannerSlides.map((slide, i) => (
          <Paper 
            key={i}
            sx={{
              position: 'relative',
              height: { xs: '30vh', sm: '40vh', md: '50vh' },
              backgroundColor: 'grey.800',
              color: '#fff',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: `url(${slide.image || '/images/placeholder-banner.jpg'})`,
              backgroundRepeat: 'no-repeat'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                backgroundColor: 'rgba(0,0,0,.3)',
              }}
            />
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                padding: { xs: 3, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                maxWidth: { xs: '100%', sm: '80%', md: '50%' }
              }}
            >
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                {slide.title}
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                {slide.description}
              </Typography>
              <Button 
                component={RouterLink} 
                to={slide.buttonLink}
                variant="contained" 
                size="large"
                sx={{ alignSelf: 'flex-start', mt: 2 }}
              >
                {slide.buttonText}
              </Button>
            </Box>
          </Paper>
        ))}
      </Carousel>

      {/* Categories Section */}
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Shop by Category
          </Typography>
          <Button 
            component={RouterLink} 
            to="/products" 
            endIcon={<ArrowForward />}
          >
            View All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {categories.slice(0, 6).map((category, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Card 
                component={RouterLink}
                to={`/products/category/${category}`}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    pt: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }}
                >
                  <Category sx={{ 
                    position: 'absolute',
                    fontSize: 60
                  }} />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {category}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Featured Products
            </Typography>
            <Button 
              component={RouterLink} 
              to="/products" 
              endIcon={<ArrowForward />}
            >
              View All Products
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {featuredProducts.slice(0, 8).map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Why Choose Us
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <img src="/images/quality.png" alt="Quality" style={{ width: 80, height: 80, marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                High Quality
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We source only the highest quality hardware products from trusted manufacturers
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <img src="/images/shipping.png" alt="Shipping" style={{ width: 80, height: 80, marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                Fast Shipping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quick delivery to your doorstep with tracking on all orders
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <img src="/images/support.png" alt="Support" style={{ width: 80, height: 80, marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                24/7 Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our customer support team is available round the clock to assist you
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <img src="/images/secure.png" alt="Secure Payment" style={{ width: 80, height: 80, marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                Secure Payment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Safe and secure payment processing with Razorpay
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
