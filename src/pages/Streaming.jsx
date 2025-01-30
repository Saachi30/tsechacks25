import React, { useEffect, useState, useRef } from 'react';
import { collection, query, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../components/firebase';
import { Play, Pause, Plus, Music2, SkipForward, SkipBack, Search, X } from 'lucide-react';
import stream from '../assets/stream.png'
import wave from '../assets/wave.mov'

const WaveformBackground = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 20">
    <path d="M0 10 Q25 0, 50 10 T100 10" stroke="currentColor" fill="none" strokeWidth="0.5" />
    <path d="M0 10 Q25 20, 50 10 T100 10" stroke="currentColor" fill="none" strokeWidth="0.5" />
  </svg>
);

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute -right-2 -top-2 p-2 hover:bg-slate-700 rounded-full"
          >
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export const Streaming = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [totalPlays, setTotalPlays] = useState(0);
  const [playbackStats, setPlaybackStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const audioRef = useRef(null);


  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const fetchData = async () => {
      const songsQuery = query(collection(db, 'songs'));
      const playlistsQuery = query(collection(db, 'playlists'));
      
      const [songsSnap, playlistsSnap] = await Promise.all([
        getDocs(songsQuery),
        getDocs(playlistsQuery)
      ]);

      const songsData = songsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          plays: data.plays || 0,
          firstPlayed: data.firstPlayed || data.uploadedAt,
          lastPlayed: data.lastPlayed || null,
          likes: data.likes || 0,
          shares: data.shares || 0,
          comments: data.comments || 0,
          duration: data.duration || 0,
          engagementTime: data.engagementTime || 0
        };
      });

      setSongs(songsData);
      setPlaylists(playlistsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTotalPlays(songsData.reduce((sum, song) => sum + (song.plays || 0), 0));

      const stats = {};
      songsData.forEach(song => {
        stats[song.id] = {
          plays: song.plays || 0,
          firstPlayed: song.firstPlayed,
          lastPlayed: song.lastPlayed,
          playsPerDay: calculatePlaysPerDay(song),
          duration: song.duration
        };
      });
      setPlaybackStats(stats);

      const uniqueGenres = [...new Set(songsData.map(song => song.genre))];
      setGenres(uniqueGenres);
    };

    fetchData();
  }, []);

  const calculatePlaysPerDay = (song) => {
    if (!song.firstPlayed) return 0;
    const firstPlayed = new Date(song.firstPlayed);
    const today = new Date();
    const daysDiff = Math.max(1, Math.floor((today - firstPlayed) / (1000 * 60 * 60 * 24)));
    return (song.plays || 0) / daysDiff;
  };

  const handlePlayPause = async (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);

      const songRef = doc(db, 'songs', song.id);
      const now = new Date().toISOString();
      
      const updates = {
        plays: (song.plays || 0) + 1,
        lastPlayed: now,
        firstPlayed: song.firstPlayed || now
      };

      await updateDoc(songRef, updates);

      setSongs(prevSongs => 
        prevSongs.map(s => 
          s.id === song.id 
            ? { ...s, ...updates }
            : s
        )
      );

      setPlaybackStats(prev => ({
        ...prev,
        [song.id]: {
          ...prev[song.id],
          plays: (prev[song.id]?.plays || 0) + 1,
          lastPlayed: now
        }
      }));
    }
  };

  const handlePreviousSong = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
    handlePlayPause(songs[prevIndex]);
  };

  const handleNextSong = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlayPause(songs[nextIndex]);
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistName && selectedSongs.length > 0) {
      const newPlaylist = {
        name: newPlaylistName,
        songs: selectedSongs,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
      
      setPlaylists(prev => [...prev, { id: docRef.id, ...newPlaylist }]);
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

  const handleLike = async (songId) => {
    const songRef = doc(db, 'songs', songId);
    await updateDoc(songRef, {
      likes: arrayUnion(currentUser.uid) // Assuming you have currentUser context
    });
    
    setSongs(prev => 
      prev.map(song => 
        song.id === songId 
          ? { ...song, likes: [...(song.likes || []), currentUser.uid] }
          : song
      )
    );
  };

  const handleShare = async (songId) => {
    const songRef = doc(db, 'songs', songId);
    await updateDoc(songRef, {
      shares: (songs.find(s => s.id === songId)?.shares || 0) + 1
    });
    
    setSongs(prev => 
      prev.map(song => 
        song.id === songId 
          ? { ...song, shares: (song.shares || 0) + 1 }
          : song
      )
    );
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.songName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="p-6 px-11 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Songs</h3>
          <p className="text-2xl font-bold">{songs.length}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Plays</h3>
          <p className="text-2xl font-bold">{totalPlays}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Active Playlists</h3>
          <p className="text-2xl font-bold">{playlists.length}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Duration</h3>
          <p className="text-2xl font-bold">
            {Math.floor(songs.reduce((sum, song) => sum + (song.duration || 0), 0) / 60)}m
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Column: Playlists and Search */}
        <div className="space-y-8">
          {/* Playlists Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Playlists</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} /> Create Playlist
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className="group relative overflow-hidden bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
                >
                  <WaveformBackground />
                  <div className="relative flex justify-between items-start">
                    <div
                      onClick={() => setShowPlaylistModal(playlist)}
                      className="cursor-pointer flex-1"
                    >
                      <Music2 className="w-8 h-8 mb-2 text-blue-400" />
                      <h3 className="font-semibold">{playlist.name}</h3>
                      <p className="text-sm text-gray-400">
                        {playlist.songs?.length || 0} songs
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative aspect-square pr-5 rounded-2xl w-5/6 bg-blend-overlay pb-14 overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 ml-auto mr-5">
    
          <img
            src={stream}
            alt="Featured"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-4xl font-bold mb-2">Your Music</h1>
            <p className="text-lg text-gray-300">Discover and organize your favorite tracks</p>
          </div>
        </div>
      </div>
      {/* Songs List */}
      <div className="space-y-4 mb-24">
        <h2 className="text-2xl font-bold mb-4">All Songs</h2>
        <div className="space-y-2">
          {filteredSongs.map(song => (
            <div
              key={song.id}
              className="relative overflow-hidden group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
               {/* Video Background */}
            {currentSong?.id === song.id && isPlaying && (
              <video
                className="absolute inset-0 w-full h-full object-cover opacity-30 z-5"
                src={wave}
                autoPlay
                loop
                muted
              />
            )}
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{song.songName}</h3>
                  <p className="text-gray-400">{song.artist}</p>
                  <p className="text-sm text-gray-500">{song.genre}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm text-gray-400">
                      ❤ {song.likes?.length || 0}
                    </span>
                    <span className="text-sm text-gray-400">
                      🔄 {song.shares || 0}
                    </span>
                    <span className="text-sm text-gray-400">
                      👥 {song.plays || 0} plays
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(song.id)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    ❤
                  </button>
                  <button
                    onClick={() => handleShare(song.id)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    🔄
                  </button>
                  <button 
                    onClick={() => handlePlayPause(song)}
                    className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Playlist Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
        <input
          type="text"
          placeholder="Playlist Name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="w-full p-2 mb-4 bg-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
          {songs.map(song => (
            <label
              key={song.id}
              className="flex items-center p-3 rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSongs.includes(song.id)}
                onChange={() => toggleSongSelection(song.id)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{song.songName}</div>
                <div className="text-sm text-gray-400">{song.artist}</div>
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={handleCreatePlaylist}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          Create Playlist
        </button>
      </Modal>

      {/* Playlist Songs Modal */}
      <Modal
        isOpen={!!showPlaylistModal}
        onClose={() => setShowPlaylistModal(null)}
      >
        {showPlaylistModal && (
          <>
            <h2 className="text-xl font-bold mb-4">{showPlaylistModal.name}</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {showPlaylistModal.songs?.map(songId => {
                const song = songs.find(s => s.id === songId);
                return song ? (
                  <div
                    key={song.id}
                    onClick={() => {
                      handlePlayPause(song);
                      setShowPlaylistModal(null);
                    }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{song.songName}</div>
                      <div className="text-sm text-gray-400">{song.artist}</div>
                    </div>
                    <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-600">
                      {currentSong?.id === song.id && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </>
        )}
      </Modal>

      {/* Playbar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-white/10 p-4">
          <div className="max-w-screen-lg mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{currentSong.songName}</h3>
                <p className="text-sm text-gray-400">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePreviousSong}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={handleNextSong}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <SkipForward size={20} />
                </button>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={currentSong.url}
              onEnded={() => handleNextSong()}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Streaming;