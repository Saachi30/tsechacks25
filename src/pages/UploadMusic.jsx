import React, { useState, useEffect } from 'react';
import { Upload, Play, Pause } from 'lucide-react';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

export const UploadMusic = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    collaborators: [],
    royaltySplits: []
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedSongs, setUploadedSongs] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const fileURL = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;

      // Store metadata in Firestore
      const songMetadata = {
        name: file.name,
        url: fileURL,
        ipfsHash: data.IpfsHash,
        uploadedAt: new Date().toLocaleString(),
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        collaborators: formData.collaborators,
        royaltySplits: formData.royaltySplits
      };

      const db = getFirestore();
      const songsCollection = collection(db, 'songs');
      await addDoc(songsCollection, songMetadata);

      setSuccess('File uploaded successfully!');
      console.log('File URL:', fileURL);

      // Fetch and update the list of uploaded songs
      await fetchSongs();

      setFile(null);

    } catch (err) {
      setError(err.message || 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Fetch songs from Firestore
  const fetchSongs = async () => {
    const db = getFirestore();
    const songsCollection = collection(db, 'songs');
    const querySnapshot = await getDocs(songsCollection);
    const songs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUploadedSongs(songs);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

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
            disabled={uploading || !file}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload to IPFS'}
          </button>
        </div>
      </form>

      {uploadedSongs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Songs</h2>
          <div className="space-y-4">
            {uploadedSongs.map((song, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{song.name}</h3>
                  <span className="text-sm text-gray-500">{song.uploadedAt}</span>
                </div>
                <audio
                  controls
                  className="w-full mt-2"
                  src={song.url}
                >
                  Your browser does not support the audio element.
                </audio>
                <p className="text-sm text-gray-500 mt-2">
                  IPFS Hash: {song.ipfsHash}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};