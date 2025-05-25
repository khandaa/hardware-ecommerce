import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Send, Star } from '@mui/icons-material';
import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/reviews', {
        product_id: productId,
        rating,
        title,
        comment
      });
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      
      // Show success message
      setSuccess(true);
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Your Rating</Typography>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={1}
            icon={<Star fontSize="inherit" />}
            required
            size="large"
          />
        </Box>
        
        <TextField
          label="Review Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
        />
        
        <TextField
          label="Your Review"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
          required
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Submit Review
        </Button>
      </form>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Your review has been submitted successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ReviewForm;
