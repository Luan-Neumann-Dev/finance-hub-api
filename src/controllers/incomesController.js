const pool = require('../config/database')

const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM incomes WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.log('Erro ao buscar receitas:', error)
        res.status(500).json({ error: 'Erro ao buscar receitas' })
    }
}

const create = async (req, res) => {
    const { name, amount, recurrence, receive_date } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO incomes (user_id, name, amount, recurrence, receive_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.userId, name, amount, recurrence, receive_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar receita:', error);
        res.status(500).json({ error: 'Erro ao criar receita' })
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    const { name, amount, recurrence, receive_date } = req.body;

    try {
        const result = await pool.query(
            'UPDATE incomes SET name = $1, amount = $2, recurrence = $3, receive_date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [name, amount, recurrence, receive_date, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Receita não encontrada' })
        }
    } catch (error) {
        console.error('Erro ao atualizar receita:', error);
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
        console.error('Erro ao deletar receita:', error);
        res.status(500).json({ error: 'Erro ao deletar receita' })
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove
}