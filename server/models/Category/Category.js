const { pool } = require('../../config/db');

const createCategoryTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL UNIQUE,
            thumbnail   VARCHAR(500) NOT NULL,
            description TEXT,
            isActive    BOOLEAN DEFAULT true,
            parent_id   INT DEFAULT NULL,
            createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )
    `);
};

createCategoryTable();

const Category = {

    // ── Create (main ya sub dono ke liye same) ──────────────────────────────
    create: async ({ name, thumbnail, description, isActive, parent_id }) => {
        const [result] = await pool.query(
            `INSERT INTO categories (name, thumbnail, description, isActive, parent_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, thumbnail, description ?? null, isActive ?? true, parent_id ?? null]
        );
        const [rows] = await pool.query(`SELECT * FROM categories WHERE id = ?`, [result.insertId]);
        return rows[0];
    },

    // ── Find All — nested structure (parents + unki sub-categories) ─────────
    find: async () => {
        // Pehle sab fetch karo
        const [rows] = await pool.query(
            `SELECT * FROM categories ORDER BY createdAt DESC`
        );

        // Parents alag karo
        const parents = rows.filter(r => r.parent_id === null);

        // Har parent ke andar uski sub-categories attach karo
        const nested = parents.map(parent => ({
            ...parent,
            subCategories: rows.filter(r => r.parent_id === parent.id)
        }));

        return nested;
    },

    // ── Find All Flat — dropdown ke liye (add product form) ─────────────────
    findFlat: async () => {
        const [rows] = await pool.query(
            `SELECT * FROM categories ORDER BY parent_id ASC, name ASC`
        );
        return rows;
    },

    // ── Sirf Parent Categories — sub-category form ke dropdown ke liye ──────
    findParents: async () => {
        const [rows] = await pool.query(
            `SELECT * FROM categories WHERE parent_id IS NULL AND isActive = true ORDER BY name ASC`
        );
        return rows;
    },

    // ── Find By Id ───────────────────────────────────────────────────────────
    findById: async (id) => {
        const [rows] = await pool.query(
            `SELECT * FROM categories WHERE id = ?`, [id]
        );
        return rows[0] ?? null;
    },

    // ── Update ───────────────────────────────────────────────────────────────
    findByIdAndUpdate: async (id, updateData) => {
        const fields = Object.keys(updateData);
        if (fields.length === 0) return null;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updateData[f]);

        await pool.query(
            `UPDATE categories SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        const [rows] = await pool.query(`SELECT * FROM categories WHERE id = ?`, [id]);
        return rows[0] ?? null;
    },

    // ── Delete ───────────────────────────────────────────────────────────────
    findByIdAndDelete: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM categories WHERE id = ?`, [id]);
        if (rows.length === 0) return null;

        await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
        return rows[0];
    }
};

module.exports = Category;