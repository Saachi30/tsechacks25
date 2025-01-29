import React from 'react'

export const Crowdfunding = () => {
    const campaigns = [
      {
        id: 1,
        title: "New Album Production",
        artist: "John Doe",
        targetAmount: 10000,
        currentAmount: 6500,
        remainingDays: 15,
        supporters: 128,
        coverImage: "/api/placeholder/400/200",
        description: "Help fund my debut album featuring collaborations with top producers"
      },
      {
        id: 2,
        title: "World Tour Documentary",
        artist: "The Midnight Band",
        targetAmount: 25000,
        currentAmount: 18750,
        remainingDays: 30,
        supporters: 342,
        coverImage: "/api/placeholder/400/200",
        description: "Support our documentary filming during the upcoming world tour"
      },
      {
        id: 3,
        title: "Vintage Studio Equipment",
        artist: "Sarah Williams",
        targetAmount: 15000,
        currentAmount: 12000,
        remainingDays: 7,
        supporters: 89,
        coverImage: "/api/placeholder/400/200",
        description: "Help us acquire vintage analog equipment for our recording studio"
      },
      {
        id: 4,
        title: "Music Video Production",
        artist: "Electric Dreams",
        targetAmount: 8000,
        currentAmount: 2000,
        remainingDays: 45,
        supporters: 56,
        coverImage: "/api/placeholder/400/200",
        description: "Fund our ambitious music video featuring cutting-edge visual effects"
      }
    ];
  
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Crowdfunding</h1>
            <p className="text-gray-600">Support music projects or start your own campaign</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Start Campaign
          </button>
        </div>
  
        <div className="grid grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow overflow-hidden">
              <img 
                src={campaign.coverImage} 
                alt={campaign.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-4">by {campaign.artist}</p>
                <p className="text-gray-600 mb-4 text-sm">{campaign.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>${campaign.currentAmount.toLocaleString()} raised</span>
                    <span>${campaign.targetAmount.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2" 
                      style={{ width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
  
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}%
                    </p>
                    <p className="text-sm text-gray-500">Funded</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.remainingDays}</p>
                    <p className="text-sm text-gray-500">Days Left</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.supporters}</p>
                    <p className="text-sm text-gray-500">Supporters</p>
                  </div>
                </div>
  
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Support Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };