import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import music from '../assets/music.png'
import { useNavigate } from "react-router-dom";
import abi from '../abi.json'
const contractABI = abi;
const contractAddress = "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638";

export const MyMusic = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');

  const getCurrentWalletAddress = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setCurrentAddress(accounts[0].toLowerCase());
    } catch (error) {
      console.error("Error getting wallet address:", error);
    }
  };

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
        artist: details.artist.toLowerCase(), // Convert to lowercase for comparison
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
      const musicDetails = await Promise.all(
        Array(10).fill().map((_, i) => getMusicDetails(i + 1))
      );
      
      // Filter tracks where the artist matches the current wallet address
      const filteredTracks = musicDetails.filter(
        track => track !== null && track.artist === currentAddress
      );
      
      setTracks(filteredTracks);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    getCurrentWalletAddress();
  }, []);

  useEffect(() => {
    if (currentAddress) {
      fetchAllMusic();
    }
  }, [currentAddress]);

  const handleViewDetails = async (track) => {
    setSelectedTrack(track);
    setShowDetails(true);
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="p-6 space-y-6 bg-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-800">
            My Music
          </h1>
          <p className="text-gray-600">Manage your music rights and collaborations</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => navigate("/upload")}>
          Register New Track
        </button>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No tracks found for your wallet address</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md hover:scale-102 transition-transform duration-200">
              <div className="flex items-center space-x-6">
                <img
                  src={music}
                  alt={track.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{track.title}</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-100 rounded-lg p-2 transform hover:scale-105 transition-transform duration-200">
                      <p className="text-xs text-gray-500">Genre</p>
                      <p className="font-semibold text-gray-900 text-sm truncate">{track.genre}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 transform hover:scale-105 transition-transform duration-200">
                      <p className="text-xs text-gray-500">Artist</p>
                      <p className="font-mono font-semibold text-gray-900 text-sm truncate">{formatAddress(track.artist)}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 transform hover:scale-105 transition-transform duration-200">
                      <p className="text-xs text-gray-500">Collaborators</p>
                      <p className="font-semibold text-gray-900 text-sm">{track.collaboratorCount}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 transform hover:scale-105 transition-transform duration-200">
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-semibold text-gray-900 text-sm">{track.revenue} ETH</p>
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
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700" onClick={() => navigate("/rights")}>
                    Manage Rights
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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