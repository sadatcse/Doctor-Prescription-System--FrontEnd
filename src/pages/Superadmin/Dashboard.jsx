import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import SectionTitle from '../../components/common/SectionTitle';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const axiosSecure = UseAxiosSecure();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) setIsRefreshing(true);
      else setLoading(true);

      const response = await axiosSecure.get('/dashboard/super-admin');
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <div className="p-10 text-center text-xl font-semibold animate-pulse text-gray-600">Loading Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-xl font-semibold text-red-500">{error}</div>;
  if (!data) return <div className="p-10 text-center">No data available.</div>;

  // Added pendingActions to the destructured data
  const { kpis, pendingActions, todaysActivity, thisMonthActivity, demographics, systemStats, recentActivity } = data;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format('MMM D, hh:mm A');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <SectionTitle
        title="Super Admin Dashboard"
        subtitle="Welcome back. Here is what is happening across your system today."
        actionText="Refresh Data"
        actionLoadingText="Refreshing..."
        isLoading={isRefreshing}
        onAction={() => fetchDashboardData(true)}
      />

      {/* --- TODAY'S ACTIVITY --- */}
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Today's Activity
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard title="Success Trx" value={todaysActivity.todaysSuccessfulTransactions} color="bg-green-50 text-green-700 border-green-200" />
          <KpiCard title="Failed Trx" value={todaysActivity.todaysFailedTransactions} color="bg-red-50 text-red-700 border-red-200" />
          <KpiCard title="Logins Today" value={todaysActivity.todaysLogins} color="bg-blue-50 text-blue-700 border-blue-200" />
          <KpiCard title="New Patients" value={todaysActivity.newPatientsToday} color="bg-purple-50 text-purple-700 border-purple-200" />
          <KpiCard title="Prescriptions" value={todaysActivity.todaysPrescriptions} color="bg-indigo-50 text-indigo-700 border-indigo-200" />
        </div>
      </div>

      {/* --- THIS MONTH'S ACTIVITY --- */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Monthly Activity
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard title="Success Trx" value={thisMonthActivity.thisMonthSuccessfulTransactions} color="bg-green-50 text-green-700 border-green-200" />
          <KpiCard title="Failed Trx" value={thisMonthActivity.thisMonthFailedTransactions} color="bg-red-50 text-red-700 border-red-200" />
          <KpiCard title="Logins" value={thisMonthActivity.thisMonthLogins} color="bg-blue-50 text-blue-700 border-blue-200" />
          <KpiCard title="New Patients" value={thisMonthActivity.newPatientsThisMonth} color="bg-purple-50 text-purple-700 border-purple-200" />
          <KpiCard title="Prescriptions" value={thisMonthActivity.thisMonthPrescriptions} color="bg-indigo-50 text-indigo-700 border-indigo-200" />
        </div>
      </div>

      {/* --- PENDING / ATTENTION NEEDED (NEW SECTION) --- */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
          Attention Needed
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Inactive Lab Tests" value={pendingActions.inactiveLabTests} color="bg-orange-50 text-orange-800 border-orange-200" />
          <KpiCard title="Pending Medicines" value={pendingActions.pendingMedicines} color="bg-amber-50 text-amber-800 border-amber-200" />
          <KpiCard title="Inactive Users" value={pendingActions.inactiveUsers} color="bg-yellow-50 text-yellow-800 border-yellow-200" />
          <KpiCard title="Draft Prescriptions" value={pendingActions.draftPrescriptions} color="bg-rose-50 text-rose-800 border-rose-200" />
        </div>
      </div>

      {/* --- GLOBAL KPIs --- */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Global Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Total Patients" value={kpis.totalPatients} color="bg-white text-gray-800" />
        <KpiCard title="Prescriptions" value={kpis.totalPrescriptions} color="bg-white text-gray-800" />
        <KpiCard title="Total Doctors" value={kpis.totalDoctors} color="bg-white text-gray-800" />
        <KpiCard title="Total Users" value={kpis.totalUsers} color="bg-white text-gray-800" />
        <KpiCard title="Chambers" value={kpis.totalChambers} color="bg-white text-gray-800" />
        <KpiCard title="Medicines" value={kpis.totalMedicines} color="bg-white text-gray-800" />
        <KpiCard title="Lab Depts" value={kpis.totalLabDepts} color="bg-white text-gray-800" />
        <KpiCard title="Lab Tests" value={kpis.totalLabTests} color="bg-white text-gray-800" />
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Prescriptions (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemStats.prescriptionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Patient Demographics (Gender)</h2>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={demographics.gender} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="count" nameKey="_id" label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                  {demographics.gender.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- DATA TABLES --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* User Logins Table */}
        <div className="bg-white p-0 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-700">Recent Logins</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role / Branch</th>
                  <th className="p-4 font-medium">Login Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.recentLogins.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{log.username || "N/A"}</p>
                      <p className="text-xs text-gray-500">{log.userEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs">{log.role}</span>
                      <span className="text-gray-500 text-xs block mt-1">Br: {log.branch}</span>
                    </td>
                    <td className="p-4 text-gray-600">{formatDate(log.loginTime)}</td>
                  </tr>
                ))}
                {recentActivity.recentLogins.length === 0 && (
                  <tr><td colSpan="3" className="p-4 text-center text-gray-500">No recent logins.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white p-0 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Code/Type</th>
                  <th className="p-4 font-medium">User Email</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-gray-800">{tx.transactionCode}</span>
                      <span className="text-xs text-gray-400 ml-2 border border-gray-200 rounded px-1">{tx.transactionType}</span>
                    </td>
                    <td className="p-4 text-gray-600">{tx.userEmail}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{formatDate(tx.transactionTime)}</td>
                  </tr>
                ))}
                {recentActivity.recentTransactions.length === 0 && (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">No recent transactions.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable KPI Card Component
const KpiCard = ({ title, value, color }) => (
  <div className={`p-5 rounded-xl shadow-sm border flex flex-col justify-center items-start ${color} ${!color.includes('bg-') ? 'bg-white border-gray-200' : ''}`}>
    <p className="text-xs font-medium mb-1 uppercase tracking-wider opacity-80">{title}</p>
    <h3 className="text-2xl font-bold">
      {value}
    </h3>
  </div>
);

export default Dashboard;