const pool = require('../config/database');

const getByPiggyBank = async (req, res) => {
    const { piggyBankId } = req.params;

    try {
        const piggyCheck = await pool.query(
            'SELECT id FROM WHERE id = $1 AND user_id $2',
            [piggyBankId, req.userId]
        )

        if (piggyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Porquinho não encontrado' })
        }

        const result = await pool.query(
            'SELECT * FROM piggy_transactions WHERE piggy_bank_id = $1 ORDER BY date DESC',
            [piggyBankId]
        )

        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar transações' })
    }
}

const create = async (req, res) => {
    const { piggy_bank_id, type, amount, description } = req.body;

    if (!piggy_bank_id || !type || !amount) {
        return res.status(400).json({ error: 'Porquinho, tipo e valor são obrigatórios' })
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser "deposit" ou "withdrawal"' })
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }

    try {
        const piggyCheck = await pool.query(
            'SELECT balance FROM piggy_banks WHERE id = $1 AND user_id = $2',
            [piggy_bank_id, req.userId]
        );

        if (piggyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Porquinho não encontrado' });
        }

        if (type === 'withdrawal') {
            const currentBalance = parseFloat(piggyCheck.rows[0].balance);
            if (currentBalance < amount) {
                return res.status(400).json({ error: 'Saldo insuficiente' })
            }
        }

        const result = await pool.query(
            'INSERT INTO piggy_transactions (piggy_bank_id, user_id, type, amount, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [piggy_bank_id, req.userId, type, amount, description]
        )

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar transação' })
    }
}

const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const transactionCheck = await pool.query(
            'SELECT * FROM piggy_transactions WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        );

        if (transactionCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' })
        }

        const transaction = transactionCheck.rows[0];

        if (transaction.type === 'deposit') {
            const piggyCheck = await pool.query(
                'SELECT balance FROM piggy_banks WHERE id = $1',
                [transaction.piggy_bank_id]
            );

            const currentBalance = parseFloat(piggyCheck.rows[0].balance);
            if (currentBalance < transaction.amount) {
                return res.status(400).json({
                    error: 'Não é possível deletar depósito pois o saldo atual seria negativo'
                })
            }
        }

        await pool.query(
            'DELETE FROM piggy_transactions WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        );

        res.json({ message: 'Transação deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar transação' })
    }
}

module.exports = { getByPiggyBank, create, remove }