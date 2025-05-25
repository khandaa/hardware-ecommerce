import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', mt: 4, pt: 6, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              HARDWARE STORE
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your one-stop shop for high-quality hardware products with detailed specifications and multiple product images.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" aria-label="YouTube">
                <YouTube />
              </IconButton>
            </Stack>
          </Grid>
          
          {/* Quick links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <nav>
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                variant="body2"
                display="block"
                sx={{ mb: 1 }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to="/products"
                color="inherit"
                variant="body2"
                display="block"
                sx={{ mb: 1 }}
              >
                Products
              </Link>
              <Link
                component={RouterLink}
                to="/cart"
                color="inherit"
                variant="body2"
                display="block"
                sx={{ mb: 1 }}
              >
                Shopping Cart
              </Link>
              <Link
                component={RouterLink}
                to="/login"
                color="inherit"
                variant="body2"
                display="block"
                sx={{ mb: 1 }}
              >
                Login
              </Link>
              <Link
                component={RouterLink}
                to="/register"
                color="inherit"
                variant="body2"
                display="block"
              >
                Register
              </Link>
            </nav>
          </Grid>
          
          {/* Contact info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Email: support@hardwarestore.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Phone: +1 (123) 456-7890
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Address: 123 Hardware St, Tech City, 12345
            </Typography>
            <Typography variant="body2">
              Hours: Mon-Fri 9am-6pm, Sat 10am-4pm
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        
        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2">
            © {currentYear} Hardware Store. All rights reserved.
          </Typography>
          <Box>
            <Link color="inherit" sx={{ mr: 2 }} variant="body2">
              Privacy Policy
            </Link>
            <Link color="inherit" sx={{ mr: 2 }} variant="body2">
              Terms of Service
            </Link>
            <Link color="inherit" variant="body2">
              Sitemap
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
