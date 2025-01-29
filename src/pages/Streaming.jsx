//doc2
import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../components/firebase';
import { Play, Pause, Plus, ListMusic, SkipForward, X } from 'lucide-react';

const Streaming = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [totalPlays, setTotalPlays] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const songsQuery = query(collection(db, 'songs'));
      const playlistsQuery = query(collection(db, 'playlists'));
      
      const [songsSnap, playlistsSnap] = await Promise.all([
        getDocs(songsQuery),
        getDocs(playlistsQuery)
      ]);

      setSongs(songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPlaylists(playlistsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTotalPlays(songsSnap.docs.reduce((sum, doc) => sum + (doc.data().plays || 0), 0));
    };

    fetchData();
  }, []);

  const handlePlayPause = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    setCurrentSong(songs[randomIndex]);
    setIsPlaying(true);
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistName && selectedSongs.length > 0) {
      const newPlaylist = {
        name: newPlaylistName,
        songs: selectedSongs,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'playlists'), newPlaylist);
      setShowCreateModal(false);
      setNewPlaylistName('');
      setSelectedSongs([]);
    }
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId) 
        : [...prev, songId]
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Songs</h3>
          <p className="text-2xl font-bold">{songs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Plays</h3>
          <p className="text-2xl font-bold">{totalPlays}</p>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Playlists</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Create Playlist
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => setShowPlaylistModal(playlist)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
            >
              <h3 className="font-semibold">{playlist.name}</h3>
              <p className="text-sm text-gray-500">
                {playlist.songs?.length || 0} songs
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Songs List */}
      <div className="mb-16">
        <h2 className="text-xl font-bold mb-4">All Songs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map(song => (
            <div 
              key={song.id} 
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{song.name}</h3>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                  <p className="text-xs text-gray-400">{song.genre}</p>
                </div>
                <button 
                  onClick={() => handlePlayPause(song)}
                  className="p-2 bg-blue-500 text-white rounded-full"
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </button>
              </div>
              <audio
                controls
                className="w-full mt-2"
                src={song.url}
                autoPlay={currentSong?.id === song.id && isPlaying}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Player */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-blue-500 text-white rounded-full"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div>
                <h3 className="font-semibold">{currentSong.name}</h3>
                <p className="text-sm text-gray-500">{currentSong.artist}</p>
              </div>
            </div>
            <button
              onClick={handleNextSong}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Playlist</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />

            <div className="max-h-96 overflow-y-auto">
              {songs.map(song => (
                <label 
                  key={song.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSongs.includes(song.id)}
                    onChange={() => toggleSongSelection(song.id)}
                    className="mr-2"
                  />
                  <span>{song.name}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleCreatePlaylist}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Create Playlist
            </button>
          </div>
        </div>
      )}

      {/* Playlist Songs Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{showPlaylistModal.name}</h2>
              <button 
                onClick={() => setShowPlaylistModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {showPlaylistModal.songs?.map(songId => {
                const song = songs.find(s => s.id === songId);
                return song ? (
                  <div key={song.id} className="p-2 hover:bg-gray-50 rounded">
                    <h3 className="font-medium">{song.name}</h3>
                    <p className="text-sm text-gray-500">{song.artist}</p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Streaming };