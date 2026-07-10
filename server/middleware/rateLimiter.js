import {rateLimit} from 'express-rate-limit'

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      error: 'Too Many Requests',
      message: 'You have sent too many requests. Please try again in 15 minutes.'
    });
  }
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'fail',
    message: 'You have tried the operation too many times. Please wait 1 minute.'
  }
});

export const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 3,
  message: {
    status: 'fail',
    message: 'You are uploading too quickly. Please wait 1 minute to continue.'
  }
});

