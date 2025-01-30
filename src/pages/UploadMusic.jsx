import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { auth, db } from '../components/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ethers } from 'ethers';

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
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistRole, setArtistRole] = useState('');
  const [roleOptions] = useState(['composer', 'musician', 'writer']);
  const [showPlagiarismAlert, setShowPlagiarismAlert] = useState(false);
  const [plagiarismDetails, setPlagiarismDetails] = useState(null);

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

  const checkPlagiarism = async (newFile) => {
    setChecking(true);
    setError('');
    
    try {
      const songsCollection = collection(db, 'songs');
      const songsSnapshot = await getDocs(songsCollection);
      
      for (const songDoc of songsSnapshot.docs) {
        const song = songDoc.data();
        
        const formData = new FormData();
        formData.append('file1', newFile);
        
        // Fetch the existing song file from IPFS
        const existingFileResponse = await fetch(song.url);
        const existingFileBlob = await existingFileResponse.blob();
        formData.append('file2', existingFileBlob);
        
        const response = await fetch('http://localhost:5000/detect_plagiarism', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Plagiarism check failed');
        }
        
        const result = await response.json();
        
        if (result.is_plagiarized) {
          // Get owner details
          const artistIds = Object.keys(song.artists);
          const artistDetails = await Promise.all(
            artistIds.map(async (id) => {
              const userDoc = await getDocs(query(collection(db, 'Users'), where('__name__', '==', id)));
              if (!userDoc.empty) {
                return userDoc.docs[0].data();
              }
              return null;
            })
          );
          
          setPlagiarismDetails({
            similarity: result.similarity_percentage,
            originalSong: song.songName,
            owners: artistDetails.filter(Boolean),
            originalUrl: song.url
          });
          setShowPlagiarismAlert(true);
          setChecking(false);
          return false;
        }
      }
      
      setChecking(false);
      return true;
    } catch (err) {
      setError('Failed to check plagiarism: ' + err.message);
      setChecking(false);
      return false;
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

    setError('');
    setSuccess('');

    try {
      // First check for plagiarism
      const isPlagiarismFree = await checkPlagiarism(file);
      
      if (!isPlagiarismFree) {
        return;
      }

      // If no plagiarism detected, proceed with upload
      setUploading(true);
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
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
    {/* Decorative SVG Elements */}
    <div className="absolute top-0 left-0 w-64 h-64 opacity-10">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" className="fill-blue-500" />
        <path d="M50 10 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="stroke-blue-600" strokeWidth="2" />
      </svg>
    </div>
    
    <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10 transform rotate-180">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" className="fill-blue-400" />
        <path d="M20 50 Q50 20 80 50" fill="none" stroke="currentColor" className="stroke-blue-500" strokeWidth="3" />
      </svg>
    </div>

    {/* Main Content Container */}
    <div className="max-w-4xl mx-auto pt-12 pb-20 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Upload Your Music</h1>
          <p className="text-gray-600 text-lg">Tokenize and protect your musical creations</p>
        </div>

      {showPlagiarismAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-red-500">
  <div className="flex items-center gap-2 mb-4">
    <h3 className="text-xl font-bold">Plagiarism Detected</h3>
    <svg 
      className="w-6 h-6 text-red-500" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  </div>
  <div className="space-y-4">
    <p>Your song appears to be similar to an existing song:</p>
    <div className="p-4 bg-gray-100 rounded-lg">
      <p><strong>Similarity:</strong> {plagiarismDetails?.similarity.toFixed(2)}%</p>
      <p><strong>Original Song:</strong> {plagiarismDetails?.originalSong}</p>
      <p><strong>Original Owners:</strong></p>
      <ul className="list-disc pl-5">
        {plagiarismDetails?.owners.map((owner, index) => (
          <li key={index}>{owner.email} - {owner.name}</li>
        ))}
      </ul>
    </div>
    <p>You can either upload a different song or request permission from the original owners.</p>
    <div className="flex gap-4 justify-end mt-6">
      <button
        onClick={() => {
          setFile(null);
          setShowPlagiarismAlert(false);
        }}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        Upload Another Song
      </button>
      <button
        onClick={() => {
          // Implement permission request logic here
          setShowPlagiarismAlert(false);
        }}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Request Permission
      </button>
    </div>
  </div>
</div>
        </div>
      )}
 <div className="bg-white rounded-2xl shadow-xl p-8 pt-6 relative">
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

          <div >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              
              Song Name
            </label>
            <input
              type="text"
              value={formData.songName}
              onChange={(e) => setFormData({ ...formData, songName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                 className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Artist email"
              />
              <select
                value={artistRole}
                onChange={(e) => setArtistRole(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Role</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addArtistField}
                 className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
             className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            disabled={uploading || checking}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking Plagiarism...' : uploading ? 'Uploading...' : 'Upload to IPFS & Register'}
          </button>
        </div>
      </form>
      </div>
      {showPlagiarismAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-red-500">
  <div className="flex items-center gap-2 mb-4">
    <h3 className="text-xl font-bold">Plagiarism Detected</h3>
    <svg 
      className="w-6 h-6 text-red-500" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  </div>
  <div className="space-y-4">
    <p>Your song appears to be similar to an existing song:</p>
    <div className="p-4 bg-gray-100 rounded-lg">
      <p><strong>Similarity:</strong> {plagiarismDetails?.similarity.toFixed(2)}%</p>
      <p><strong>Original Song:</strong> {plagiarismDetails?.originalSong}</p>
      <p><strong>Original Owners:</strong></p>
      <ul className="list-disc pl-5">
        {plagiarismDetails?.owners.map((owner, index) => (
          <li key={index}>{owner.email} - {owner.name}</li>
        ))}
      </ul>
    </div>
    <p>You can either upload a different song or request permission from the original owners.</p>
    <div className="flex gap-4 justify-end mt-6">
      <button
        onClick={() => {
          setFile(null);
          setShowPlagiarismAlert(false);
        }}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        Upload Another Song
      </button>
      <button
        onClick={() => {
          // Implement permission request logic here
          setShowPlagiarismAlert(false);
        }}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Request Permission
      </button>
    </div>
  </div>
</div>
</div>
      )}
    </div>
    </div>
  );
};

export default UploadMusic;