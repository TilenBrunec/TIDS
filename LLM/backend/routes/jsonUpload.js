const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Temporary upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'songs-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only JSON files
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Samo JSON files so dovoljeni'));
    }
  },
});

/**
 * Konfiguracija routes za JSON upload operacije
 */
function setupJsonUploadRoutes(jsonUploadController) {
  /**
   * POST /api/json-upload/import
   * Upload JSON file in import pesmi v bazo
   *
   * Content-Type: multipart/form-data
   * Body: file (JSON file)
   */
  router.post('/import', upload.single('file'), (req, res) =>
    jsonUploadController.uploadAndImport(req, res)
  );

  /**
   * GET /api/json-upload/info
   * Pridobi informacije o upload procesu
   */
  router.get('/info', (req, res) => jsonUploadController.getUploadInfo(req, res));

  return router;
}

module.exports = setupJsonUploadRoutes;