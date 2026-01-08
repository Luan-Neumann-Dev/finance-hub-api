const pool = require('../config/database')

const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM expense_categories WHERE user_id = $1 ORDER BY name',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
}

const create = async (req, res) => {
    const { name, color, icon } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Nome obrigatório' })
    }

    try {
        const result = await pool.query(
            'INSERT INTO expense_categories (user_id, name, color, icon) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.userId, name, color || '#FF6B35', icon || 'tag']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar categoria' })
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    try {
        const result = await pool.query(
            'UPDATE expense_categories SET name = $1, color = $2, icon = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [name, color, icon, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' })
        }

        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar categoria' })
    }
}

const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM expense_categories WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' })
        }

        res.json({ message: 'Categoria deletada com sucesso' })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar categoria' })
    }
}

module.exports = { getAll, create, update, remove }