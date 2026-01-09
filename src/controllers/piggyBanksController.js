const pool = require('../config/database')

const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM piggy_banks WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        )

        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar porquinhos' })
    }
}

const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM piggy_banks WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Porquinho não encontrado' })
        }

        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar porquinho' })
    }
}

const create = async (req, res) => {
    const { name, goal, bank, balance } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO piggy_banks (user_id, name, goal, bank, balance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.userId, name, goal, bank || 'Outro', balance || 0]
        );

        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar porquinho' })
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    const { name, goal, bank } = req.body;

    try {
        const result = await pool.query(
            'UPDATE piggy_banks SET name = COALESCE($1, name), goal = COALESCE($2, goal), bank = COALESCE($3, bank) WHERE id = $4 AND user_id = $5 RETURNING *',
            [name, goal, bank, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Porquinho não encontrado' })
        }

        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar porquinho' })
    }
}

const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const piggyCheck = await pool.query(
            'SELECT * FROM piggy_banks WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        );

        if (piggyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Porquinho não encontrado' })
        }

        if (parseFloat(piggyCheck.rows[0].balance) !== 0) {
            return res.status(400).json({
                error: 'Não é possível deletar um porquinho com saldo. Retire todo o dinheiro primeiro'
            });
        }

        await pool.query(
            'DELETE FROM piggy_banks WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )

        res.json({ message: 'Porquinho deletado com sucesso' })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar porquinho' })
    }
}

const getTotalSavings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT COALESCE(SUM(balance), 0) as total FROM piggy_banks WHERE user_id = $1',
            [req.userId]
        )

        res.json({ total: parseFloat(result.rows[0].total) })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao calcular total de poupança' })
    }
}

module.exports = { getAll, getById, create, update, remove, getTotalSavings }