import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Music, 
  DollarSign,
  BarChart2,
  Clock,
  Download,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+12.5%',
      icon: <DollarSign className="w-6 h-6 text-blue-500" />,
      trend: 'up'
    },
    {
      title: 'Active Licenses',
      value: '126',
      change: '+8.2%',
      icon: <Music className="w-6 h-6 text-purple-500" />,
      trend: 'up'
    },
    {
      title: 'Monthly Streams',
      value: '452.1K',
      change: '+24.5%',
      icon: <BarChart2 className="w-6 h-6 text-green-500" />,
      trend: 'up'
    },
    {
      title: 'Total Artists',
      value: '2,815',
      change: '+3.2%',
      icon: <Users className="w-6 h-6 text-orange-500" />,
      trend: 'up'
    }
  ];

  const recentActivity = [
    {
      title: 'New License Purchase',
      description: '"Summer Vibes" licensed by Commercial Studio',
      time: '2 hours ago',
      amount: '+$299.99',
      type: 'license'
    },
    {
      title: 'Royalty Payment',
      description: 'Monthly streaming royalties distributed',
      time: '5 hours ago',
      amount: '+$1,248.32',
      type: 'royalty'
    },
    {
      title: 'New NFT Minted',
      description: '"Digital Dreams" collection launched',
      time: '8 hours ago',
      amount: null,
      type: 'nft'
    }
  ];

  const topTracks = [
    {
      title: 'Summer Vibes',
      artist: 'John Doe',
      streams: '125K',
      revenue: '$1,234',
      change: '+12.3%'
    },
    {
      title: 'Midnight Dreams',
      artist: 'Sarah Smith',
      streams: '98K',
      revenue: '$986',
      change: '+8.7%'
    },
    {
      title: 'Urban Flow',
      artist: 'Mike Wilson',
      streams: '87K',
      revenue: '$876',
      change: '+15.2%'
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-blue-50">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, Alex</h1>
          <p className="text-gray-600">Here's what's happening with your music</p>
        </div>
        <Link to='/upload'><button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Upload New Track
        </button></Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">{stat.title}</h3>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-blue-600 text-sm hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'license' ? 'bg-green-50' :
                  activity.type === 'royalty' ? 'bg-blue-50' : 'bg-purple-50'
                }`}>
                  {activity.type === 'license' ? <Download className="w-5 h-5 text-green-500" /> :
                   activity.type === 'royalty' ? <DollarSign className="w-5 h-5 text-blue-500" /> :
                   <Share2 className="w-5 h-5 text-purple-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{activity.title}</h3>
                    {activity.amount && <span className="text-green-500 font-medium">{activity.amount}</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-sm text-gray-400 mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Top Performing Tracks</h2>
            <button className="text-blue-600 text-sm hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-6">
            {topTracks.map((track, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{track.title}</h3>
                    <p className="text-sm text-gray-500">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{track.revenue}</p>
                  <p className="text-sm text-green-500">{track.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;