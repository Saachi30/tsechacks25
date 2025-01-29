import React from 'react'

export const Collaborators = () => {
    const collaborations = [
        {
          id: 1,
          track: "Summer Vibes",
          owner: "0x1234...5678",
          yourRole: "Producer",
          royaltySplit: "25%",
          earnings: "$1,234",
          status: "Active",
          lastPayout: "2024-01-15",
          nextPayout: "2024-02-15"
        },
        {
          id: 2,
          track: "Midnight Dreams",
          owner: "0x8765...4321",
          yourRole: "Featured Artist",
          royaltySplit: "30%",
          earnings: "$2,150",
          status: "Active",
          lastPayout: "2024-01-20",
          nextPayout: "2024-02-20"
        },
        {
          id: 3,
          track: "Urban Flow",
          owner: "0x5432...8765",
          yourRole: "Songwriter",
          royaltySplit: "15%",
          earnings: "$875",
          status: "Under Review",
          lastPayout: "2024-01-10",
          nextPayout: "2024-02-10"
        },
        {
          id: 4,
          track: "Rock Anthem",
          owner: "0x9876...1234",
          yourRole: "Mix Engineer",
          royaltySplit: "10%",
          earnings: "$650",
          status: "Active",
          lastPayout: "2024-01-25",
          nextPayout: "2024-02-25"
        },
        {
          id: 5,
          track: "Electric Dreams",
          owner: "0x2468...1357",
          yourRole: "Co-Producer",
          royaltySplit: "20%",
          earnings: "$1,750",
          status: "Active",
          lastPayout: "2024-01-18",
          nextPayout: "2024-02-18"
        }
      ];
      
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Collaborators</h1>
        <p className="text-gray-600 mb-6">Manage your music collaborations and royalty splits</p>
  
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Active Collaborations</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Collaborator
              </button>
            </div>
          </div>
  
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Split
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collaborations.map((collab) => (
                <tr key={collab.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.track}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.yourRole}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.royaltySplit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.earnings}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {collab.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800">
                      View Details
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
  
