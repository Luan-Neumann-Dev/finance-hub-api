const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database')

const register = async (req, res) => {
    const { email, password, full_name } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha obrigatórios' })
        }

        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' })
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
            [email, password_hash, full_name]
        );

        const user = result.rows[0];

        const defaultCategories = [
            { name: 'Alimentação', color: '#FF6B35', icon: 'utensils' },
            { name: 'Transporte', color: '#4ECDC4', icon: 'car' },
            { name: 'Moradia', color: '#45B7D1', icon: 'home' },
            { name: 'Saúde', color: '#96CEB4', icon: 'heart' },
            { name: 'Lazer', color: '#FFEAA7', icon: 'smile' },
            { name: 'Educação', color: '#A29BFE', icon: 'book' },
            { name: 'Outros', color: '#95A5A6', icon: 'tag' },
        ];

        for (const category of defaultCategories) {
            await pool.query(
                'INSERT INTO expense_categories (user_id, name, color, icon) VALUES ($1, $2, $3, $4)',
                [user.id, category.name, category.color, category.icon]
            )
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user,
            token
        })

    } catch (error) {
        console.log('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha obrigatórios' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            },
            token
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
}

const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        res.status(500).json({ error: 'Erro ao obter dados do usuário' });
    }
}

module.exports = { register, login, getMe }