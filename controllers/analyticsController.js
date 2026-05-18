const Transaction = require('../models/Transaction');

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Basic totals
        const transactions = await Transaction.find({ user: userId });
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            if (t.type === 'expense') totalExpense += t.amount;
        });

        const totalBalance = totalIncome - totalExpense;

        // 2. Expense distribution by category
        const expenseByCategory = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        // 3. Monthly income vs expenses
        const monthlyStats = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" },
                        type: "$type"
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format monthly stats
        const formattedMonthly = [];
        const monthlyMap = {};
        monthlyStats.forEach(stat => {
            const key = `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`;
            if (!monthlyMap[key]) {
                monthlyMap[key] = { month: key, income: 0, expense: 0 };
            }
            monthlyMap[key][stat._id.type] = stat.total;
        });

        for (let key in monthlyMap) {
            formattedMonthly.push(monthlyMap[key]);
        }

        formattedMonthly.sort((a, b) => a.month.localeCompare(b.month));

        // 4. Daily spending trends (last 30 days) and full calender data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const fullDailyTotals = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        const dailyTrends = fullDailyTotals
            .filter(item => new Date(item._id) >= thirtyDaysAgo)
            .map(item => ({ _id: item._id, total: item.totalExpense }))
            .sort((a, b) => a._id.localeCompare(b._id));

        // Simple predictions (average of last 3 months)
        let predictedExpense = 0;
        let predictedCategory = '';

        if (formattedMonthly.length > 0) {
            const last3 = formattedMonthly.slice(-3);
            const avgExpense = last3.reduce((sum, item) => sum + item.expense, 0) / last3.length;
            predictedExpense = avgExpense * 1.05; // 5% inflation/trend factor
        }

        if (expenseByCategory.length > 0) {
            const topCategory = expenseByCategory.reduce((a, b) => a.total > b.total ? a : b);
            predictedCategory = topCategory._id;
        }

        res.json({
            summary: {
                totalBalance,
                totalIncome,
                totalExpense
            },
            expenseByCategory,
            monthlyStats: formattedMonthly,
            dailyTrends,
            fullDailyTotals,
            predictions: {
                expectedExpense: predictedExpense,
                topCategory: predictedCategory
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAnalytics };
