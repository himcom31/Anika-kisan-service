const DeliveryCharge = require('../models/DeliveryCharge');

// @desc Add New Delivery Charge
exports.addDeliveryCharge = async (req, res) => {
    try {
        const { minOrderPrice, maxOrderPrice, charge } = req.body;

        if (Number(minOrderPrice) >= Number(maxOrderPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Maximum order price must be greater than minimum order price'
            });
        }

        const newCharge = await DeliveryCharge.create({
            minOrderPrice: Number(minOrderPrice),
            maxOrderPrice: Number(maxOrderPrice),
            charge:        Number(charge)
        });

        res.status(201).json({
            success: true,
            message: 'Delivery charge added successfully',
            data: newCharge
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Get All Delivery Charges
exports.getAllCharges = async (req, res) => {
    try {
        const charges = await DeliveryCharge.find();
        res.status(200).json({ success: true, charges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Update Delivery Charge
exports.updateDeliveryCharge = async (req, res) => {
    try {
        const { minOrderPrice, maxOrderPrice, charge } = req.body;

        const existing = await DeliveryCharge.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Delivery charge not found' });
        }

        const newMin = minOrderPrice !== undefined ? Number(minOrderPrice) : existing.minOrderPrice;
        const newMax = maxOrderPrice !== undefined ? Number(maxOrderPrice) : existing.maxOrderPrice;

        if (newMin >= newMax) {
            return res.status(400).json({
                success: false,
                message: 'Maximum order price must be greater than minimum order price'
            });
        }

        const updateData = {};
        if (minOrderPrice !== undefined) updateData.minOrderPrice = Number(minOrderPrice);
        if (maxOrderPrice !== undefined) updateData.maxOrderPrice = Number(maxOrderPrice);
        if (charge        !== undefined) updateData.charge        = Number(charge);

        const updated = await DeliveryCharge.findByIdAndUpdate(req.params.id, updateData);

        res.status(200).json({
            success: true,
            message: 'Delivery charge updated successfully',
            data: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Delete Delivery Charge
exports.deleteDeliveryCharge = async (req, res) => {
    try {
        const deleted = await DeliveryCharge.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Delivery charge not found' });
        }
        res.status(200).json({ success: true, message: 'Delivery charge deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc Get Charge For a Specific Order Price
exports.getChargeForPrice = async (req, res) => {
    try {
        const price  = Number(req.query.price) || 0;
        const result = await DeliveryCharge.findForPrice(price);

        res.json({ success: true, charge: result?.charge ?? 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};