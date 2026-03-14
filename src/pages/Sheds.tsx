import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Layout, Plus, Users, Trash2, Edit2, X, Check } from 'lucide-react';

interface Shed {
    id: string;
    name: string;
    capacity: number;
    cow_count?: number;
}

export default function Sheds() {
    const [sheds, setSheds] = useState<Shed[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShed, setEditingShed] = useState<Shed | null>(null);
    const [formData, setFormData] = useState({ name: '', capacity: 0 });

    const fetchSheds = async () => {
        try {
            setLoading(true);
            // Fetch sheds and count cows in each
            const { data: shedsData, error: shedsError } = await supabase.from('sheds').select('*').order('name');
            if (shedsError) throw shedsError;

            const { data: cowCounts, error: countError } = await supabase
                .from('cows')
                .select('shed_id')
                .not('shed_id', 'is', null);

            if (countError) throw countError;

            const countsMap = cowCounts.reduce((acc: any, cow: any) => {
                acc[cow.shed_id] = (acc[cow.shed_id] || 0) + 1;
                return acc;
            }, {});

            setSheds(shedsData.map(s => ({ ...s, cow_count: countsMap[s.id] || 0 })));
        } catch (error) {
            console.error('Error fetching sheds:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheds();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingShed) {
                const { error } = await supabase.from('sheds').update(formData).eq('id', editingShed.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('sheds').insert([formData]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            setEditingShed(null);
            setFormData({ name: '', capacity: 0 });
            fetchSheds();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const deleteShed = async (id: string) => {
        if (!confirm('Are you sure? This may affect cows assigned to this shed.')) return;
        try {
            const { error } = await supabase.from('sheds').delete().eq('id', id);
            if (error) throw error;
            fetchSheds();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                        <Layout className="w-8 h-8 mr-3 text-green-600" />
                        Cow Shed Project
                    </h1>
                    <p className="text-neutral-500 mt-2">Manage housing, capacity, and distribution of the herd.</p>
                </div>
                <button
                    onClick={() => { setEditingShed(null); setFormData({ name: '', capacity: 0 }); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Shed
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-white border border-neutral-200 rounded-2xl animate-pulse" />)
                ) : sheds.map(shed => (
                    <div key={shed.id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-green-50 p-3 rounded-xl">
                                <Layout className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingShed(shed); setFormData({ name: shed.name, capacity: shed.capacity }); setIsModalOpen(true); }} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-blue-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteShed(shed.id)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800">{shed.name}</h3>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500">Current Occupancy</span>
                                <span className="font-bold text-neutral-800 flex items-center">
                                    <Users className="w-4 h-4 mr-1 text-neutral-400" />
                                    {shed.cow_count} / {shed.capacity}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${(shed.cow_count || 0) / shed.capacity > 0.9 ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(((shed.cow_count || 0) / shed.capacity) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingShed ? 'Edit Shed' : 'Create New Shed'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Shed Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. South Shed" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Total Capacity</label>
                                <input required type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <button className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">
                                {editingShed ? 'Update Shed' : 'Add Shed'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
