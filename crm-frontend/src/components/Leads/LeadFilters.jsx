import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

const dateRanges = [
  { label: 'Today', value: 'day' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last Year', value: 'year' },
  { label: 'All', value: 'all' },
];

const LeadFilters = ({ filters, onFilterChange }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [dateRange, setDateRange] = useState(filters.dateRange || 'all');
  const debounceRef = useRef(null);

  // Debounce search: wait 500ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search, status, dateRange });
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Status and date range apply immediately (no debounce)
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onFilterChange({ search, status: newStatus, dateRange });
  };

  const handleDateRange = (range) => {
    setDateRange(range);
    onFilterChange({ search, status, dateRange: range });
  };

  return (
    <div className="bg-white dark:bg-dark-200 p-4 rounded-xl shadow mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Search</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, phone..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="px-3 py-2 border rounded-lg focus:ring-primary-500"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date Range</label>
          <div className="flex gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleDateRange(range.value)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  dateRange === range.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-dark-100 hover:bg-gray-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;