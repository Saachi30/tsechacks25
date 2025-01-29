import React from 'react'

export const Streaming = () => {
    const tracks = [
      {
        id: 1,
        title: "Summer Vibes",
        artist: "John Doe",
        duration: "3:45",
        plays: 12500,
        revenue: "$1,250",
        coverImage: "/api/placeholder/40/40",
        trend: "+12%",
        genre: "Pop"
      },
      {
        id: 2,
        title: "Midnight Dreams",
        artist: "The Midnight Band",
        duration: "4:20",
        plays: 28750,
        revenue: "$2,875",
        coverImage: "/api/placeholder/40/40",
        trend: "+25%",
        genre: "Rock"
      },
      {
        id: 3,
        title: "Digital Love",
        artist: "Sarah Williams",
        duration: "3:15",
        plays: 18900,
        revenue: "$1,890",
        coverImage: "/api/placeholder/40/40",
        trend: "+8%",
        genre: "Electronic"
      },
      {
        id: 4,
        title: "Urban Nights",
        artist: "MC Flow",
        duration: "3:55",
        plays: 35200,
        revenue: "$3,520",
        coverImage: "/api/placeholder/40/40",
        trend: "+30%",
        genre: "Hip Hop"
      },
      {
        id: 5,
        title: "Acoustic Dreams",
        artist: "John Doe",
        duration: "4:10",
        plays: 9800,
        revenue: "$980",
        coverImage: "/api/placeholder/40/40",
        trend: "+5%",
        genre: "Acoustic"
      }
    ];
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Streaming</h1>
        <p className="text-gray-600 mb-6">Monitor your music's streaming performance</p>
  
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Plays</p>
            <p className="text-2xl font-bold">105,150</p>
            <p className="text-sm text-green-600">+18% this month</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold">$10,515</p>
            <p className="text-sm text-green-600">+22% this month</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Active Listeners</p>
            <p className="text-2xl font-bold">45,230</p>
            <p className="text-sm text-green-600">+15% this month</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Average Daily Plays</p>
            <p className="text-2xl font-bold">3,505</p>
            <p className="text-sm text-green-600">+12% this month</p>
          </div>
        </div>
  
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Your Tracks</h2>
          </div>
  
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Plays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tracks.map((track) => (
                <tr key={track.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={track.coverImage}
                        alt={track.title}
                        className="w-8 h-8 rounded-lg mr-3"
                      />
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{track.genre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{track.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {track.plays.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600">{track.trend}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{track.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800">
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
