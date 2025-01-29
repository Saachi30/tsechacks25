import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json'
const contractABI = abi;
const contractAddress =  "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638";

export const MyMusic = () => {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getMusicDetails = async (musicId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const details = await contract.getMusicDetails(musicId);
      const [collaborators, splits] = await contract.getCollaborators(musicId);
      
      return {
        id: details.id.toNumber(),
        title: details.title,
        genre: details.genre,
        artist: details.artist,
        ipfsHash: details.ipfsHash,
        collaborators: collaborators,
        royaltySplits: splits.map(split => split.toNumber() / 100),
        revenue: ethers.utils.formatEther(details.revenue),
        collaboratorCount: collaborators.length
      };
    } catch (error) {
      console.error("Error fetching music details:", error);
      return null;
    }
  };

  const fetchAllMusic = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // We'll fetch the first 10 tracks for demonstration
      // In a production app, you'd want to implement proper pagination
      const musicDetails = await Promise.all(
        Array(10).fill().map((_, i) => getMusicDetails(i + 1))
      );
      
      setTracks(musicDetails.filter(track => track !== null));
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    fetchAllMusic();
  }, []);

  const handleViewDetails = async (track) => {
    setSelectedTrack(track);
    setShowDetails(true);
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Music</h1>
          <p className="text-gray-600">Manage your music rights and collaborations</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Register New Track
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex items-center space-x-6">
              <img
                src="/api/placeholder/200/200"
                alt={track.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-gray-900">{track.title}</h3>
                <div className="grid grid-cols-4 gap-6 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Genre</p>
                    <p className="font-medium text-gray-900">{track.genre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Artist</p>
                    <p className="font-medium text-gray-900">{formatAddress(track.artist)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Collaborators</p>
                    <p className="font-medium text-gray-900">{track.collaboratorCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-medium text-gray-900">{track.revenue} ETH</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  onClick={() => handleViewDetails(track)}
                >
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                  Manage Rights
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDetails && selectedTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedTrack.title} - Details</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Collaborators & Royalty Splits</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedTrack.collaborators.map((collaborator, index) => (
                    <div key={collaborator} className="flex justify-between items-center py-2">
                      <span className="font-mono text-sm">{formatAddress(collaborator)}</span>
                      <span className="font-semibold">{selectedTrack.royaltySplits[index]}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">IPFS Hash</h3>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedTrack.ipfsHash}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMusic;