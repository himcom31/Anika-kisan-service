const express = require('express');
const router = express.Router();
const { compressAndUpload } = require('../config/cloudinary');
const { 
    addCategory, 
    getCategories,
    getCategoriesFlat,
    getParentCategories,
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController/categoryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ── Get Routes ────────────────────────────────────────────────────────────────
router.get('/all',     getCategories);        // nested (frontend filter ke liye)
router.get('/flat',    getCategoriesFlat);    // flat list (product form ke liye)
router.get('/parents', getParentCategories);  // sirf parents (sub-cat form ke liye)

// ── Post Routes ───────────────────────────────────────────────────────────────
router.post('/add', ...compressAndUpload('thumbnail', 'ReadyGrocery/Categories'), protect, addCategory);

// ── Put Routes ────────────────────────────────────────────────────────────────
router.put('/:id', protect, ...compressAndUpload('thumbnail', 'ReadyGrocery/Categories'), updateCategory);

// ── Delete Routes ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, deleteCategory);

module.exports = router;