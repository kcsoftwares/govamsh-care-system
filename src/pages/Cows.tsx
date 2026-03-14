import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Plus, HeartPulse, X, Upload } from 'lucide-react';

interface Cow {
    id: string;
    tag_number: string;
    name: string;
    breed: string;
    age_years: number;
    age_months: number;
    gender: string;
    status: string;
    photo_url: string;
    shed_id: string;
}

export default function Cows() {
    const [cows, setCows] = useState<Cow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [breeds, setBreeds] = useState<string[]>(['Desi', 'Gir', 'Sahiwal', 'Tharparkar', 'Holstein']);
    const [sheds, setSheds] = useState<{ id: string, name: string }[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
    const [editingCow, setEditingCow] = useState<Cow | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        tag_number: '',
        name: '',
        breed: 'Desi',
        shed_id: '',
        age_years: 0,
        age_months: 0,
        gender: 'Female',
        status: 'Healthy',
        photo: null as File | null
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: cowsData, error: cowsError } = await supabase.from('cows').select('*').order('created_at', { ascending: false });
            if (cowsError) throw cowsError;
            setCows(cowsData || []);

            const { data: shedsData } = await supabase.from('sheds').select('id, name').order('name');
            if (shedsData) setSheds(shedsData);

            const { data: breedData } = await supabase.from('lookup_values').select('label').eq('category', 'breed');
            if (breedData && breedData.length > 0) setBreeds(breedData.map(b => b.label));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'age_years' || name === 'age_months') ? Number(value) : value }));
    };

    const openEditModal = (cow: Cow) => {
        setEditingCow(cow);
        setFormData({
            tag_number: cow.tag_number,
            name: cow.name || '',
            breed: cow.breed || 'Desi',
            shed_id: cow.shed_id || '',
            age_years: cow.age_years || 0,
            age_months: cow.age_months || 0,
            gender: cow.gender || 'Female',
            status: cow.status || 'Healthy',
            photo: null
        });
        setIsModalOpen(true);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let photo_url = editingCow?.photo_url || null;

            if (formData.photo) {
                const fileExt = formData.photo.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('cow_photos')
                    .upload(filePath, formData.photo);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                } else if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('cow_photos')
                        .getPublicUrl(filePath);
                    photo_url = publicUrl;
                }
            }

            const cowData = {
                tag_number: formData.tag_number,
                name: formData.name,
                breed: formData.breed,
                shed_id: formData.shed_id || null,
                age_years: formData.age_years,
                age_months: formData.age_months,
                gender: formData.gender,
                status: formData.status,
                photo_url: photo_url
            };

            if (editingCow) {
                const { error } = await supabase.from('cows').update(cowData).eq('id', editingCow.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('cows').insert([cowData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingCow(null);
            setFormData({
                tag_number: '', name: '', breed: breeds[0] || 'Desi', shed_id: '', age_years: 0, age_months: 0, gender: 'Female', status: 'Healthy', photo: null
            });
            fetchData();

        } catch (error: any) {
            alert("Error saving cow: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCows = cows.filter(cow => {
        const matchesSearch = cow.tag_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cow.name && cow.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterStatus === 'All' || cow.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Sick': return 'bg-red-100 text-red-700 border-red-200';
            case 'Pregnant': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Lactating': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Calf': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Old': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight flex items-center">
                        <HeartPulse className="w-8 h-8 mr-3 text-green-600" />
                        Cow Registry
                    </h1>
                    <p className="text-neutral-500 mt-2 text-lg">Manage profiles and health records for the entire herd.</p>
                </div>
                <button
                    onClick={() => { setEditingCow(null); setFormData({ tag_number: '', name: '', breed: breeds[0] || 'Desi', shed_id: '', age_years: 0, age_months: 0, gender: 'Female', status: 'Healthy', photo: null }); setIsModalOpen(true); }}
                    className="flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-sm active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Cow
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by Tag Number or Name..."
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative group">
                    <button className="flex items-center justify-center px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition">
                        <Filter className="w-5 h-5 mr-2 text-neutral-500" />
                        Filters
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                        <div className="p-2 space-y-1">
                            {['All', 'Healthy', 'Sick', 'Pregnant', 'Lactating', 'Calf'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${filterStatus === status ? 'bg-green-50 text-green-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-neutral-400 animate-pulse">Loading Registry...</div>
                ) : filteredCows.length === 0 ? (
                    <div className="p-12 text-center">
                        <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold">No cows found</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500 border-b">
                                <tr>
                                    <th className="p-4 px-6">Tag</th>
                                    <th className="p-4 px-6">Profile</th>
                                    <th className="p-4 px-6">Age</th>
                                    <th className="p-4 px-6">Status</th>
                                    <th className="p-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredCows.map(cow => (
                                    <tr key={cow.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="p-4 px-6 font-bold">{cow.tag_number}</td>
                                        <td className="p-4 px-6 flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 border mr-3 overflow-hidden">
                                                {cow.photo_url ? <img src={cow.photo_url} className="w-full h-full object-cover" /> : <HeartPulse className="p-2 text-neutral-400" />}
                                            </div>
                                            <div>
                                                <div className="font-bold">{cow.name || 'Unnamed'}</div>
                                                <div className="text-xs text-neutral-500">{cow.breed}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 px-6">{cow.age_years}y {cow.age_months}m</td>
                                        <td className="p-4 px-6">
                                            <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getStatusColor(cow.status)}`}>
                                                {cow.status}
                                            </span>
                                        </td>
                                        <td className="p-4 px-6 text-right space-x-2">
                                            <button onClick={() => openEditModal(cow)} className="text-blue-600 hover:underline font-semibold">Edit</button>
                                            <button onClick={() => setSelectedCow(cow)} className="text-green-600 hover:underline font-semibold pl-2">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{editingCow ? 'Edit Cow' : 'New Cow'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Cow Photo</label>
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-neutral-50 cursor-pointer">
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                                    {formData.photo || (editingCow && editingCow.photo_url) ? (
                                        <div className="text-green-600 font-semibold">{formData.photo ? formData.photo.name : 'Photo attached'}</div>
                                    ) : (
                                        <div className="text-neutral-400"><Upload className="w-8 h-8 mx-auto mb-2" />Click to upload</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Tag *</label>
                                    <input required name="tag_number" value={formData.tag_number} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg" placeholder="TAG-001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg" placeholder="Surabhi" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Years</label>
                                        <input type="number" name="age_years" value={formData.age_years} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Months</label>
                                        <input type="number" name="age_months" value={formData.age_months} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Breed</label>
                                    <select name="breed" value={formData.breed} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg">
                                        {breeds.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Shed</label>
                                    <select name="shed_id" value={formData.shed_id} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg">
                                        <option value="">No Shed</option>
                                        {sheds.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg">
                                        <option>Healthy</option>
                                        <option>Symptomatic</option>
                                        <option>Sick</option>
                                        <option>Pregnant</option>
                                        <option>Lactating</option>
                                    </select>
                                </div>
                            </div>

                            <button disabled={isSubmitting} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:bg-neutral-300">
                                {isSubmitting ? 'Saving...' : 'Save Cow Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {selectedCow && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
                        <div className="h-40 bg-green-50 flex items-center justify-center relative">
                            {selectedCow.photo_url ? <img src={selectedCow.photo_url} className="w-full h-full object-cover" /> : <HeartPulse className="w-12 h-12 text-green-200" />}
                            <button onClick={() => setSelectedCow(null)} className="absolute top-3 right-3 p-1.5 bg-black/10 rounded-full text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedCow.name || 'Unnamed'}</h2>
                                    <p className="text-neutral-500">{selectedCow.tag_number}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(selectedCow.status)}`}>{selectedCow.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-neutral-50 p-2 rounded">
                                    <div className="text-neutral-400 text-[10px] uppercase">Breed</div>
                                    <div className="font-bold">{selectedCow.breed}</div>
                                </div>
                                <div className="bg-neutral-50 p-2 rounded">
                                    <div className="text-neutral-400 text-[10px] uppercase">Age</div>
                                    <div className="font-bold">{selectedCow.age_years}y {selectedCow.age_months}m</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
