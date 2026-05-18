import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Zap, BrainCircuit, TrendingDown, ArrowRight, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInsights = () => {
    const [insights, setInsights] = useState([]);
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchInsights = async (userGoal = '') => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ai/suggestions', { goal: userGoal });
            setInsights(res.data.insights || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const handleGoalSubmit = (e) => {
        e.preventDefault();
        if (goal.trim() !== '') {
            fetchInsights(goal);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <BrainCircuit className="text-purple-500" size={32} />
                        Smart AI Insights
                    </h1>
                    <p className="text-slate-400 mt-1">Personalized financial advice powered by Gemini AI</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Goal Setter */}
                <div className="md:col-span-1 glass-dark p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mb-6 border border-purple-500/30">
                            <Target size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Set Savings Goal</h2>
                        <p className="text-sm text-slate-400 mb-6">Tell us what you're saving for, and our AI will suggest tailored budget cuts.</p>

                        <form onSubmit={handleGoalSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="e.g. Save $500 for a trip"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-purple-500/20"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                ) : (
                                    <>Generate Path <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* AI Suggestions List */}
                <div className="md:col-span-2 glass-dark p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Zap className="text-amber-400" size={20} />
                        Actionable Next Steps
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-slate-800/50 rounded-xl w-full border border-slate-700/50"></div>
                                ))}
                            </div>
                        ) : insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="p-5 glass border border-purple-500/20 rounded-xl flex items-start gap-4 hover:bg-purple-500/5 transition-colors group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl mt-1">
                                        <Save size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">Suggestion #{idx + 1}</h3>
                                        <p className="text-slate-300">{insight}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full min-h-[200px] flex items-center justify-center text-slate-500">
                                Submit a goal to receive AI recommendations.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
