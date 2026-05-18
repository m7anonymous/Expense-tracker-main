import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, LogOut, Wallet, CalendarDays, BrainCircuit } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-64 glass-dark h-screen sticky top-0 flex flex-col justify-between py-6 px-4">
            <div>
                <div className="flex items-center gap-3 px-2 mb-10 text-emerald-400">
                    <Wallet size={32} />
                    <h1 className="text-2xl font-bold tracking-tight text-white">Xpense</h1>
                </div>

                <nav className="space-y-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/transactions"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ReceiptText size={20} />
                        <span className="font-medium">Transactions</span>
                    </NavLink>

                    <NavLink
                        to="/calendar"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <CalendarDays size={20} />
                        <span className="font-medium">Calendar</span>
                    </NavLink>

                    <NavLink
                        to="/ai-insights"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <BrainCircuit size={20} />
                        <span className="font-medium">AI Insights</span>
                    </NavLink>
                </nav>
            </div>

            <div className="border-t border-slate-700/50 pt-5 mt-5">
                <div className="px-4 mb-4">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
