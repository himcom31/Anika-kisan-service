const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Temp disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'uploads/temp/';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only jpg/jpeg/png/webp allowed'), false);
  },
});

// Sharp compress → WebP max 40KB
const compressToWebp = async (inputPath) => {
  let quality = 80;
  let outputBuffer;
  do {
    outputBuffer = await sharp(inputPath)
      .resize({ width: 1280, height: 960, fit: 'inside' })
      .webp({ quality })
      .toBuffer();
    if (outputBuffer.length <= 40 * 1024) break;
    quality -= 5;
  } while (quality >= 10);
  return outputBuffer;
};

// Buffer → Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

// Single file process
const processFile = async (file, folder) => {
  const buffer = await compressToWebp(file.path);
  const result = await uploadToCloudinary(buffer, folder);
  fs.unlinkSync(file.path);
  return result.secure_url;
};

// Middleware: upload.single + compress (brand logo ke liye)
const compressAndUpload = (fieldName, folder = 'ReadyGrocery/Brands') => [
  upload.single(fieldName),
  async (req, res, next) => {
    if (!req.file) return next();
    try {
      req.file.path = await processFile(req.file, folder);
      next();
    } catch (err) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      next(err);
    }
  },
];

// Middleware: upload.fields + compress (product thumbnail + additionalImages ke liye)
const compressAndUploadFields = (fields, folder = 'ReadyGrocery/Products') => [
  upload.fields(fields),
  async (req, res, next) => {
    if (!req.files) return next();
    try {
      for (const fieldName of Object.keys(req.files)) {
        req.files[fieldName] = await Promise.all(
          req.files[fieldName].map(async (file) => {
            file.path = await processFile(file, folder);
            return file;
          })
        );
      }
      next();
    } catch (err) {
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      next(err);
    }
  },
];

module.exports = {
  upload,
  compressAndUpload,
  compressAndUploadFields,
  // Backward compatibility — baaki purani routes ke liye
  single: upload.single.bind(upload),
  fields: upload.fields.bind(upload),
  array:  upload.array.bind(upload),
};