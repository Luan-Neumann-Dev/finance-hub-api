const pool = require('../config/database')

const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, ec.name as category_name, ec.color as category_color, ec.icon as category_icon
            FROM expenses e,
            LEFT JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.user_id = $1
            ORDER BY e.date DESC, e.created_at DESC
            `,
            [req.userId]
        )
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar despesas:', error);
        res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
}

const create = async (req, res) => {
    const { category_id, amount, description, date, notes } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO expenses (user_id, category_id, amount, description, date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.userId, category_id, amount, description, date, notes]
        );
        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        res.status(500).json({ error: 'Erro ao criar despesa' });
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    const { category_id, amount, description, date, notes } = req.body;

    try {
        const result = await pool.query(
            'UPDATE expenses SET category_id = $1, amount = $2, description = $3, date = $4, notes = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [category_id, amount, description, date, notes, id, req.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Despesa não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar despesa:', error);
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
        console.error('Erro ao deletar despesa:', error);
        res.status(500).json({ error: 'Erro ao deletar despesa' });
    }
}

const getStats = async (req, res) => {
    const {startDate, endDate} = req.query;

    try {
        const query = `
            SELECT 
                ec.name as category_name,
                ec.color as category_color,
                SUM(e.amount) as total,
            FROM expenses e
            LEFT JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.user_id = $1
                ${startDate ? 'AND e.date >= $2' : ''}
                ${endDate ? 'AND e.date <= $' + (startDate ? '3' : '2') : ''}
            GROUP BY ec.id, ec.name, ec.color
            ORDER BY total DESC
        `;

        const params = [req.userId];
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar estatísticas de despesas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas de despesas' });
    }
};

module.exports = {
    getAll, create, update, remove, getStats
}