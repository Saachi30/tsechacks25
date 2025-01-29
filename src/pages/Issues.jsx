import React from 'react'

export const Issues = () => {
    const [activeTab, setActiveTab] = React.useState('reported');
    
    const issues = [
        {
          id: 1,
          track: "Summer Beats",
          reportedBy: "0x9876...5432",
          type: "Copyright Violation",
          evidence: "Original Registration Certificate",
          status: "Under Review",
          dateReported: "2024-01-15",
          priority: "High",
          lastUpdate: "2024-01-16"
        },
        {
          id: 2,
          track: "Midnight Dreams",
          reportedBy: "0x1234...8765",
          type: "Unauthorized Sample",
          evidence: "Original Track Comparison",
          status: "In Progress",
          dateReported: "2024-01-18",
          priority: "Medium",
          lastUpdate: "2024-01-20"
        },
        {
          id: 3,
          track: "Urban Flow",
          reportedBy: "0x5678...4321",
          type: "Royalty Dispute",
          evidence: "Contract Documents",
          status: "Pending Resolution",
          dateReported: "2024-01-20",
          priority: "High",
          lastUpdate: "2024-01-22"
        },
        {
          id: 4,
          track: "Rock Anthem",
          reportedBy: "0x3456...7890",
          type: "License Violation",
          evidence: "Usage Documentation",
          status: "Under Review",
          dateReported: "2024-01-22",
          priority: "Low",
          lastUpdate: "2024-01-23"
        },
        {
          id: 5,
          track: "Electric Dreams",
          reportedBy: "0x7890...1234",
          type: "Content Claim",
          evidence: "Ownership Proof",
          status: "New",
          dateReported: "2024-01-25",
          priority: "Medium",
          lastUpdate: "2024-01-25"
        }
      ];
    
  
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Issues</h1>
            <p className="text-gray-600">Track and manage reported issues</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Report Issue
          </button>
        </div>
  
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex space-x-4 px-6">
              <button
                className={`py-3 px-4 border-b-2 ${
                  activeTab === 'reported'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('reported')}
              >
                Reported Issues
              </button>
              <button
                className={`py-3 px-4 border-b-2 ${
                  activeTab === 'resolved'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('resolved')}
              >
                Resolved
              </button>
            </div>
          </div>
  
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{issue.track}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{issue.reportedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{issue.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{issue.evidence}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        issue.status === 'Under Review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{issue.dateReported}</td>
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
      </div>
    );
  };
