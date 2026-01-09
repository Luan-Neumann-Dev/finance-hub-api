const pool = require('../config/database')

const getDashboardSummary = async (req, res) => {
    try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now().getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        //Total de receitas mensais
        const incomesResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = $1',
            [req.userId]
        );

        //Total de despesas do mês atual
        const expensesResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND date >= $2 AND date <= $3',
            [req.userId, firstDay, lastDay]
        );

        // Total guardado nos porquinhos
        const savingsResult = await pool.query(
            'SELECT COALESCE(SUM(balance), 0) as total FROM piggy_banks WHERE user_id = $1',
            [req.userId]
        );

        const totalIncome = parseFloat(incomesResult.rows[0].total);
        const totalExpenses = parseFloat(incomesResult.rows[0].total);
        const totalSavings = parseFloat(incomesResult.rows[0].total);
        const balance = totalIncome - totalExpenses;

        res.json({
            totalIncome,
            totalExpenses,
            balance,
            totalSavings,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar resumo' })
    }
}

const getExpensesByCategory = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let query = `
            SELECT
                ec.name,
                ec.color,
                ec.icon,
                COALESCE(SUM(e.amount), 0) as value
            FROM expense_categories ec
            LEFT JOIN expenses e ON e.category_id = ec.id
            WHERE ec.user_id = $1
        `;

        const params = [req.userId];
        let paramIndex = 2;

        if (startDate) {
            query += ` AND e.date >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND e.date <= $${paramIndex}`;
            params.push(endDate);
        }

        query += ' GROUP BY ec.id, ec.name, ec.color, ec.icon HAVING SUM(e.amount) > 0 ORDER BY value DESC';

        const result = await pool.query(query, params);

        res.json(result.rows.map(row => ({
            name: row.name,
            value: parseFloat(row.value),
            color: row.color,
            icon: row.icon
        })))

    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar despesas por categoria' })
    }
}

const getMonthlyEvolution = async (req, res) => {
    try {
        const query = `
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
          ) AS month
        ),
        monthly_income AS (
          SELECT COALESCE(SUM(amount), 0) as total
          FROM incomes
          WHERE user_id = $1
        )
        SELECT 
          TO_CHAR(m.month, 'Mon') as month_name,
          COALESCE(SUM(e.amount), 0) as expenses,
          (SELECT total FROM monthly_income) as income
        FROM months m
        LEFT JOIN expenses e ON 
          date_trunc('month', e.date) = m.month AND
          e.user_id = $1
        GROUP BY m.month
        ORDER BY m.month
      `;

        const result = await pool.query(query, [req.userId]);

        res.json(result.rows.map(row => ({
            month: row.month_name,
            incomes: parseFloat(row.income),
            expenses: parseFloat(row.expenses),
            balance: parseFloat(row.income) - parseFloat(row.expenses)
        })));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar evolução mensal' });
    }
};

const getYearlyComparison = async (req, res) => {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    try {
        const query = `
            WITH months AS (
                SELECT generate_series(1, 12) as mount_num
            ),
            yearly_incomes AS (
                SELECT COALESCE(SUM(amount), 0) as total
                FROM incomes
                WHERE user_id = $2
            )
            SELECT
                TO_CHAR(make_date($1::integer, m.month_num, 1), 'Mon') as month_name,
                COALESCE(SUM(e.amount), 0) as expenses,
                (SELECT total FROM yearly_income) as income
            FROM months m
            LEFT JOIN expenses e ON
                EXTRACT(MONTH FROM e.date) = m.month_num AND
                EXTRACT(YEAR FROM e.date) = $1 AND
                e.user_id = $2
            GROUP BY m.month_num
            ORDER BY m.month_num
        `;

        const result = await pool.query(query, [targetYear, req.userId])

        res.json(result.rows.map(row => ({
            month: row.month_name,
            incomes: parseFloat(row.income),
            expenses: parseFloat(row.expenses)
        })))
    } catch (error) {
        res.status(500).json({ error: 'Eoo ao buscar comparação anual' })
    }
}

const getTopExpenses = async (req, res) => {
    const { limit = 5, startDate, endDate } = req.query;

    try {
        let query = `
            SELECT e.*, ec.name as category_name, ec.color as category_color
            FROM expenses e
            LEFT JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.user_id = $1
        `;

        const params = [req.userId];
        let paramIndex = 2;

        if (startDate) {
            query += ` AND e.date >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND e.date <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        query += ` ORDER BY e.amount DESC LIMIT $${paramIndex}`;
        params.push(limit)
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar maiores despesas' });
    }
}

module.exports = {
    getDashboardSummary,
    getExpensesByCategory,
    getMonthlyEvolution,
    getYearlyComparison,
    getTopExpenses
}