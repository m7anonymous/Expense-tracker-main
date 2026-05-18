const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../models/Transaction');

// Fetch user data context
const getUserDataSummary = async (userId) => {
    const transactions = await Transaction.find({ user: userId });
    let totalIncome = 0;
    let totalExpense = 0;
    const categorySummary = {};

    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        if (t.type === 'expense') {
            totalExpense += t.amount;
            categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
        }
    });
    return { totalIncome, totalExpense, categorySummary, transactionCount: transactions.length };
};

const getAISuggestions = async (req, res) => {
    try {
        const summary = await getUserDataSummary(req.user._id);
        const { goal } = req.body;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
            return res.json({
                insights: [
                    "Set up your GEMINI_API_KEY in the backend .env to get real AI insights.",
                    `Your highest spending category is ${Object.keys(summary.categorySummary).length > 0 ? Object.keys(summary.categorySummary).reduce((a, b) => summary.categorySummary[a] > summary.categorySummary[b] ? a : b) : 'None'}. Try reducing it.`,
                    "Avoid unnecessary recurring subscriptions to hit your goals."
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are an expert financial advisor. Here is a user's financial summary:
    Total Income: $${summary.totalIncome}
    Total Expense: $${summary.totalExpense}
    Expenses by Category: ${JSON.stringify(summary.categorySummary)}
    
    The user's goal is: ${goal || 'Reduce overall spending by 10%.'}
    
    Generate 3 very concise, actionable financial insights/suggestions to help them reach this goal. Keep each under 15 words. Return them as a precise JSON array of strings containing the insights. For example: ["Cut food expenses by $20", "Cancel unused entertainment subs", "Invest 10% of new income"]. IMPORTANT: only output the JSON array, no markdown formatting.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        let insights = [];
        try {
            insights = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) {
            // Fallback if parsing fails
            insights = responseText.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
        }

        res.json({ insights });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChartSummary = async (req, res) => {
    try {
        const { chartType, data } = req.body;
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
            return res.json({ summary: "Configure GEMINI_API_KEY in the backend .env to generate dynamic AI summaries for this chart data!" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Analyze this ${chartType} chart data: ${JSON.stringify(data)}. Provide a single concise, punchy sentence summarizing the most important trend or insight. Keep it under 20 words. No markdown.`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text().trim();

        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAISuggestions, getChartSummary };
