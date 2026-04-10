import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const LeadCharts = ({ leads }) => {
  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const pieData = {
    labels: ['New', 'Contacted', 'Converted'],
    datasets: [{
      data: [statusCounts.new, statusCounts.contacted, statusCounts.converted],
      backgroundColor: ['#f97316', '#3b82f6', '#10b981'],
    }],
  };

  // Last 7 days leads (simplified)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0,10);
  }).reverse();
  const dailyLeads = last7Days.map(date => leads.filter(l => l.created_at?.slice(0,10) === date).length);

  const barData = {
    labels: last7Days.map(d => d.slice(5)),
    datasets: [{
      label: 'Leads per day',
      data: dailyLeads,
      backgroundColor: '#f97316',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-dark-200 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Lead Status Distribution</h3>
        <div className="h-64">
          <Pie data={pieData} options={options} />
        </div>
      </div>
      <div className="bg-white dark:bg-dark-200 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Leads (Last 7 Days)</h3>
        <div className="h-64">
          <Bar data={barData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default LeadCharts;