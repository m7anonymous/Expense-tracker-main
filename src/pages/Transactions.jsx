import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, Filter, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Salary', 'Investment', 'Other'];

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Transaction Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd'), type: 'expense', notes: ''
    });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, income, expense

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/transactions', {
                ...formData,
                amount: Number(formData.amount)
            });
            setIsModalOpen(false);
            fetchTransactions();
            setFormData({ amount: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd'), type: 'expense', notes: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await axios.delete(`http://localhost:5000/api/transactions/${id}`);
                fetchTransactions();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchSearch = t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' || t.type === filterType;
        return matchSearch && matchType;
    });

    const downloadCSV = () => {
        const csvRows = [];
        const headers = ['Date', 'Category', 'Type', 'Amount', 'Notes'];
        csvRows.push(headers.join(','));

        filteredTransactions.forEach(t => {
            csvRows.push([
                format(new Date(t.date), 'yyyy-MM-dd'),
                t.category,
                t.type,
                t.amount,
                `"${(t.notes || '').replace(/"/g, '""')}"`
            ].join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'transactions.csv');
        a.click();
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Recent Transactions</h1>
                <div className="flex gap-3">
                    <button
                        onClick={downloadCSV}
                        className="px-4 py-2 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} />
                        Add New
                    </button>
                </div>
            </div>

            <div className="glass-dark p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by category or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income Only</option>
                            <option value="expense">Expense Only</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-slate-400">
                                <th className="font-medium px-4 py-3">Date</th>
                                <th className="font-medium px-4 py-3">Category</th>
                                <th className="font-medium px-4 py-3">Notes</th>
                                <th className="font-medium px-4 py-3 text-right">Amount</th>
                                <th className="font-medium px-4 py-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t._id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-4 py-4 text-slate-300">
                                        {format(new Date(t.date), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-400 text-sm">{t.notes || '-'}</td>
                                    <td className="px-4 py-4 text-right font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {t.type === 'income' ? (
                                                <ArrowUpCircle size={16} className="text-emerald-500" />
                                            ) : (
                                                <ArrowDownCircle size={16} className="text-rose-500" />
                                            )}
                                            <span className={t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleDelete(t._id)}
                                            className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-500">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <h2 className="text-xl font-bold mb-6">Add Transaction</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="flex gap-4 p-1 bg-slate-800 rounded-xl">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    Expense
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    Income
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
                                <input type="number" step="0.01" min="0" required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                                <input type="date" required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Notes (Optional)</label>
                                <input type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors font-medium">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 rounded-xl text-white font-medium transition-colors">
                                    Save
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Transactions;
