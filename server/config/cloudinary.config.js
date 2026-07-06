import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto',
  },
});
const uploadCloud = multer({ storage: productStorage });

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_avatars', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto',
    transformation: [{ width: 400, height: 400, crop: 'limit' }] 
  },
});
const uploadAvatarCloud = multer({ storage: avatarStorage });

export { uploadCloud, uploadAvatarCloud };