// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export default cloudinary;


import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.util.js';

class CloudinaryConfig {
  private static instance: CloudinaryConfig;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): CloudinaryConfig {
    if (!CloudinaryConfig.instance) {
      CloudinaryConfig.instance = new CloudinaryConfig();
    }
    return CloudinaryConfig.instance;
  }

  private initialize(): void {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key: process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
        secure: true,
      });
      logger.info('Cloudinary configured successfully');
    } catch (error) {
      logger.error('Failed to configure Cloudinary:', error);
      throw error;
    }
  }

  public getInstance() {
    return cloudinary;
  }
}

export default CloudinaryConfig.getInstance().getInstance();


