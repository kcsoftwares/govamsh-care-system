import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Plus, AlertTriangle, Database, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface InventoryItem {
    id: string;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    last_updated: string;
}

export default function Inventory() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ item_name: '', category: 'Feed', quantity: 0, unit: 'kg' });

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('inventory').select('*').order('item_name');
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 0) return;
        try {
            const { error } = await supabase
                .from('inventory')
                .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            fetchInventory();
        } catch (error: any) {
            console.error('Error updating stock:', error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('inventory').insert([formData]);
            if (error) throw error;
            setIsModalOpen(false);
            setFormData({ item_name: '', category: 'Feed', quantity: 0, unit: 'kg' });
            fetchInventory();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                        <Package className="w-8 h-8 mr-3 text-orange-500" />
                        Inventory Control
                    </h1>
                    <p className="text-neutral-500 mt-2">Track feed consumption, medicine stock, and supplies.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition active:scale-95 shadow-sm flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border" />)
                ) : items.map(item => (
                    <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${item.quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                <Database className="w-5 h-5" />
                            </div>
                            {item.quantity < 10 && (
                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> LOW STOCK
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-neutral-800 truncate">{item.item_name}</h3>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-neutral-900">{item.quantity}</span>
                                <span className="text-sm font-semibold text-neutral-400 uppercase tracking-tighter">{item.unit}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => updateQuantity(item.id, Number(item.quantity) - 1)}
                                    className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    title="Decrease Stock"
                                >
                                    <ArrowDownRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}
                                    className="p-1.5 hover:bg-green-50 text-neutral-400 hover:text-green-600 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                    title="Increase Stock"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-50 flex justify-between text-xs font-medium text-neutral-500">
                            <span>{item.category}</span>
                            <span className="text-neutral-300">Updated {new Date(item.last_updated).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold">Register New Stock</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Item Name</label>
                                <input required value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Dry Fodder" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 border rounded-lg">
                                        <option>Feed</option>
                                        <option>Medicine</option>
                                        <option>Equipment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Quantity</label>
                                    <input required type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Unit</label>
                                <input required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. kg, boxes, liters" />
                            </div>
                            <button className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition">
                                Add to Inventory
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
