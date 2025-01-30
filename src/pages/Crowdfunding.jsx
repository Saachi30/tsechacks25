import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
const CONTRACT_ABI = abi;
const SMT_TOKEN_ADDRESS = "0xA06E0542a9bd269fd5886436993019fE35bf3d2F";
const CONTRACT_ADDRESS = "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638";

// Import ABI from your contract compilation
const contractABI = abi;
const tokenABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export const Crowdfunding = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [musicId, setMusicId] = useState('');
  const [newCampaign, setNewCampaign] = useState({
    musicId: '',
    targetAmount: ''
  });

  // Connect to wallet and contract
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
          const tokenContract = new ethers.Contract(SMT_TOKEN_ADDRESS, tokenABI, signer);

          setProvider(provider);
          setContract(contract);
          setTokenContract(tokenContract);

          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);

          // Initially load campaign for music ID 1
          await loadCampaignDetails(1);
        } catch (error) {
          console.error("Error initializing:", error);
        }
      }
    };

    init();
  }, []);

  const loadCampaignDetails = async (id) => {
    try {
      setLoading(true);
      const musicDetails = await contract.getMusicDetails(id);
      const crowdfundingDetails = await contract.crowdfundingRegistry(id);
      
      if (crowdfundingDetails && crowdfundingDetails.targetAmount.gt(0)) {
        const campaign = {
          id: id.toString(),
          title: musicDetails.title,
          artist: musicDetails.artist,
          targetAmount: ethers.utils.formatEther(crowdfundingDetails.targetAmount),
          currentAmount: ethers.utils.formatEther(crowdfundingDetails.currentAmount),
          isFunded: crowdfundingDetails.isFunded,
          genre: musicDetails.genre,
          contributeAmount: ''
        };
        
        setCampaigns(prev => {
          const existing = prev.find(c => c.id === campaign.id);
          if (existing) {
            return prev.map(c => c.id === campaign.id ? campaign : c);
          }
          return [...prev, campaign];
        });
      }
    } catch (error) {
      console.error(`Error loading campaign ${id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const searchCampaign = async (e) => {
    e.preventDefault();
    if (musicId) {
      await loadCampaignDetails(musicId);
    }
  };

  const startCampaign = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const tx = await contract.startCrowdfunding(
        newCampaign.musicId,
        ethers.utils.parseEther(newCampaign.targetAmount)
      );
      await tx.wait();
      await loadCampaignDetails(newCampaign.musicId);
      setNewCampaign({ musicId: '', targetAmount: '' });
      document.getElementById('newCampaignModal').classList.add('hidden');
    } catch (error) {
      console.error("Error starting campaign:", error);
      alert("Error starting campaign. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const contribute = async (campaignId, amount) => {
    if (!amount) {
      alert("Please enter an amount to contribute");
      return;
    }
    setLoading(true);
    try {
      // First approve token spending
      const amountWei = ethers.utils.parseEther(amount);
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountWei);
      await approveTx.wait();

      // Then contribute
      const tx = await contract.contributeToCrowdfunding(campaignId, amountWei);
      await tx.wait();
      await loadCampaignDetails(campaignId);
    } catch (error) {
      console.error("Error contributing:", error);
      alert("Error contributing. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async (campaignId) => {
    setLoading(true);
    try {
      const tx = await contract.withdrawCrowdfunding(campaignId);
      await tx.wait();
      await loadCampaignDetails(campaignId);
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Error withdrawing funds. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Music Crowdfunding</h1>
            <p className="text-gray-600">Connected: {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Not connected'}</p>
          </div>
          <button 
            onClick={() => document.getElementById('newCampaignModal').classList.remove('hidden')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Campaign
          </button>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={searchCampaign} className="flex gap-4">
            <input
              type="number"
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
              placeholder="Enter Music ID to search"
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-lg">Processing transaction...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-1">by {campaign.artist}</p>
                <p className="text-gray-600 mb-4">Genre: {campaign.genre}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{campaign.currentAmount} SMT raised</span>
                    <span>{campaign.targetAmount} SMT goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 rounded-full h-3 transition-all"
                      style={{ 
                        width: `${(Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {!campaign.isFunded ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Amount to contribute"
                      value={campaign.contributeAmount}
                      onChange={(e) => {
                        const newCampaigns = campaigns.map(c => 
                          c.id === campaign.id 
                            ? {...c, contributeAmount: e.target.value}
                            : c
                        );
                        setCampaigns(newCampaigns);
                      }}
                      className="w-full p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => contribute(campaign.id, campaign.contributeAmount)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Contribute
                    </button>
                  </div>
                ) : (
                  campaign.artist.toLowerCase() === account.toLowerCase() && (
                    <button
                      onClick={() => withdrawFunds(campaign.id)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Withdraw Funds
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* New Campaign Modal */}
        <div id="newCampaignModal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Start New Campaign</h2>
            <form onSubmit={startCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Music ID</label>
                <input
                  type="number"
                  value={newCampaign.musicId}
                  onChange={(e) => setNewCampaign({...newCampaign, musicId: e.target.value})}
                  className="mt-1 w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Amount (SMT)</label>
                <input
                  type="number"
                  value={newCampaign.targetAmount}
                  onChange={(e) => setNewCampaign({...newCampaign, targetAmount: e.target.value})}
                  className="mt-1 w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('newCampaignModal').classList.add('hidden')}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crowdfunding;