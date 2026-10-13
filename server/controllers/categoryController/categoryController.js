const Category = require('../../models/Category/Category');
const { pool } = require('../../config/db');

// ── Add Category (main ya sub dono ke liye same) ─────────────────────────────
exports.addCategory = async (req, res) => {
    try {
        const { name, description, isActive, parent_id } = req.body;
        const thumbnail = req.file ? req.file.path : null;

        if (!thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Thumbnail upload fail ho gaya ya missing hai."
            });
        }

        // Agar parent_id aaya hai toh check karo woh exist karta hai ya nahi
        if (parent_id) {
            const parent = await Category.findById(parent_id);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Selected parent category exist nahi karti."
                });
            }

            // Parent khud kisi ka child nahi hona chahiye (2 levels tak hi)
            if (parent.parent_id !== null) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-category ke andar aur sub-category nahi ban sakti."
                });
            }
        }

        const savedCategory = await Category.create({
            name,
            thumbnail,
            description,
            isActive: isActive === 'true' || isActive === true,
            parent_id: parent_id ? Number(parent_id) : null
        });

        return res.status(201).json({
            success: true,
            message: parent_id
                ? "Sub-category created successfully!"
                : "Category created successfully!",
            category: savedCategory
        });

    } catch (error) {
        console.error("DETAILED ERROR:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Backend mein error hai",
            error: error.message
        });
    }
};

// ── Get All Categories (nested — parents + sub-categories) ───────────────────
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── Get All Categories Flat (product form dropdown ke liye) ──────────────────
exports.getCategoriesFlat = async (req, res) => {
    try {
        const categories = await Category.findFlat();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── Get Only Parent Categories (sub-category form dropdown ke liye) ───────────
exports.getParentCategories = async (req, res) => {
    try {
        const categories = await Category.findParents();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── Update Category ───────────────────────────────────────────────────────────
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive, parent_id } = req.body;

        const updateData = {};

        if (name && name.trim()) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }
        if (req.file) {
            updateData.thumbnail = req.file.path;
        }

        // parent_id update
        if (parent_id !== undefined) {
            if (parent_id === null || parent_id === '' || parent_id === 'null') {
                // Main category banana hai
                updateData.parent_id = null;
            } else {
                // Validate parent
                const parent = await Category.findById(parent_id);
                if (!parent) {
                    return res.status(400).json({
                        success: false,
                        message: "Selected parent category exist nahi karti."
                    });
                }
                if (parent.parent_id !== null) {
                    return res.status(400).json({
                        success: false,
                        message: "Sub-category ke andar aur sub-category nahi ban sakti."
                    });
                }
                // Apne aap ko parent nahi bana sakta
                if (Number(parent_id) === Number(id)) {
                    return res.status(400).json({
                        success: false,
                        message: "Category apni khud ki parent nahi ban sakti."
                    });
                }
                updateData.parent_id = Number(parent_id);
            }
        }

        const updated = await Category.findByIdAndUpdate(id, updateData);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            category: updated
        });

    } catch (error) {
        console.error("updateCategory ERROR:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating category.",
            error: error.message
        });
    }
};

// ── Delete Category ───────────────────────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Pehle check karo — koi sub-categories hain is category ki?
        const [subCats] = await pool.query(
            `SELECT id FROM categories WHERE parent_id = ?`, [id]
        );

        if (subCats.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Pehle is category ki ${subCats.length} sub-categories delete karo.`
            });
        }

        // Blogs ka category_id null karo
        await pool.query(
            `UPDATE blogs SET category_id = NULL WHERE category_id = ?`, [id]
        );

        // Products ka category_id null karo
        await pool.query(
            `UPDATE products SET category_id = NULL WHERE category_id = ?`, [id]
        );

        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: `Category "${deleted.name}" deleted successfully.`
        });

    } catch (error) {
        console.error("deleteCategory ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting category.",
            error: error.message
        });
    }
};