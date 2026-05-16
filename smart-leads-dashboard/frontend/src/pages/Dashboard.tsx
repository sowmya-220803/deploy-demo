import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Lead {
    _id: string;
    name: string;
    email: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
    source: 'Website' | 'Instagram' | 'Referral';
    createdAt: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Filters
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [status, setStatus] = useState('');
    const [source, setSource] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState<Partial<Lead>>({ status: 'New', source: 'Website' });
    const [isEditing, setIsEditing] = useState(false);
    const [modalError, setModalError] = useState('');

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                sort_by: sortBy
            });
            if (debouncedSearch) params.append('search_term', debouncedSearch);
            if (status) params.append('status', status);
            if (source) params.append('source', source);

            const { data } = await api.get(`/leads?${params.toString()}`);
            setLeads(data.leads);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [page, debouncedSearch, status, source, sortBy]);

    useEffect(() => {
        setPage(1); // Reset page on filter changes
    }, [debouncedSearch, status, source, sortBy]);

    const handleExport = async () => {
        try {
            const response = await api.get('/leads/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leads.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;
        try {
            await api.delete(`/leads/${id}`);
            fetchLeads();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete lead. Note: Only Admins can delete.');
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentLead({ status: 'New', source: 'Website', name: '', email: '' });
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (lead: Lead) => {
        setIsEditing(true);
        setCurrentLead(lead);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        try {
            if (isEditing && currentLead._id) {
                await api.put(`/leads/${currentLead._id}`, currentLead);
            } else {
                await api.post('/leads', currentLead);
            }
            setIsModalOpen(false);
            fetchLeads();
        } catch (error: any) {
            setModalError(error.response?.data?.message || 'Error processing request');
        }
    };

    const statusColors: Record<string, string> = {
        'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'Contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'Qualified': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'Lost': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Leads Management</h1>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="btn-primary bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 dark:bg-dark-surface dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Lead
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="input-field pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                </select>
                <select className="input-field" value={source} onChange={(e) => setSource(e.target.value)}>
                    <option value="">All Sources</option>
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                </select>
                <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No leads found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {lead.source}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(lead)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-primary">Previous</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-primary">Next</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-dark-surface dark:text-gray-300 hover:bg-gray-50 disabled:opacity-50">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-dark-surface dark:text-gray-300 hover:bg-gray-50 disabled:opacity-50">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500/75 dark:bg-black/80 backdrop-blur-sm"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="relative z-10 inline-block align-bottom bg-white dark:bg-dark-surface rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-gray-800">
                            <form onSubmit={handleSaveLead}>
                                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            {isEditing ? 'Edit Lead' : 'Add New Lead'}
                                        </h3>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                    {modalError && (
                                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-md text-sm">
                                            {modalError}
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                            <input type="text" required className="input-field mt-1" value={currentLead.name || ''} onChange={e => setCurrentLead({...currentLead, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                            <input type="email" required className="input-field mt-1" value={currentLead.email || ''} onChange={e => setCurrentLead({...currentLead, email: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                            <select className="input-field mt-1" value={currentLead.status} onChange={e => setCurrentLead({...currentLead, status: e.target.value as any})}>
                                                <option value="New">New</option>
                                                <option value="Contacted">Contacted</option>
                                                <option value="Qualified">Qualified</option>
                                                <option value="Lost">Lost</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
                                            <select className="input-field mt-1" value={currentLead.source} onChange={e => setCurrentLead({...currentLead, source: e.target.value as any})}>
                                                <option value="Website">Website</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Referral">Referral</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 dark:border-gray-800">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                        {isEditing ? 'Save Changes' : 'Create Lead'}
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-dark-surface text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
