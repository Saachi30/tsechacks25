import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp,
  Users,
  Globe,
  Music
} from 'lucide-react';

const Analytics = () => {
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  const metrics = [
    {
      label: 'Total Revenue',
      value: '$45,231',
      change: '+12.5%',
      icon: <TrendingUp className="text-green-500" />
    },
    {
      label: 'Active Listeners',
      value: '12.5K',
      change: '+8.2%',
      icon: <Users className="text-blue-500" />
    },
    {
      label: 'Global Reach',
      value: '45 Countries',
      change: '+3 New',
      icon: <Globe className="text-purple-500" />
    },
    {
      label: 'Total Tracks',
      value: '128',
      change: '+5 New',
      icon: <Music className="text-orange-500" />
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your music performance and revenue</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                {metric.icon}
              </div>
              <span className={`text-sm ${
                metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {metric.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">{metric.label}</h3>
            <p className="text-2xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Performing Tracks</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium">Track Title {item}</p>
                    <p className="text-sm text-gray-500">Genre • Duration</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$1,234</p>
                  <p className="text-sm text-green-500">+12.3%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;