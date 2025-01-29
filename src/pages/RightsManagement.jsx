import React from 'react'
export const RightsManagement = () => {
    const [activeTab, setActiveTab] = React.useState('owned');
    
    const rightsRequests = [
        {
          id: 1,
          track: "Summer Vibes",
          requestor: "Studio XYZ",
          type: "Full Rights Purchase",
          offer: "$5,000",
          status: "Pending",
          dateSubmitted: "2024-01-15",
          details: "Commercial use in advertising"
        },
        {
          id: 2,
          track: "Midnight Dreams",
          requestor: "Music Corp Inc",
          type: "License Request",
          offer: "$2,500",
          status: "Under Review",
          dateSubmitted: "2024-01-18",
          details: "Movie soundtrack usage"
        },
        {
          id: 3,
          track: "Urban Flow",
          requestor: "Gaming Studios",
          type: "Partial Rights",
          offer: "$3,750",
          status: "Pending",
          dateSubmitted: "2024-01-20",
          details: "Video game background music"
        },
        {
          id: 4,
          track: "Rock Anthem",
          requestor: "StreamFlix",
          type: "Streaming Rights",
          offer: "$4,200",
          status: "In Negotiation",
          dateSubmitted: "2024-01-22",
          details: "Series theme song"
        },
        {
          id: 5,
          track: "Electric Dreams",
          requestor: "Ad Agency Pro",
          type: "Commercial License",
          offer: "$6,500",
          status: "Pending",
          dateSubmitted: "2024-01-25",
          details: "National ad campaign"
        }
      ];
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Rights Management</h1>
        
        <div className="flex space-x-4 border-b">
          <button
            className={`pb-2 px-4 ${
              activeTab === 'owned' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('owned')}
          >
            Owned Rights
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === 'requests' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Rights Requests
          </button>
        </div>
  
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requestor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer
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
              {rightsRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{request.track}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.requestor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.offer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        Accept
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
