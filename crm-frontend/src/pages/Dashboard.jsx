import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI } from '../services/api';
import LeadTable from '../components/Leads/LeadTable';
import LeadCharts from '../components/Charts/LeadCharts';
import LeadFilters from '../components/Leads/LeadFilters';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const { logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({ totalLeads: 0, convertedLeads: 0, conversionRate: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', dateRange: 'all' });
  const intervalRef = useRef(null);

  const getDateRangeParams = (range) => {
    const now = new Date();
    let from = null;
    switch (range) {
      case 'day':
        from = new Date(now.setHours(0,0,0,0)).toISOString().slice(0,19).replace('T', ' ');
        break;
      case 'week':
        from = new Date(now.setDate(now.getDate() - 7)).toISOString().slice(0,19).replace('T', ' ');
        break;
      case 'month':
        from = new Date(now.setMonth(now.getMonth() - 1)).toISOString().slice(0,19).replace('T', ' ');
        break;
      case 'year':
        from = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().slice(0,19).replace('T', ' ');
        break;
      default:
        from = null;
    }
    return from ? { from } : {};
  };

  const fetchLeads = async (showToast = false) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      const dateParams = getDateRangeParams(filters.dateRange);
      if (dateParams.from) params.append('from', dateParams.from);
      const url = `/leads${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await leadsAPI.getAll(url);
      
      // Check if new leads arrived (compare length)
      if (showToast && res.data.length > leads.length) {
        toast.success(`✨ ${res.data.length - leads.length} new lead(s) received!`);
      }
      
      setLeads(res.data);
      const total = res.data.length;
      const converted = res.data.filter(l => l.status === 'converted').length;
      const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
      setAnalytics({ totalLeads: total, convertedLeads: converted, conversionRate: rate });
      setError('');
    } catch (err) {
      setError('Failed to load leads');
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchLeads(false);
    intervalRef.current = setInterval(() => {
      fetchLeads(true); // show toast if new leads
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [filters]); // re-run when filters change

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchLeads(false);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex gap-2">
        <span>Delete this lead?</span>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            confirmDelete(id);
          }}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-gray-500 text-white px-2 py-1 rounded"
        >
          No
        </button>
      </div>
    ), { duration: 5000 });
  };

  const confirmDelete = async (id) => {
    try {
      await leadsAPI.delete(id);
      toast.success('Lead deleted');
      fetchLeads(false);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 md:p-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-600">Lead Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow text-center">
          <h3 className="text-gray-500 text-sm">Total Leads</h3>
          <p className="text-3xl font-bold text-primary-600">{analytics.totalLeads}</p>
        </div>
        <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow text-center">
          <h3 className="text-gray-500 text-sm">Converted Leads</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.convertedLeads}</p>
        </div>
        <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow text-center">
          <h3 className="text-gray-500 text-sm">Conversion Rate</h3>
          <p className="text-3xl font-bold text-primary-600">{analytics.conversionRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <LeadCharts leads={leads} />
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <LeadTable
          leads={leads}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          onRefresh={() => fetchLeads(false)}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;