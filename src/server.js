const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const incomesRoutes = require('./routes/incomesRoutes')
const categoriesRoutes = require('./routes/categoriesRoutes');
const expensesRoutes = require('./routes/expensesRoutes');
const piggyBanksRoutes = require('./routes/piggyBanksRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}
app.get('/', (req, res) => {
    res.json({
        message: '💰 API FINANCE HUB',
        version: '1.0.0',
        status: 'online'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomesRoutes)
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/piggy-banks', piggyBanksRoutes);
app.use('/api/reports', reportsRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log('');
    console.log('💰 ========================================');
    console.log('          FINANCE HUB - API REST');
    console.log('========================================== 💰');
    console.log('');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Rotas disponíveis:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/auth/me');
    console.log('');
    console.log('   GET    /api/incomes');
    console.log('   POST   /api/incomes');
    console.log('   PUT    /api/incomes/:id');
    console.log('   DELETE /api/incomes/:id');
    console.log('');
    console.log('   GET    /api/expenses');
    console.log('   POST   /api/expenses');
    console.log('   PUT    /api/expenses/:id');
    console.log('   DELETE /api/expenses/:id');
    console.log('');
    console.log('   GET    /api/categories');
    console.log('   POST   /api/categories');
    console.log('   PUT    /api/categories/:id');
    console.log('   DELETE /api/categories/:id');
    console.log('');
    console.log('   GET    /api/piggy-banks');
    console.log('   GET    /api/piggy-banks/total');
    console.log('   GET    /api/piggy-banks/:id');
    console.log('   POST   /api/piggy-banks');
    console.log('   PUT    /api/piggy-banks/:id');
    console.log('   DELETE /api/piggy-banks/:id');
    console.log('   GET    /api/piggy-banks/:id/transactions');
    console.log('   POST   /api/piggy-banks/transactions');
    console.log('   DELETE /api/piggy-banks/transactions/:id');
    console.log('');
    console.log('   GET    /api/reports/dashboard');
    console.log('   GET    /api/reports/expenses-by-category');
    console.log('   GET    /api/reports/monthly-evolution');
    console.log('   GET    /api/reports/yearly-comparison');
    console.log('   GET    /api/reports/top-expenses');
    console.log('');
    console.log('💡 Use Ctrl+C para parar o servidor');
    console.log('');
});