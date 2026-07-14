import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { jwtHelper } from '../utils/jwt.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authService = {

    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hashingPassword = await bcrypt.hash(password, salt);
        return { salt, hashingPassword };
    },


    verifyGoogleToken: async (credential) => {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    },


    generateAuthTokens: (payload) => {
        const accessToken = jwtHelper.generateAccessToken(payload);
        const refreshToken = jwtHelper.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    },

    verifyResetToken: (token) => {
        return jwtHelper.verifyAccessToken(token);
    }
};