import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper
} from '@mui/material';
import { Home, ArrowBack, Search } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h1" color="primary" sx={{ fontSize: { xs: '6rem', md: '8rem' }, fontWeight: 'bold' }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Box
          component="img"
          src="/images/not-found.png"
          alt="Page not found"
          sx={{
            width: '100%',
            maxWidth: 400,
            height: 'auto',
            my: 4,
            mx: 'auto',
            display: 'block'
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<Home />}
          >
            Back to Home
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/products"
            startIcon={<Search />}
          >
            Browse Products
          </Button>
          
          <Button
            variant="text"
            size="large"
            onClick={() => window.history.back()}
            startIcon={<ArrowBack />}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
