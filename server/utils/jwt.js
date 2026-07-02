import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

const ACCESS_TOKEN_EXPIRES_IN = '15m'; 
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const jwtHelper = {
  generateAccessToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
  },

  generateRefreshToken: (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
  },

  verifyAccessToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },

  verifyRefreshToken: (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  },

  getAccessTokenExpiresIn: () => ACCESS_TOKEN_EXPIRES_IN,
  getRefreshTokenExpiresIn: () => REFRESH_TOKEN_EXPIRES_IN
};

export { jwtHelper, JWT_SECRET, JWT_REFRESH_SECRET };