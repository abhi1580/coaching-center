import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a test file
const testFilePath = path.join(process.cwd(), 'test-file.txt');
fs.writeFileSync(testFilePath, 'Test content for Cloudinary upload');

// Log configuration
console.log('Cloudinary Configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
});

// Test Cloudinary upload
async function testCloudinaryUpload() {
  try {
    console.log('Starting Cloudinary upload test...');
    
    const result = await cloudinary.uploader.upload(testFilePath, {
      folder: 'test',
      resource_type: 'raw'
    });
    
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url
    });
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('Test file cleaned up');
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Clean up test file on error
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('Test file cleaned up');
    }
    
    throw error;
  }
}

// Run the test
testCloudinaryUpload()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(() => {
    console.log('Test failed');
    process.exit(1);
  }); 