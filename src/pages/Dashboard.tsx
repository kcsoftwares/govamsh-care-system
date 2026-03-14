import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    Users,
    Activity,
    Baby,
    Clock,
    Droplets,
    Bell,
    ArrowRight,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalCows: number;
    pregnantCows: number;
    sickCows: number;
    calves: number;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalCows: 0,
        pregnantCows: 0,
        sickCows: 0,
        calves: 0
    });
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [
                { count: totalCount },
                { count: pregnantCount },
                { count: sickCount },
                { count: calfCount },
                { data: taskData }
            ] = await Promise.all([
                supabase.from('cows').select('*', { count: 'exact', head: true }),
                supabase.from('cows').select('*', { count: 'exact', head: true }).eq('status', 'Pregnant'),
                supabase.from('cows').select('*', { count: 'exact', head: true }).eq('status', 'Sick'),
                supabase.from('cows').select('*', { count: 'exact', head: true }).eq('status', 'Calf'),
                supabase.from('tasks').select('*').eq('assigned_to', user.id).limit(4).order('due_date', { ascending: true })
            ]);

            setStats({
                totalCows: totalCount || 0,
                pregnantCows: pregnantCount || 0,
                sickCows: sickCount || 0,
                calves: calfCount || 0
            });
            setTasks(taskData || []);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const toggleTask = async (task: any) => {
        try {
            const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
            setTasks(current => current.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
            if (error) throw error;
        } catch (error) {
            console.error('Error toggling task:', error);
            loadData();
        }
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, gradient, subtleClass, subtitle, trend }: any) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            {/* Decorative gradient blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${gradient} group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-sm font-semibold text-neutral-500 mb-2 uppercase tracking-wider">{title}</p>
                    {loading ? (
                        <div className="h-10 w-20 bg-neutral-200 animate-pulse rounded-lg"></div>
                    ) : (
                        <div className="flex items-end gap-3">
                            <h3 className="text-4xl font-extrabold text-neutral-800 tracking-tight leading-none">{value}</h3>
                            {trend && (
                                <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                                    <TrendingUp className="w-3 h-3 mr-1" /> {trend}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${subtleClass} shadow-inner`}>
                    <Icon className={`w-7 h-7 ${colorClass}`} />
                </div>
            </div>
            {subtitle && (
                <div className="mt-5 flex items-center text-sm text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2 text-neutral-400" />
                    {subtitle}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Overview</h1>
                    <p className="text-neutral-500 mt-2 text-lg">Daily snapshot of goshala operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-neutral-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-200 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-green-600" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <button className="relative p-2.5 text-neutral-500 hover:text-green-600 transition bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-green-300">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Link to="/cows" className="block focus:outline-none focus:ring-2 focus:ring-green-500 rounded-2xl group/link cursor-pointer hover:-translate-y-1 transition-transform">
                    <StatCard
                        title="Total Herd"
                        value={stats.totalCows}
                        icon={Users}
                        colorClass="text-blue-600"
                        subtleClass="bg-blue-50"
                        gradient="bg-blue-400"
                        trend="+3 this month"
                    />
                </Link>
                <Link to="/cows" className="block focus:outline-none focus:ring-2 focus:ring-green-500 rounded-2xl group/link cursor-pointer hover:-translate-y-1 transition-transform">
                    <StatCard
                        title="Expectant Mothers"
                        value={stats.pregnantCows}
                        icon={Baby}
                        colorClass="text-purple-600"
                        subtleClass="bg-purple-50"
                        gradient="bg-purple-400"
                    />
                </Link>
                <Link to="/cows" className="block focus:outline-none focus:ring-2 focus:ring-green-500 rounded-2xl group/link cursor-pointer hover:-translate-y-1 transition-transform">
                    <StatCard
                        title="Medical Attention"
                        value={stats.sickCows}
                        icon={Activity}
                        colorClass="text-red-500"
                        subtleClass="bg-red-50"
                        gradient="bg-red-400"
                        subtitle="Require active treatments"
                    />
                </Link>
                <Link to="/cows" className="block focus:outline-none focus:ring-2 focus:ring-green-500 rounded-2xl group/link cursor-pointer hover:-translate-y-1 transition-transform">
                    <StatCard
                        title="Young Calves"
                        value={stats.calves}
                        icon={Droplets}
                        colorClass="text-orange-500"
                        subtleClass="bg-orange-50"
                        gradient="bg-orange-400"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Active Tasks Widget */}
                <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-800">Daily Care Routine</h2>
                            <p className="text-sm text-neutral-500 mt-1">Pending assignments for today</p>
                        </div>
                        <Link to="/tasks" className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center hover:underline">
                            View all <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="p-6 flex-1 bg-white">
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-neutral-50 rounded-xl animate-pulse" />)}
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="p-8 text-center text-neutral-400 italic">No tasks assigned for today.</div>
                            ) : tasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task)}
                                    className="flex items-start p-4 rounded-xl border border-neutral-100 hover:border-green-200 hover:shadow-md hover:bg-green-50/30 transition-all duration-200 cursor-pointer group"
                                >
                                    <div className="mr-4 mt-1">
                                        {task.status === 'Completed' ? (
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm ring-4 ring-green-50">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-[2.5px] border-neutral-300 group-hover:border-green-500 transition-colors bg-white shadow-sm"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-semibold ${task.status === 'Completed' ? 'text-neutral-400 line-through' : 'text-neutral-800 group-hover:text-green-800 transition-colors'}`}>
                                            {task.title}
                                        </p>
                                        <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{task.description}</p>
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:text-green-700 transition-colors shadow-sm">
                                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                                        {task.due_date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-gradient-to-br from-green-800 to-green-950 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
                    {/* Decorative background shapes */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-green-400 opacity-20 blur-xl"></div>

                    <h3 className="text-xl font-bold mb-2 relative z-10">Quick Actions</h3>
                    <p className="text-green-200 text-sm mb-6 relative z-10">Fast access to common data entry forms.</p>

                    <div className="space-y-3 relative z-10">
                        <Link to="/health" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center transition-all group active:scale-95 text-left">
                            <div className="bg-white/20 p-2.5 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                                <Activity className="w-5 h-5 text-green-100" />
                            </div>
                            <div>
                                <div className="font-semibold tracking-wide">Log Health Issue</div>
                                <div className="text-xs text-green-200 mt-0.5">Report injury or sickness</div>
                            </div>
                        </Link>

                        <Link to="/cows" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center transition-all group active:scale-95 text-left">
                            <div className="bg-white/20 p-2.5 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                                <Baby className="w-5 h-5 text-green-100" />
                            </div>
                            <div>
                                <div className="font-semibold tracking-wide">Register New Calf</div>
                                <div className="text-xs text-green-200 mt-0.5">Navigate to Cow Registry</div>
                            </div>
                        </Link>

                        <Link to="/inventory" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center transition-all group active:scale-95 text-left">
                            <div className="bg-white/20 p-2.5 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                                <Droplets className="w-5 h-5 text-green-100" />
                            </div>
                            <div>
                                <div className="font-semibold tracking-wide">Update Inventory</div>
                                <div className="text-xs text-green-200 mt-0.5">Log consumption or stock</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
