const statusColors = {
  new: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  converted: 'bg-green-100 text-green-800',
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default StatusBadge;