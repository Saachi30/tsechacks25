import React from 'react'

export const MyMusic = () => {
    const myTracks = [
        {
          id: 1,
          title: "Summer Vibes",
          coverImage: "/api/placeholder/200/200",
          rights: "Full Rights",
          collaborators: 2,
          royaltySplit: "60/40",
          status: "Active",
          lastUpdated: "2024-01-15",
          genre: "Pop"
        },
        {
          id: 2,
          title: "Midnight Dreams",
          coverImage: "/api/placeholder/200/200",
          rights: "Partial Rights",
          collaborators: 3,
          royaltySplit: "40/30/30",
          status: "Active",
          lastUpdated: "2024-01-20",
          genre: "Electronic"
        },
        {
          id: 3,
          title: "Urban Flow",
          coverImage: "/api/placeholder/200/200",
          rights: "Full Rights",
          collaborators: 1,
          royaltySplit: "100",
          status: "Under Review",
          lastUpdated: "2024-01-25",
          genre: "Hip Hop"
        },
        {
          id: 4,
          title: "Rock Anthem",
          coverImage: "/api/placeholder/200/200",
          rights: "Shared Rights",
          collaborators: 4,
          royaltySplit: "25/25/25/25",
          status: "Active",
          lastUpdated: "2024-01-28",
          genre: "Rock"
        }
      ];
  
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Music</h1>
            <p className="text-gray-600">Manage your music and rights</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Upload New Track
          </button>
        </div>
  
        <div className="grid grid-cols-1 gap-4">
          {myTracks.map((track) => (
            <div key={track.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={track.coverImage} 
                  alt={track.title} 
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{track.title}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Rights Status</p>
                      <p className="font-medium">{track.rights}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Collaborators</p>
                      <p className="font-medium">{track.collaborators}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Royalty Split</p>
                      <p className="font-medium">{track.royaltySplit}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Manage Rights
                  </button>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
