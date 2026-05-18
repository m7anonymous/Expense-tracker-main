import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dailyTotals, setDailyTotals] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayTransactions, setDayTransactions] = useState([]);
    const [longestStreak, setLongestStreak] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDate) fetchDayTransactions(selectedDate);
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/analytics');
            const totals = res.data.fullDailyTotals || [];

            const totalsMap = {};
            let maxStreak = 0;
            let curStreak = 0;

            // Calculate streaks
            // Map totals to O(1) lookup
            totals.forEach(t => {
                totalsMap[t._id] = t;
            });

            const today = format(new Date(), 'yyyy-MM-dd');
            let d = new Date();
            // compute streak backward
            for (let i = 0; i < 365; i++) {
                const dStr = format(d, 'yyyy-MM-dd');
                const dayData = totalsMap[dStr];
                if (!dayData || dayData.totalExpense === 0) {
                    curStreak++;
                } else {
                    maxStreak = Math.max(maxStreak, curStreak);
                    curStreak = 0;
                }
                d.setDate(d.getDate() - 1);
            }
            maxStreak = Math.max(maxStreak, curStreak);

            // forward calc current streak
            curStreak = 0;
            d = new Date();
            while (true) {
                const dStr = format(d, 'yyyy-MM-dd');
                const dayData = totalsMap[dStr];
                if (!dayData || dayData.totalExpense === 0) curStreak++;
                else break;
                d.setDate(d.getDate() - 1);
                if (curStreak > 365) break;
            }

            setDailyTotals(totalsMap);
            setLongestStreak(maxStreak);
            setCurrentStreak(curStreak);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDayTransactions = async (date) => {
        try {
            const res = await axios.get('http://localhost:5000/api/transactions');
            const filtered = res.data.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
            setDayTransactions(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    const getDayStats = (date) => {
        const key = format(date, 'yyyy-MM-dd');
        return dailyTotals[key] || null;
    };

    const dayStatusClass = (date) => {
        const stats = getDayStats(date);
        if (!stats) return 'bg-slate-800/20'; // No spend
        if (stats.totalExpense === 0) return 'bg-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)] border-emerald-500/30';
        if (stats.totalExpense > 200) return 'bg-rose-500/40 shadow-[inset_0_0_15px_rgba(244,63,94,0.4)] border-rose-500/50';
        if (stats.totalExpense > 50) return 'bg-rose-500/20 border-rose-500/30';
        return 'bg-amber-500/20 border-amber-500/30';
    };

    const renderCalendarDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const days = [];
        let day = startDate;

        const calendarDates = eachDayOfInterval({ start: startDate, end: endDate });

        return calendarDates.map((date, i) => {
            const stats = getDayStats(date);
            const isSelected = isSameDay(date, selectedDate);
            const today = isToday(date);
            const currentMonth = isSameMonth(date, monthStart);

            const noSpend = !stats || stats.totalExpense === 0;

            return (
                <motion.div
                    key={date}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`relative min-h-[80px] p-2 rounded-xl cursor-pointer border transition-all 
            ${currentMonth ? 'text-white' : 'text-slate-600'}
            ${dayStatusClass(date)}
            ${isSelected ? 'ring-2 ring-blue-500 scale-105 z-10' : 'border-transparent'}
          `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold ${today ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                            {format(date, dateFormat)}
                        </span>
                        {noSpend && currentMonth && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1 rounded">No Spend</span>}
                    </div>
                    {stats && (
                        <div className="mt-2 text-xs flex flex-col gap-0.5">
                            {stats.totalExpense > 0 && <span className="text-rose-400">-${stats.totalExpense}</span>}
                            {stats.totalIncome > 0 && <span className="text-emerald-400">+${stats.totalIncome}</span>}
                        </div>
                    )}
                </motion.div>
            );
        });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    if (loading) return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <div className="flex gap-4">
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-400">
                        <Flame size={18} />
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">Current Streak</span>
                            <span className="font-bold">{currentStreak} Days</span>
                        </div>
                    </div>
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-rose-400">
                        <Flame size={18} />
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">Longest Streak</span>
                            <span className="font-bold">{longestStreak} Days</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Side */}
                <div className="flex-1 glass-dark p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 glass rounded-lg hover:bg-white/10 transition"><ChevronLeft size={20} /></button>
                            <button onClick={nextMonth} className="p-2 glass rounded-lg hover:bg-white/10 transition"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-sm font-medium text-slate-400">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendarDays()}
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="w-full lg:w-1/3 glass-dark p-6 rounded-2xl flex flex-col">
                    <h2 className="text-xl font-bold mb-6 flex justify-between items-center">
                        {format(selectedDate, 'MMM do, yyyy')}
                        <span className="text-sm font-normal text-slate-400 badge bg-slate-800 px-2 py-1 rounded-md">{dayTransactions.length} items</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        <AnimatePresence>
                            {dayTransactions.map(t => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={t._id}
                                    className="p-4 glass rounded-xl flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-white">{t.category}</p>
                                        <p className="text-xs text-slate-400">{t.notes || 'No description'}</p>
                                    </div>
                                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount}
                                    </span>
                                </motion.div>
                            ))}
                            {dayTransactions.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-slate-500">
                                    <p>No transactions.</p>
                                    <p className="text-sm mt-1 text-emerald-500 font-medium">Great job on your no-spend day!</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {(() => {
                        const stats = getDayStats(selectedDate);
                        if (!stats && dayTransactions.length === 0) return null;
                        const inc = stats?.totalIncome || 0;
                        const exp = stats?.totalExpense || 0;
                        return (
                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-400">Day Income</span>
                                    <span className="text-emerald-400">${inc}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-400">Day Expense</span>
                                    <span className="text-rose-400">${exp}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-700/50">
                                    <span>Net Balance</span>
                                    <span className={inc - exp >= 0 ? 'text-emerald-400' : 'text-rose-400'}>${inc - exp}</span>
                                </div>
                            </div>
                        )
                    })()}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
