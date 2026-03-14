import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Plus, Calendar, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface HealthRecord {
    id: string;
    cow_id: string;
    checkup_date: string;
    description: string;
    diagnosis: string;
    treatment: string;
    cows?: { name: string, tag_number: string };
}

export default function Health() {
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [cows, setCows] = useState<{ id: string, name: string, tag_number: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ cow_id: '', description: '', diagnosis: '', treatment: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: recordsData } = await supabase
                .from('health_records')
                .select('*, cows(name, tag_number)')
                .order('checkup_date', { ascending: false });

            const { data: cowsData } = await supabase
                .from('cows')
                .select('id, name, tag_number')
                .order('name');

            setRecords(recordsData || []);
            setCows(cowsData || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('health_records').insert([{
                ...formData,
                checkup_date: new Date().toISOString()
            }]);
            if (error) throw error;
            setIsModalOpen(false);
            setFormData({ cow_id: '', description: '', diagnosis: '', treatment: '' });
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-red-500" />
                        Health Tracking
                    </h1>
                    <p className="text-neutral-500 mt-2">Log medical checkups, vaccinations, and treatment history.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition active:scale-95 shadow-sm flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Log Checkup
                </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 border-b">
                            <tr>
                                <th className="p-4 px-6">Date</th>
                                <th className="p-4 px-6">Cow</th>
                                <th className="p-4 px-6">Diagnosis</th>
                                <th className="p-4 px-6">Treatment</th>
                                <th className="p-4 px-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-neutral-400 animate-pulse">Loading records...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-neutral-400 italic">No health records logged yet.</td></tr>
                            ) : records.map(record => (
                                <tr key={record.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="p-4 px-6 font-medium text-neutral-600">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-neutral-300" />
                                            {new Date(record.checkup_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 px-6 font-bold text-neutral-800">
                                        {record.cows?.name} ({record.cows?.tag_number})
                                    </td>
                                    <td className="p-4 px-6">{record.diagnosis || 'General Checkup'}</td>
                                    <td className="p-4 px-6 text-neutral-500">{record.treatment}</td>
                                    <td className="p-4 px-6">
                                        <span className="flex items-center text-green-600 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Recorded
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                Record Health Log
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Select Cow *</label>
                                <select required value={formData.cow_id} onChange={e => setFormData({ ...formData, cow_id: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                                    <option value="">Choose Cow...</option>
                                    {cows.map(cow => <option key={cow.id} value={cow.id}>{cow.name} ({cow.tag_number})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Diagnosis / Concern</label>
                                <input required value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Fever, Foot & Mouth" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Treatment Plan</label>
                                <textarea required value={formData.treatment} onChange={e => setFormData({ ...formData, treatment: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" rows={3} placeholder="Prescribed medicines or actions..." />
                            </div>
                            <button className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">
                                Save Health Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
