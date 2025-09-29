// src/middleware/multer.ts
import multer from 'multer';

export const uploadDepositProofs = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 3,
  },
}).array('proofs', 3);
