import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Divider,
  Avatar,
  Grid,
  Chip,
  LinearProgress,
  Stack
} from '@mui/material';
import { Star, VerifiedUser, ThumbUp } from '@mui/icons-material';

const ReviewList = ({ reviews = [], productRating = 0 }) => {
  // Calculate rating statistics
  const totalReviews = reviews.length;
  const ratingCounts = {
    5: reviews.filter(review => review.rating === 5).length,
    4: reviews.filter(review => review.rating === 4).length,
    3: reviews.filter(review => review.rating === 3).length,
    2: reviews.filter(review => review.rating === 2).length,
    1: reviews.filter(review => review.rating === 1).length
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Customer Reviews
      </Typography>
      
      {totalReviews > 0 ? (
        <>
          {/* Rating summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" component="div" color="primary" fontWeight="bold">
                  {productRating.toFixed(1)}
                </Typography>
                <Rating
                  value={productRating}
                  precision={0.5}
                  readOnly
                  icon={<Star fontSize="inherit" />}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ width: '100%' }}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1, minWidth: '30px' }}>
                      {rating}
                    </Typography>
                    <Star fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <LinearProgress
                      variant="determinate"
                      value={(ratingCounts[rating] / totalReviews) * 100}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ ml: 2, minWidth: '40px' }}>
                      {ratingCounts[rating]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Individual reviews */}
          {reviews.map((review) => (
            <Box key={review.id} sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar 
                      alt={review.user?.first_name || 'User'} 
                      src={review.user?.avatar_url} 
                      sx={{ width: 56, height: 56, mb: 1 }}
                    />
                    <Typography variant="subtitle2">
                      {review.user?.first_name} {review.user?.last_name?.charAt(0)}.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.created_at)}
                    </Typography>
                    {review.verified_purchase && (
                      <Chip 
                        icon={<VerifiedUser fontSize="small" />}
                        label="Verified Purchase"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {review.comment}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<ThumbUp fontSize="small" />}
                      label={`Helpful (${review.helpful_count || 0})`}
                      size="small"
                      variant="outlined"
                      onClick={() => {}} // Would add API call to mark as helpful
                    />
                  </Stack>
                </Grid>
              </Grid>
              
              {reviews.indexOf(review) < reviews.length - 1 && (
                <Divider sx={{ my: 3 }} />
              )}
            </Box>
          ))}
        </>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ReviewList;
