import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json'
import ReclaimVerification from './ReclaimVerification';

const CONTRACT_ADDRESS = "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638";
const CONTRACT_ABI = abi;

export const Collaborators = () => {
  const [activeTab, setActiveTab] = useState('collaborators');
  const [collaborations, setCollaborations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [musics, setMusics] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedMusicDetails, setSelectedMusicDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [smtBalance, setSmtBalance] = useState('0');
  const [distributionAmount, setDistributionAmount] = useState('');
  const [formData, setFormData] = useState({
    collaborators: [''],
    royaltySplits: ['']
  });

  const getContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return null;
  };

  const fetchSmtBalance = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const balance = await contract.stableMusicToken().balanceOf(accounts[0]);
      setSmtBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching SMT balance:", error);
    }
  };

  const handleDistributeRoyalties = async (musicId) => {
    if (!distributionAmount || isNaN(distributionAmount) || distributionAmount <= 0) {
      alert("Please enter a valid distribution amount");
      return;
    }

    try {
      const contract = await getContract();
      if (!contract) return;

      setLoading(true);

      // Convert the distribution amount to wei
      const amountInWei = ethers.utils.parseEther(distributionAmount.toString());
      
      // First approve the contract to spend tokens
      const smt = new ethers.Contract(
        await contract.stableMusicToken(),
        [
          "function approve(address spender, uint256 amount) public returns (bool)"
        ],
        (await getContract()).signer
      );

      const approveTx = await smt.approve(CONTRACT_ADDRESS, amountInWei);
      await approveTx.wait();

      // Now distribute the royalties
      const tx = await contract.distributeRoyalties(musicId, amountInWei);
      await tx.wait();
      
      await fetchMusicDetails();
      await fetchSmtBalance();
      setDistributionAmount('');
      
      alert("Royalties distributed successfully!");
    } catch (error) {
      console.error("Error distributing royalties:", error);
      alert(`Error distributing royalties: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMusicDetails = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;

      setLoading(true);
      const musicDetails = [];
      let musicId = 1;
      
      while (true) {
        try {
          const music = await contract.getMusicDetails(musicId);
          if (music && music.title !== '') {
            musicDetails.push({
              id: music.id.toString(),
              title: music.title,
              artist: music.artist,
              genre: music.genre,
              collaborators: music.collaborators,
              royaltySplits: music.royaltySplits.map(split => split.toString()),
              revenue: ethers.utils.formatEther(music.revenue)
            });
          }
          musicId++;
        } catch (error) {
          break;
        }
      }
      
      setMusics(musicDetails);
      await fetchCollaborations(musicDetails);
    } catch (error) {
      console.error("Error fetching music details:", error);
    } finally {
      setLoading(false);
    }
  };

 

  // Rest of the component remains the same
  const fetchSelectedMusicDetails = async (musicId) => {
    try {
      const contract = await getContract();
      if (!contract) return;

      const music = await contract.getMusicDetails(musicId);
      setSelectedMusicDetails({
        id: music.id.toString(),
        title: music.title,
        artist: music.artist,
        genre: music.genre,
        collaborators: music.collaborators,
        royaltySplits: music.royaltySplits.map(split => split.toString()),
        revenue: ethers.utils.formatEther(music.revenue)
      });
    } catch (error) {
      console.error("Error fetching selected music details:", error);
    }
  };

  // Handle music selection
  const handleMusicSelection = async (musicId) => {
    setSelectedMusic(musicId);
    if (musicId) {
      await fetchSelectedMusicDetails(musicId);
    } else {
      setSelectedMusicDetails(null);
    }
  };

  // Fetch collaborations for each music
  const fetchCollaborations = async (musicDetails) => {
    try {
      const contract = await getContract();
      if (!contract) return;

      const collaborationsData = [];
      for (const music of musicDetails) {
        const [collaborators, splits] = await contract.getCollaborators(music.id);
        if (collaborators.length > 0) {
          collaborationsData.push({
            id: music.id,
            track: music.title,
            owner: music.artist,
            genre: music.genre,
            collaborators,
            royaltySplits: splits.map(split => (split.toNumber() / 100).toString() + '%'),
            earnings: music.revenue,
            status: "Active"
          });
        }
      }
      setCollaborations(collaborationsData);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
    }
  };

  // Add collaborators function
  const handleAddCollaborators = async () => {
    try {
      if (!selectedMusic || !selectedMusicDetails) {
        console.error("No music selected");
        return;
      }

      const contract = await getContract();
      if (!contract) return;

      // Validate total royalty splits
      const totalSplits = formData.royaltySplits.reduce((acc, split) => acc + (parseFloat(split) || 0), 0);
      if (totalSplits !== 100) {
        alert("Total royalty splits must equal 100%");
        return;
      }

      const collaboratorAddresses = formData.collaborators.filter(addr => addr !== '');
      const royaltySplits = formData.royaltySplits.map(split => 
        Math.floor(parseFloat(split) * 100)
      );

      setLoading(true);
      const tx = await contract.addCollaborators(
        selectedMusic,
        collaboratorAddresses,
        royaltySplits
      );
      await tx.wait();
      
      await fetchMusicDetails();
      setShowModal(false);
      setSelectedMusicDetails(null);
      setSelectedMusic(null);
    } catch (error) {
      console.error("Error adding collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add/remove collaborator fields
  const addCollaboratorField = () => {
    setFormData(prev => ({
      collaborators: [...prev.collaborators, ''],
      royaltySplits: [...prev.royaltySplits, '']
    }));
  };

  const removeCollaboratorField = (index) => {
    setFormData(prev => ({
      collaborators: prev.collaborators.filter((_, i) => i !== index),
      royaltySplits: prev.royaltySplits.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    fetchMusicDetails();
  }, []);

  // Rest of the JSX remains the same as in your original code
  return (
    <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Music Rights Management</h1>
      <div className="bg-blue-50 p-3 rounded-lg">
        <span className="text-blue-800 font-semibold">SMT Balance: </span>
        <span className="text-blue-600">{smtBalance} SMT</span>
      </div>
    </div>

    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'collaborators'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab('royalties')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'royalties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Distribute Royalties
          </button>
        </nav>
      </div>
    </div>

    {activeTab === 'collaborators' ? (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Active Collaborations</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Collaborator
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
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
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collaborators
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collaborations.map((collab) => (
                <tr key={collab.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.track}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.genre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {collab.collaborators.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {collab.royaltySplits.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{collab.earnings} ETH</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {collab.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      
</div>
) : (
  <div className="bg-white rounded-lg shadow">
  <div className="p-4 border-b bg-gray-50">
    <h2 className="font-semibold">Distribute Royalties</h2>
  </div>
  <div className="p-6">
    <div className="grid gap-6">
      {musics.map((music) => (
        <div key={music.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium text-lg">{music.title}</h3>
              <p className="text-gray-600">Genre: {music.genre}</p>
              <p className="text-gray-600">Artist: {music.artist}</p>
            </div>
            <div>
              <p className="text-gray-600">Current Revenue: {music.revenue} ETH</p>
              <p className="text-gray-600">
                Collaborators: {music.collaborators.length}
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <ReclaimVerification />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Amount (SMT)
              </label>
              <input
                type="number"
                step="0.000000000000000001"
                min="0"
                value={distributionAmount}
                onChange={(e) => setDistributionAmount(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
              />
            </div>
            <button
              onClick={() => handleDistributeRoyalties(music.id)}
              disabled={loading || !distributionAmount || distributionAmount <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Distributing...' : 'Distribute'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
)}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Add Collaborators</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Select Music</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                onChange={(e) => handleMusicSelection(e.target.value)}
              >
                <option value="">Select a music track</option>
                {musics.map((music) => (
                  <option key={music.id} value={music.id}>
                    {music.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedMusicDetails && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Music Details:</h4>
                <p>Title: {selectedMusicDetails.title}</p>
                <p>Genre: {selectedMusicDetails.genre}</p>
                <p>Artist: {selectedMusicDetails.artist}</p>
                <p>Current Revenue: {selectedMusicDetails.revenue} ETH</p>
              </div>
            )}

            {formData.collaborators.map((_, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Collaborator Address"
                    className="w-full p-2 border rounded"
                    value={formData.collaborators[index]}
                    onChange={(e) => {
                      const newCollaborators = [...formData.collaborators];
                      newCollaborators[index] = e.target.value;
                      setFormData(prev => ({...prev, collaborators: newCollaborators}));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Royalty Split %"
                    className="w-full p-2 border rounded"
                    value={formData.royaltySplits[index]}
                    onChange={(e) => {
                      const newSplits = [...formData.royaltySplits];
                      newSplits[index] = e.target.value;
                      setFormData(prev => ({...prev, royaltySplits: newSplits}));
                    }}
                  />
                </div>
                {index > 0 && (
                  <button
                    onClick={() => removeCollaboratorField(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <div className="flex justify-between mt-4">
              <button
                onClick={addCollaboratorField}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Another Collaborator
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMusicDetails(null);
                  setSelectedMusic(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollaborators}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading || !selectedMusic}
              >
                {loading ? 'Adding...' : 'Add Collaborators'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collaborators;