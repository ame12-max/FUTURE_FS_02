import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { leadsAPI } from "../services/api";
import LeadTable from "../components/Leads/LeadTable";
import LeadCharts from "../components/Charts/LeadCharts";
import LeadFilters from "../components/Leads/LeadFilters";
import Pagination from "../components/common/Pagination";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const { logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateRange: "all",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 10,
  });

  const getDateRangeParams = (range) => {
    const now = new Date();
    let from = null;
    switch (range) {
      case "day":
        from = new Date(now.setHours(0, 0, 0, 0))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        break;
      case "week":
        from = new Date(now.setDate(now.getDate() - 7))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        break;
      case "month":
        from = new Date(now.setMonth(now.getMonth() - 1))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        break;
      case "year":
        from = new Date(now.setFullYear(now.getFullYear() - 1))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        break;
      default:
        from = null;
    }
    return from ? { from } : {};
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Source",
      "Status",
      "Created At",
      "Message",
    ];
    const rows = leads.map((lead) => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone || "",
      lead.source,
      lead.status,
      new Date(lead.created_at).toLocaleString(),
      lead.message || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const fetchLeads = async (showToast = false, currentLeads = leads) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      const dateParams = getDateRangeParams(filters.dateRange);
      if (dateParams.from) params.append("from", dateParams.from);
      params.append("page", pagination.page);
      params.append("limit", pagination.limit);
      const url = `/leads${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await leadsAPI.getAll(url);
      const newLeads = res.data.data;

      if (showToast && newLeads.length > currentLeads.length) {
        toast.success(`✨ ${newLeads.length - currentLeads.length} new lead(s) received!`);
      }

      setLeads(newLeads);
      setPagination((prev) => ({ ...prev, ...res.data.pagination }));

      const analyticsRes = await leadsAPI.getAnalytics();
      setAnalytics({
        totalLeads: analyticsRes.data.totalLeads,
        convertedLeads: analyticsRes.data.convertedLeads,
        conversionRate: analyticsRes.data.conversionRate,
      });
    } catch (err) {
      setError("Failed to load leads");
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters/page change
  useEffect(() => {
    fetchLeads(false);
  }, [filters, pagination.page]);

  // Poll every 5 seconds using latest filters and page
  useEffect(() => {
    const interval = setInterval(() => {
      // Use a copy of the current leads to compare inside fetchLeads
      fetchLeads(true, leads);
    }, 5000);
    return () => clearInterval(interval);
  }, [filters, pagination.page, leads]); // re-create interval when filters/page change

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      toast.success("Status updated successfully");
      fetchLeads(false);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = async (id) => {
    try {
      await leadsAPI.delete(id);
      toast.success("Lead deleted");
      fetchLeads(false);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
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
      ),
      { duration: 5000 }
    );
  };

  if (loading && leads.length === 0)
    return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 md:p-8">
      <Toaster position="top-right" />
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-primary-600">Lead Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Export CSV
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow text-center">
          <h3 className="text-gray-500 text-sm">Total Leads</h3>
          <p className="text-3xl font-bold text-primary-600">
            {analytics.totalLeads}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow text-center">
          <h3 className="text-gray-500 text-sm">Converted Leads</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics.convertedLeads}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow text-center">
          <h3 className="text-gray-500 text-sm">Conversion Rate</h3>
          <p className="text-3xl font-bold text-primary-600">
            {analytics.conversionRate}%
          </p>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) =>
            setPagination((prev) => ({ ...prev, page: newPage }))
          }
        />
      )}
    </div>
  );
};

export default Dashboard;