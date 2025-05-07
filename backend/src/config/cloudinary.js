import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure default upload options
cloudinary.config({
  ...cloudinary.config(),
  upload_preset: 'notes_preset',
  format: 'pdf',
  resource_type: 'raw',
  transformation: [{ fetch_format: 'pdf' }]
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'notes',
    resource_type: 'raw',
    allowed_formats: ['pdf']
  }
});

const upload = multer({ storage: storage });

export { cloudinary, upload }; 