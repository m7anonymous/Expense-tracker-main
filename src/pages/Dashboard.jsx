import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    LineChart, Line,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BrainCircuit, Download, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

const AISummaryButton = ({ chartType, data }) => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ai/summary', { chartType, data });
            setSummary(res.data.summary);
        } catch (err) {
            console.error(err);
            setSummary("Failed to generate insights.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            {!summary && !loading && (
                <button onClick={handleGenerate} className="flex items-center gap-2 text-xs font-medium text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition">
                    <BrainCircuit size={14} /> ✨ AI Summary
                </button>
            )}
            {loading && (
                <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse">
                    <BrainCircuit size={14} className="animate-spin" /> Generating AI Insights...
                </div>
            )}
            {summary && !loading && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm p-3 glass border border-purple-500/20 rounded-xl bg-purple-500/5 text-purple-300">
                    <span className="font-bold flex items-center gap-2 mb-1 text-purple-400"><Sparkles size={14} /> Insight:</span>
                    {summary}
                </motion.div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const dashboardRef = useRef();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/analytics');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const exportPDF = async () => {
        const element = dashboardRef.current;
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.setFontSize(20);
            pdf.text('Xpense Financial Report', 10, 15);
            pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
            pdf.save('financial-report.pdf');
        } catch (err) {
            console.error('Error generating PDF', err);
        }
    };

    if (loading || !data) {
        return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div></div>;
    }

    const { summary, expenseByCategory, monthlyStats, dailyTrends, predictions } = data;

    const savingsData = [
        { name: 'Savings', value: Math.max(0, summary.totalIncome - summary.totalExpense) },
        { name: 'Expenses', value: summary.totalExpense }
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <button onClick={exportPDF} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition border border-slate-700/50 shadow-sm">
                    <Download size={18} /> Export PDF Report
                </button>
            </div>

            <div ref={dashboardRef} className="space-y-6">
                {/* Predictions & AI Banner */}
                {predictions && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                                <BrainCircuit size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white flex items-center gap-2">🔮 Predictive Insights</h3>
                                <p className="text-sm text-purple-200">Based on recent trends, expect to spend <strong className="text-white">${predictions.expectedExpense.toFixed(2)}</strong> next month, mostly on <strong className="text-white capitalize">{predictions.topCategory || 'miscellaneous'}</strong>.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div whileHover={{ y: -5 }} className="glass-dark p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-blue-500">
                            <DollarSign size={80} />
                        </div>
                        <p className="text-slate-400 font-medium mb-1 relative z-10">Total Balance</p>
                        <h2 className="text-4xl font-bold text-white relative z-10">
                            ${summary.totalBalance.toLocaleString()}
                        </h2>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="glass border-emerald-500/20 bg-emerald-500/10 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-emerald-500">
                            <TrendingUp size={80} />
                        </div>
                        <p className="text-emerald-400 font-medium mb-1 relative z-10 flex items-center justify-between">
                            Total Income
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20">⬆ Stable</span>
                        </p>
                        <h2 className="text-4xl font-bold text-emerald-50 relative z-10">
                            ${summary.totalIncome.toLocaleString()}
                        </h2>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="glass border-rose-500/20 bg-rose-500/10 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all text-rose-500">
                            <TrendingDown size={80} />
                        </div>
                        <p className="text-rose-400 font-medium mb-1 relative z-10 flex items-center justify-between">
                            Total Expense
                            {summary.totalExpense > summary.totalIncome * 0.8 && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20">High</span>}
                        </p>
                        <h2 className="text-4xl font-bold text-rose-50 relative z-10">
                            ${summary.totalExpense.toLocaleString()}
                        </h2>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Income vs Expenses - Bar Chart */}
                    <div className="glass-dark p-6 rounded-2xl flex flex-col">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 rounded-full bg-blue-500"></div>
                            Income vs Expenses
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                    <RechartsTooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <AISummaryButton chartType="Monthly Income vs Expenses Bar Chart" data={monthlyStats} />
                    </div>

                    {/* Expense Distribution - Pie Chart */}
                    <div className="glass-dark p-6 rounded-2xl flex flex-col">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 rounded-full bg-purple-500"></div>
                            Expense by Category
                        </h3>
                        <div className="h-[250px] w-full">
                            {expenseByCategory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                                        <Legend iconType="circle" />
                                        <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="total" nameKey="_id">
                                            {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">No expense data yet</div>
                            )}
                        </div>
                        {expenseByCategory.length > 0 && <AISummaryButton chartType="Expense by Category Donut Chart" data={expenseByCategory} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Spending Trends - Line Chart */}
                    <div className="glass-dark p-6 rounded-2xl flex flex-col">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 rounded-full bg-emerald-500"></div>
                            Last 30 Days Spending Trend
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyTrends}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="_id" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(str) => str.substring(5)} />
                                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <AISummaryButton chartType="30-Day Spending Trend Line Chart" data={dailyTrends.slice(-7)} />
                    </div>

                    {/* Savings vs Expenses - Donut Chart */}
                    <div className="glass-dark p-6 rounded-2xl flex flex-col">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 rounded-full bg-amber-500"></div>
                            Savings vs Expenses
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                                    <Legend iconType="circle" />
                                    <Pie data={savingsData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <AISummaryButton chartType="Savings Ratio Pie Chart" data={savingsData} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
