import { Router, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { authenticate, AuthRequest } from "../middleware/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.post("/image", authenticate, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image uploaded" });
      return;
    }

    const { folder = "swiftbyte/misc" } = req.query as Record<string, string>;

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "image", quality: "auto", fetch_format: "auto" },
          (err, result) => {
            if (err || !result) reject(err || new Error("Upload failed"));
            else resolve(result as any);
          }
        );
        stream.write(req.file!.buffer);
        stream.end();
      }
    );

    res.json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Upload failed" });
  }
});

export default router;
