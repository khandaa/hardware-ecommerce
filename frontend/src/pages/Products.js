import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home, NavigateNext } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const { category } = useParams();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [search, setSearch] = useState(searchQuery || '');
  
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);
  
  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        let url = `/api/products?page=${page}&per_page=12`;
        
        if (selectedCategory && selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        
        // Add additional query parameters based on filters
        // Note: These would need to be implemented on the backend
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        
        const response = await axios.get(url);
        setProducts(response.data.products);
        setTotalPages(response.data.pages);
        setTotalProducts(response.data.total);
        
        // Determine max price for filter
        if (response.data.products.length > 0) {
          const highestPrice = Math.max(...response.data.products.map(p => p.price));
          setMaxPrice(Math.ceil(highestPrice / 100) * 100); // Round up to nearest 100
          setPriceRange([0, highestPrice]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [page, selectedCategory, search]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1); // Reset to first page when changing category
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    // In a real application, this would trigger a re-fetch with sorting
  };
  
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    // In a real application, this would trigger a re-fetch with price filter
  };
  
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1); // Reset to first page when searching
    // The useEffect hook will handle the actual search
  };
  
  // Function to sort products based on selected sort option
  const getSortedProducts = () => {
    switch (sortBy) {
      case 'price_low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price_high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name_asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
      default:
        return [...products].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }
  };
  
  // Filter products by price range
  const getFilteredProducts = () => {
    return getSortedProducts().filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
  };
  
  // Page title based on current category
  const getPageTitle = () => {
    if (search) {
      return `Search Results for "${search}"`;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Hardware`;
    }
    return 'All Hardware Products';
  };
  
  if (loading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const filteredProducts = getFilteredProducts();

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
        {category ? (
          <>
            <Link component={RouterLink} to="/products" color="inherit">
              Products
            </Link>
            <Typography color="text.primary">{category}</Typography>
          </>
        ) : (
          <Typography color="text.primary">Products</Typography>
        )}
      </Breadcrumbs>

      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom>
        {getPageTitle()}
      </Typography>
      
      {/* Search bar and results count */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Search Products"
                variant="outlined"
                value={search}
                onChange={handleSearchChange}
                size="small"
              />
            </form>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredProducts.length} of {totalProducts} products
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Filters Column */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Category Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={selectedCategory}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Price Range Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography id="price-range-slider" gutterBottom>
                Price Range
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={maxPrice}
                aria-labelledby="price-range-slider"
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">${priceRange[0]}</Typography>
                <Typography variant="body2">${priceRange[1]}</Typography>
              </Box>
            </Box>
            
            {/* Sort By Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="name_asc">Name: A to Z</MenuItem>
                  <MenuItem value="name_desc">Name: Z to A</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Active Filters */}
            {(selectedCategory !== 'all' || search || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedCategory !== 'all' && (
                    <Chip 
                      label={`Category: ${selectedCategory}`} 
                      onDelete={() => setSelectedCategory('all')} 
                      size="small" 
                    />
                  )}
                  {search && (
                    <Chip 
                      label={`Search: ${search}`} 
                      onDelete={() => setSearch('')} 
                      size="small" 
                    />
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <Chip 
                      label={`Price: $${priceRange[0]} - $${priceRange[1]}`} 
                      onDelete={() => setPriceRange([0, maxPrice])} 
                      size="small" 
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search criteria
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Products;
