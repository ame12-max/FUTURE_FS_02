import { useState } from 'react';
import StatusBadge from './StatusBadge';
import NotesModal from './NotesModal';
import { FiEye, FiTrash2 } from 'react-icons/fi';

const LeadTable = ({ leads, onStatusUpdate, onDelete, onRefresh }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  const statusOptions = ['new', 'contacted', 'converted'];

  // Row background based on status
  const getRowClass = (status) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
      case 'contacted':
        return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30';
      case 'converted':
        return 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30';
      default:
        return 'hover:bg-gray-50 dark:hover:bg-dark-100';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leads.map((lead) => (
              <tr key={lead.id} className={`transition-colors duration-200 ${getRowClass(lead.status)}`}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{lead.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.source}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusUpdate(lead.id, e.target.value)}
                    className={`text-sm rounded-full px-3 py-1 border focus:ring-primary-500 font-medium ${
                      lead.status === 'new' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      lead.status === 'contacted' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-green-100 text-green-800 border-green-300'
                    }`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => { setSelectedLead(lead); setShowNotes(true); }}
                    className="text-primary-600 hover:text-primary-800"
                    title="View Notes"
                  >
                    <FiEye className="inline cursor-pointer" />
                  </button>
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Lead"
                  >
                    <FiTrash2 className="inline cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNotes && selectedLead && (
        <NotesModal
          lead={selectedLead}
          onClose={() => setShowNotes(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default LeadTable;