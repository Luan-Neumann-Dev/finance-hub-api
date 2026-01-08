const pool = require('../config/database')

const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM incomes WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar receitas' })
    }
}

const create = async (req, res) => {
    const { name, amount, recurrence, receive_date } = req.body;

    if (!name || !amount) {
        return res.status(400).json({ error: 'Nome e valor obrigatórios' })
    }

    try {
        const result = await pool.query(
            'INSERT INTO incomes (user_id, name, amount, recurrence, receive_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.userId, name, amount, recurrence, receive_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar receita' })
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    const { name, amount, recurrence, receive_date } = req.body;

    try {
        const result = await pool.query(
            'UPDATE incomes SET name = COALESCE($1, name), amount = COALESCE($2, amount), recurrence = COALESCE($3, recurrence), receive_date = COALESCE($4, receive_date) WHERE id = $5 AND user_id = $6 RETURNING *',
            [name, amount, recurrence, receive_date, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Receita não encontrada' })
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar receita' })
    }
}

const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM incomes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Receita não encontrada' })
        }

        res.json({ message: 'Receita deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar receita' })
    }
}

module.exports = { getAll, create, update, remove }