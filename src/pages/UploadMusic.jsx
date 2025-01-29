import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export const UploadMusic = () => {
  const [formData, setFormData] = useState({
    songName: '',
    artists: [''],  // Initialize with one empty artist field
    genre: '',
    collaborators: [],
    royaltySplits: []
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleArtistChange = (index, value) => {
    const newArtists = [...formData.artists];
    newArtists[index] = value;
    setFormData({ ...formData, artists: newArtists });
  };

  const addArtistField = () => {
    setFormData({ ...formData, artists: [...formData.artists, ''] });
  };

  const removeArtistField = (index) => {
    const newArtists = formData.artists.filter((_, i) => i !== index);
    setFormData({ ...formData, artists: newArtists });
  };

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
        songName: formData.songName,
        artists: formData.artists.filter(artist => artist.trim() !== ''),
        genre: formData.genre,
        collaborators: [],
        royaltySplits: []
      };

      const db = getFirestore();
      const songsCollection = collection(db, 'songs');
      await addDoc(songsCollection, songMetadata);

      setSuccess('File uploaded successfully!');
      console.log('File URL:', fileURL);

      setFile(null);
      setFormData({
        songName: '',
        artists: [''],
        genre: '',
        collaborators: [],
        royaltySplits: []
      });

    } catch (err) {
      setError(err.message || 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
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

          {/* Song Name Input */}
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

          {/* Artists Input Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Artists
            </label>
            {formData.artists.map((artist, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => handleArtistChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Artist name"
                  required
                />
                {formData.artists.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArtistField(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addArtistField}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Another Artist
            </button>
          </div>

          {/* Genre Input */}
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
            disabled={uploading || !file}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload to IPFS'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadMusic;