const pool = require('../config/database')

const getAll = async (req, res) => {
    const { startDate, endDate, categoryId } = req.query;

    try {
        let query = `
            SELECT e.*, ec.name as category_name, ec.color as category_color, ec.icon as category_icon
            FROM expenses e
            LEFT JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.user_id = $1
        `;

        const params = [req.userId]
        let paramIndex = 2;

        if (startDate) {
            query += `AND e.date >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += `AND e.date <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        if (categoryId) {
            query += `AND e.category_id = $${paramIndex}`;
            params.push(categoryId)
        }

        query += ' ORDER BY e.date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
}

const create = async (req, res) => {
    const { category_id, amount, description, date, notes } = req.body;

    if (!amount || !description) {
        return res.status(400).json({ error: 'Valor e descrição obrigatórios' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO expenses (user_id, category_id, amount, description, date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.userId, category_id, amount, description, date || new Date(), notes]
        );
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar despesa' });
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    const { category_id, amount, description, date, notes } = req.body;

    try {
        const result = await pool.query(
            'UPDATE expenses SET category_id = COALESCE($1, category_id), amount = COALESCE($2, amount), description = COALESCE($3, description), date = COALESCE($4, date), notes = COALESCE($5, notes) WHERE id = $6 AND user_id = $7 RETURNING *',
            [category_id, amount, description, date, notes, id, req.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Despesa não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar despesa' });
    }
}

const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Despesa não encontrada' })
        }

        res.json({ message: 'Despesa deletada com sucesso' })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar despesa' });
    }
}

module.exports = { getAll, create, update, remove }