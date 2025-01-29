import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { auth, db } from '../components/firebase';
import { collection, query, where, getDocs, addDoc,updateDoc, doc } from 'firebase/firestore';
import { ethers } from 'ethers';

// ABI can be imported from a separate file in practice
const CONTRACT_ADDRESS = "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638";
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_genre",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      }
    ],
    "name": "registerMusic",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const UploadMusic = () => {
  const [formData, setFormData] = useState({
    songName: '',
    artists: {},
    genre: '',
    collaborators: [],
    royaltySplits: []
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistRole, setArtistRole] = useState('');
  const [roleOptions] = useState(['composer', 'musician', 'writer']);

  const handleArtistChange = (email, role) => {
    setFormData({ ...formData, artists: { ...formData.artists, [email]: role } });
  };

  const addArtistField = async () => {
    if (!artistEmail || !artistRole) {
      setError('Please enter both email and role');
      return;
    }

    try {
      const usersCollection = collection(db, 'Users');
      const q = query(usersCollection, where('email', '==', artistEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userId = querySnapshot.docs[0].id;
        handleArtistChange(userId, artistRole);
        setArtistEmail('');
        setArtistRole('');
        setError('');
      } else {
        setError('User does not exist');
      }
    } catch (err) {
      setError('Failed to add artist');
      console.error('Error adding artist:', err);
    }
  };

  const registerMusicOnChain = async (ipfsHash) => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to interact with the blockchain');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const tx = await contract.registerMusic(
        formData.songName,
        formData.genre,
        ipfsHash
      );

      await tx.wait();
      return true;
    } catch (err) {
      console.error('Blockchain error:', err);
      throw new Error('Failed to register music on blockchain: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.songName || !formData.genre) {
      setError('Please fill in all required fields');
      return;
    }

    if (Object.keys(formData.artists).length === 0) {
      setError('Please add at least one artist');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const fileData = new FormData();
      fileData.append("file", file);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        body: fileData,
        headers: {
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
        }
      });

      if (!response.ok) {
        throw new Error('IPFS upload failed');
      }

      const data = await response.json();
      const ipfsHash = data.IpfsHash;
      const fileURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      await registerMusicOnChain(ipfsHash);

      const songMetadata = {
        name: file.name,
        url: fileURL,
        ipfsHash: ipfsHash,
        uploadedAt: new Date().toLocaleString(),
        songName: formData.songName,
        artists: formData.artists,
        genre: formData.genre,
        collaborators: [],
        royaltySplits: []
      };

      const songsCollection = collection(db, 'songs');
      const songDoc = await addDoc(songsCollection, songMetadata);
      await updateArtistPlaylists(songDoc.id, Object.keys(formData.artists));

      setSuccess('File uploaded and registered on blockchain successfully!');
      setFile(null);
      setFormData({
        songName: '',
        artists: {},
        genre: '',
        collaborators: [],
        royaltySplits: []
      });
    } catch (err) {
      setError(err.message || 'Failed to upload and register file');
    } finally {
      setUploading(false);
    }
  };

  const updateArtistPlaylists = async (songId, artistIds) => {
    try {
      const updatePromises = artistIds.map(async (artistId) => {
        const userRef = doc(db, 'Users', artistId);
        const userDoc = await getDocs(query(collection(db, 'Users'), where('__name__', '==', artistId)));
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          const currentPlaylist = userData.playlist || [];
          
          if (!currentPlaylist.includes(songId)) {
            await updateDoc(userRef, {
              playlist: [...currentPlaylist, songId]
            });
          }
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating artist playlists:', error);
      throw new Error('Failed to update artist playlists');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Upload Music</h1>
      <p className="text-gray-600 mb-6">Upload and tokenize your music rights</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 text-green-700 bg-green-100 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Song Name
            </label>
            <input
              type="text"
              value={formData.songName}
              onChange={(e) => setFormData({ ...formData, songName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Artists
            </label>
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                value={artistEmail}
                onChange={(e) => setArtistEmail(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Artist email"
              />
              <select
                value={artistRole}
                onChange={(e) => setArtistRole(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addArtistField}
                className="px-3 py-2 text-blue-600 hover:text-blue-800"
              >
                Add
              </button>
            </div>
            {Object.keys(formData.artists).map((email, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <span>{email}</span>
                <span>{formData.artists[email]}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newArtists = { ...formData.artists };
                    delete newArtists[email];
                    setFormData({ ...formData, artists: newArtists });
                  }}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Genre
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">MP3, WAV, FLAC (MAX. 100MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".mp3"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          {file && (
            <p className="text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload to IPFS & Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadMusic;