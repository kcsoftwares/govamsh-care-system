import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Plus, Trash2, X, Database, ListFilter } from 'lucide-react';


export default function Admin() {
    const [values, setValues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('breed');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({ label: '', value: '' });
    const [sheds, setSheds] = useState<any[]>([]);

    const categories = [
        { id: 'breed', name: 'Breeds', description: 'Available cow breeds' },
        { id: 'cow_status', name: 'Statuses', description: 'Health and lifecycle statuses' },
        { id: 'staff_role', name: 'Staff Roles', description: 'Permissions for staff' },
        { id: 'staff', name: 'Staff Management', description: 'Manage users and assignments' }
    ];

    const fetchValues = async () => {
        try {
            setLoading(true);
            if (activeCategory === 'staff') {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*, sheds(name)')
                    .order('name');
                if (error) throw error;
                setValues(data || []);

                const { data: shedData } = await supabase.from('sheds').select('id, name');
                setSheds(shedData || []);
            } else {
                const { data, error } = await supabase
                    .from('lookup_values')
                    .select('*')
                    .eq('category', activeCategory)
                    .order('label');
                if (error) throw error;
                setValues(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchValues();
    }, [activeCategory]);

    const handleUpdateStaff = async (staffId: string, updates: any) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', staffId);
            if (error) throw error;
            fetchValues();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('lookup_values').insert([{
                ...formData,
                category: activeCategory
            }]);
            if (error) throw error;
            setIsModalOpen(false);
            setFormData({ label: '', value: '' });
            fetchValues();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const deleteValue = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('lookup_values').delete().eq('id', id);
            if (error) throw error;
            fetchValues();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                        <Settings className="w-8 h-8 mr-3 text-slate-600" />
                        Admin Panel
                    </h1>
                    <p className="text-neutral-500 mt-2">Manage dynamic data and system configuration.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all border ${activeCategory === cat.id
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md transform -translate-y-1'
                                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50'
                                }`}
                        >
                            <div className="font-bold flex items-center">
                                <Database className="w-4 h-4 mr-2 opacity-50" />
                                {cat.name}
                            </div>
                            <div className={`text-xs mt-1 ${activeCategory === cat.id ? 'text-slate-300' : 'text-neutral-400'}`}>
                                {cat.description}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
                            <h3 className="font-bold text-neutral-800 flex items-center">
                                <ListFilter className="w-5 h-5 mr-2 text-neutral-400" />
                                {categories.find(c => c.id === activeCategory)?.name} {activeCategory === 'staff' ? '' : 'Options'}
                            </h3>
                            {activeCategory !== 'staff' && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-3 py-1.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition"
                                >
                                    <Plus className="w-4 h-4 inline mr-1" /> Add New
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-neutral-100">
                            {loading ? (
                                <div className="p-12 text-center text-neutral-400 animate-pulse">Loading settings...</div>
                            ) : values.length === 0 ? (
                                <div className="p-12 text-center text-neutral-400">No data available for this category.</div>
                            ) : activeCategory === 'staff' ? (
                                values.map(staff => (
                                    <div key={staff.id} className="px-6 py-6 hover:bg-neutral-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xl border">
                                                    {staff.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-800 text-lg">{staff.name}</p>
                                                    <p className="text-sm text-neutral-400">{staff.phone || 'No phone set'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Role</label>
                                                    <select
                                                        value={staff.role}
                                                        onChange={(e) => handleUpdateStaff(staff.id, { role: e.target.value })}
                                                        className="text-sm bg-white border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
                                                    >
                                                        <option value="Caretaker">Caretaker</option>
                                                        <option value="Manager">Manager</option>
                                                        <option value="Vet">Vet</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Assigned Shed</label>
                                                    <select
                                                        value={staff.assigned_shed_id || ''}
                                                        onChange={(e) => handleUpdateStaff(staff.id, { assigned_shed_id: e.target.value || null })}
                                                        className="text-sm bg-white border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
                                                    >
                                                        <option value="">None</option>
                                                        {sheds.map(shed => (
                                                            <option key={shed.id} value={shed.id}>{shed.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                values.map(val => (
                                    <div key={val.id} className="px-6 py-4 flex justify-between items-center hover:bg-neutral-50 transition-colors group">
                                        <div>
                                            <p className="font-bold text-neutral-800">{val.label}</p>
                                            <p className="text-xs text-neutral-400 uppercase tracking-widest">{val.value}</p>
                                        </div>
                                        <button onClick={() => deleteValue(val.id)} className="p-2 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold">Add {categories.find(c => c.id === activeCategory)?.name}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Display Label</label>
                                <input required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value, value: (formData.value || e.target.value.toLowerCase().replace(/\s+/g, '-')) })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Gir" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Stored Value (ID)</label>
                                <input required value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono" />
                            </div>
                            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                                Add Option
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
