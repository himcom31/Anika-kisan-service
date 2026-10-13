const express = require('express');
const router = express.Router();

// PURANA:
// const upload = require('../config/cloudinary');

// NAYA — destructure karo:
const { compressAndUpload } = require('../config/cloudinary');

const {
    addFlashSale,
    getFlashSales,
    getFlashSaleById,
    updateFlashSale,
    toggleFlashSaleStatus,
    deleteFlashSale,
    addProductToFlashSale,
    updateProductInFlashSale,
    removeProductFromFlashSale,
} = require('../controllers/flashSaleController');
const { protect } = require('../middleware/authMiddleware');

// Flash Sale CRUD — compressAndUpload use karo
router.post('/add',        protect, ...compressAndUpload('thumbnail', 'ReadyGrocery/FlashSales'), addFlashSale);
router.get('/all',         getFlashSales);
router.get('/:id',         getFlashSaleById);
router.put('/update/:id',  protect, ...compressAndUpload('thumbnail', 'ReadyGrocery/FlashSales'), updateFlashSale);
router.patch('/toggle/:id',  protect, toggleFlashSaleStatus);
router.delete('/delete/:id', protect, deleteFlashSale);

// Product Management
router.post('/:id/add-product',                protect, addProductToFlashSale);
router.put('/:id/update-product/:productId',   protect, updateProductInFlashSale);
router.delete('/:id/remove-product/:productId',protect, removeProductFromFlashSale);

module.exports = router;