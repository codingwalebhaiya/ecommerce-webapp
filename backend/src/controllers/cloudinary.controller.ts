import { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";

export const generateUploadSignature = async (
  req: Request,
  res: Response
) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "ecommerce/products",
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    res.status(200).json({
      success: true,
      data: {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signature generation failed",
    });
  }
};


export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};