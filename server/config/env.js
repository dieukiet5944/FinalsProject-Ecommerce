import dotenv from 'dotenv';
dotenv.config(); 

const requiredEnvs = [
    'PORT',
    'MONGODB_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_NAME',
    'CLOUDINARY_KEY',
    'CLOUDINARY_SECRET',
    'FRONTEND_URL',
    'GOOGLE_CLIENT_ID',
    'EMAIL_USER',
    'EMAIL_PASS'
];

const missingEnvs = [];

requiredEnvs.forEach((env) => {
    if (!process.env[env] || process.env[env].trim() === "") {
        missingEnvs.push(env);
    }
});

if (missingEnvs.length > 0) {
    console.error("\n❌ [CRITICAL ERROR] Missing or empty required environment variables:");
    console.error("----------------------------------------------------------------");
    missingEnvs.forEach(env => console.error(`   👉 ${env}`));
    console.error("----------------------------------------------------------------");
    console.error("💡 Please check your .env file. Server lifecycle aborted.\n");
    process.exit(1); 
}

console.log("✅ [SUCCESS] All 11 environment variables validated successfully!");

const env = {
    PORT: parseInt(process.env.PORT, 10) || 8080,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL.trim(),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
};

export default env;