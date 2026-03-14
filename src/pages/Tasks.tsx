import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Circle, CheckCircle2, Clock, Plus, X } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    due_date: string;
    assigned_to: string;
    profiles?: { name: string };
}

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [formData, setFormData] = useState({ title: '', description: '', assigned_to: '', due_date: new Date().toISOString().split('T')[0] });

    const fetchTasks = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // Fetch profile to check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setUserProfile(profile);

            let query = supabase.from('tasks').select('*, profiles:assigned_to(name)');

            if (profile?.role === 'Caretaker' || profile?.role === 'Vet') {
                query = query.eq('assigned_to', user.id);
            }

            const { data, error } = await query
                .order('status', { ascending: false })
                .order('due_date', { ascending: true });

            if (error) throw error;
            setTasks(data || []);

            if (profile?.role === 'Admin' || profile?.role === 'Manager') {
                const { data: staff } = await supabase.from('profiles').select('id, name');
                setStaffList(staff || []);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const toggleTaskStatus = async (task: Task) => {
        try {
            const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
            setTasks(current => current.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
            if (error) throw error;
        } catch (error) {
            console.error('Error toggling task:', error);
            fetchTasks();
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('tasks').insert([formData]);
            if (error) throw error;
            setIsModalOpen(false);
            setFormData({ title: '', description: '', assigned_to: '', due_date: new Date().toISOString().split('T')[0] });
            fetchTasks();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const isAdmin = userProfile?.role === 'Admin' || userProfile?.role === 'Manager';
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight flex items-center">
                        <CheckSquare className="w-8 h-8 mr-3 text-green-600" />
                        Daily Routine
                    </h1>
                    <p className="text-neutral-500 mt-2 text-lg">
                        {isAdmin ? 'Manage all goushal tasks' : `Your assigned tasks for today, ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.`}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition active:scale-95 flex items-center">
                        <Plus className="w-5 h-5 mr-2" /> Assign New Task
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-neutral-800">Overall Progress</h2>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {completedCount} of {tasks.length} Completed
                    </span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-700 ease-out rounded-full" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex animate-pulse items-center gap-4">
                                <div className="w-6 h-6 bg-neutral-200 rounded-md"></div>
                                <div className="flex-1 space-y-2"><div className="h-4 bg-neutral-200 w-1/3 rounded"></div><div className="h-3 bg-neutral-200 w-1/2 rounded"></div></div>
                            </div>
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6"><CheckSquare className="w-10 h-10 text-green-500" /></div>
                        <h3 className="text-2xl font-bold text-neutral-800 mb-2">No tasks found</h3>
                        <p className="text-neutral-500 text-lg">There are no pending tasks assigned at the moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {tasks.map(task => {
                            const isCompleted = task.status === 'Completed';
                            return (
                                <div key={task.id} className={`p-5 flex items-start gap-4 transition-colors hover:bg-neutral-50/80 cursor-pointer ${isCompleted ? 'bg-neutral-50/50' : ''}`} onClick={() => toggleTaskStatus(task)}>
                                    <button className="mt-1 flex-shrink-0">{isCompleted ? <CheckCircle2 className="w-7 h-7 text-green-500" /> : <Circle className="w-7 h-7 text-neutral-300 hover:text-green-500" />}</button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-lg font-bold ${isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{task.title}</p>
                                            {isAdmin && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{task.profiles?.name}</span>}
                                        </div>
                                        {task.description && <p className={`text-sm mt-1 ${isCompleted ? 'text-neutral-400' : 'text-neutral-500'}`}>{task.description}</p>}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${isCompleted ? 'bg-neutral-100 text-neutral-400' : 'bg-orange-50 text-orange-700'}`}><Clock className="w-3.5 h-3.5 mr-1.5" />Due {task.due_date}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold">Assign New Task</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Task Title *</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="e.g. Clean Shed A" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 border rounded-lg" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Assign To *</label>
                                    <select required value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full p-2.5 border rounded-lg">
                                        <option value="">Choose Staff...</option>
                                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Due Date</label>
                                    <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">Create Task</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
