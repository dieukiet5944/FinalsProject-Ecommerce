import nodemailer from 'nodemailer';
import { mailTransporter } from '../config/mail.js';

export const emailService = {
    sendOTPEmail: async (toEmail, otp) => {
        const mailOptions = {
            from: `"The Crumb & Bean" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'YOUR PASSWORD VERIFICATION CODE',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We have received a password change request from your account. Please use the OTP code below to proceed:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #d9534f; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #777; font-size: 12px;">This OTP code is valid within <b>5 minutes</b>. If you are not making this request, please ignore this email.</p>
                </div>
            `
        };
        return await mailTransporter.sendMail(mailOptions);
    }
};