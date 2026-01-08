const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const incomesRoutes = require('./routes/incomesRoutes')
const categoriesRoutes = require('./routes/categoriesRoutes');
const expensesRoutes = require('./routes/expensesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: '💰 API Finance Hub'})
});

app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomesRoutes)
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})