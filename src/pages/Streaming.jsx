import React, { useEffect, useState, useRef } from 'react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { Play, Pause, SkipBack, SkipForward, Search, X, Plus, Music2 } from 'lucide-react';
import stream from '../assets/stream.png'
import wave from '../assets/wave.mov'

const WaveformBackground = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 20">
    <path d="M0 10 Q25 0, 50 10 T100 10" stroke="currentColor" fill="none" strokeWidth="0.5" />
    <path d="M0 10 Q25 20, 50 10 T100 10" stroke="currentColor" fill="none" strokeWidth="0.5" />
  </svg>
);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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
const Streaming = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(null);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [currentPlaylistPlaying, setCurrentPlaylistPlaying] = useState(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const audioRef = useRef(new Audio());


  useEffect(() => {
    const fetchData = async () => {
      const [songsSnap, playlistsSnap] = await Promise.all([
        getDocs(query(collection(db, 'songs'))),
        getDocs(query(collection(db, 'playlists')))
      ]);
      
      const songsData = songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(songsData);
      
      const playlistsData = playlistsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaylists(playlistsData);
      
      const uniqueGenres = [...new Set(songsData.map(song => song.genre))];
      setGenres(uniqueGenres);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => setDuration(audio.duration),
      ended: handleNextSong
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, []);

  useEffect(() => {
    if (currentSong) {
      audioRef.current.src = currentSong.url;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentSong]);

  useEffect(() => {
    isPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying]);

  const handleCreatePlaylist = async () => {
    if (newPlaylistName && selectedSongs.length > 0) {
      const newPlaylist = {
        name: newPlaylistName,
        songs: selectedSongs,
        createdAt: new Date().toISOString()
      };
      

      const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
      setPlaylists([...playlists, { id: docRef.id, ...newPlaylist }]);
      setShowCreateModal(false);
      setNewPlaylistName('');
      setSelectedSongs([]);
    }
  };
  // const handleAddToPlaylist = async (playlistId) => {
  //   const playlist = playlists.find(p => p.id === playlistId);
  //   if (playlist && showAddToPlaylistModal) {
  //     const updatedSongs = [...new Set([...playlist.songs || [], showAddToPlaylistModal.id])];
  //     await updateDoc(doc(db, 'playlists', playlistId), { songs: updatedSongs });
      
  //     setPlaylists(playlists.map(p => 
  //       p.id === playlistId ? { ...p, songs: updatedSongs } : p
  //     ));
  //     setShowAddToPlaylistModal(null);
  //   }
  // };
  const handleAddToPlaylist = async (playlistId) => {
    if (showAddToPlaylistModal && playlistId) {
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        const updatedSongs = [...new Set([...playlist.songs || [], showAddToPlaylistModal.id])];
        await updateDoc(doc(db, 'playlists', playlistId), { songs: updatedSongs });
        
        setPlaylists(playlists.map(p => 
          p.id === playlistId ? { ...p, songs: updatedSongs } : p
        ));
        setShowAddToPlaylistModal(null); // Close the modal after adding
      }
    }
  };
  
  <Modal
    isOpen={!!showAddToPlaylistModal}
    onClose={() => setShowAddToPlaylistModal(null)}
  >
    <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>
    <div className="max-h-96 overflow-y-auto space-y-2">
      {playlists.map(playlist => (
        <button
          key={playlist.id}
          onClick={() => handleAddToPlaylist(playlist.id)}
          className="w-full text-left p-3 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <h3 className="font-semibold">{playlist.name}</h3>
          <p className="text-sm text-gray-400">{playlist.songs?.length || 0} songs</p>
        </button>
      ))}
    </div>
  </Modal>
  

  const handlePlayPlaylist = (playlist) => {
    if (currentPlaylistPlaying?.id === playlist.id) {
      setIsPlaying(!isPlaying);
    } else {
      const playlistSongs = playlist.songs?.map(songId => 
        songs.find(s => s.id === songId)
      ).filter(Boolean);
      
      if (playlistSongs.length > 0) {
        setCurrentPlaylistPlaying(playlist);
        setCurrentPlaylistIndex(0);
        setCurrentSong(playlistSongs[0]);
        setIsPlaying(true);
      }
    }
  };
  const handlePlayPause = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handlePreviousSong = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
    setCurrentSong(songs[newIndex]);
    setIsPlaying(true);
  };

  const handleNextSong = () => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    setCurrentSong(songs[randomIndex]);
    setIsPlaying(true);
  };

  const handleTimelineChange = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.songName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="p-6 px-11 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 ml-5">
        {/* Left Column: Playlists and Search */}
        <div className="space-y-8 p-auto">
         {/* Playlists Section */}
         <div>
            <div className="flex justify-between items-center mb-4 px-4">
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
                    <button 
                      onClick={() => handlePlayPlaylist(playlist)}
                      className="p-2 rounded-full bg-blue-500 hover:bg-blue-600"
                    >
                      {currentPlaylistPlaying?.id === playlist.id && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
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

        {/* Right Column: Featured Image */}
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
        {filteredSongs.map(song => (
          <div
            key={song.id}
            onClick={() => handlePlayPause(song)}
            className="relative overflow-hidden group bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all"
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
              </div>
              <button 
                onClick={() => setShowAddToPlaylistModal(song)}
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors group-hover:scale-105"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add to Playlist Modal */}
      <Modal
        isOpen={!!showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(null)}
      >
        <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h3 className="font-semibold">{playlist.name}</h3>
              <p className="text-sm text-gray-400">
                {playlist.songs?.length || 0} songs
              </p>
            </button>
          ))}
        </div>
      </Modal>

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
                onChange={() => {
                  setSelectedSongs(prev =>
                    prev.includes(song.id)
                      ? prev.filter(id => id !== song.id)
                      : [...prev, song.id]
                  );
                }}
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
        <div className="fixed bottom-0 left-64 right-0  bg-slate-800  border-t border-white/10 p-4">
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
            
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <div className="flex-1 relative h-1 bg-white/20 rounded-lg">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleTimelineChange}
                  className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-blue-500
                    [&::-webkit-slider-thumb]:relative
                    [&::-webkit-slider-thumb]:z-10
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-blue-500
                    [&::-moz-range-thumb]:border-0"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-l-lg pointer-events-none"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className="text-sm">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Streaming };




// //doc2
// import React, { useEffect, useState } from 'react';
// import { collection, query, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
// import { db } from '../components/firebase';
// import { Play, Pause, Plus, ListMusic, SkipForward, X } from 'lucide-react';

// const Streaming = () => {
//   const [songs, setSongs] = useState([]);
//   const [playlists, setPlaylists] = useState([]);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showPlaylistModal, setShowPlaylistModal] = useState(null);
//   const [newPlaylistName, setNewPlaylistName] = useState('');
//   const [selectedSongs, setSelectedSongs] = useState([]);
//   const [totalPlays, setTotalPlays] = useState(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       const songsQuery = query(collection(db, 'songs'));
//       const playlistsQuery = query(collection(db, 'playlists'));
      
//       const [songsSnap, playlistsSnap] = await Promise.all([
//         getDocs(songsQuery),
//         getDocs(playlistsQuery)
//       ]);

//       setSongs(songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       setPlaylists(playlistsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       setTotalPlays(songsSnap.docs.reduce((sum, doc) => sum + (doc.data().plays || 0), 0));
//     };

//     fetchData();
//   }, []);

//   const handlePlayPause = (song) => {
//     if (currentSong?.id === song.id) {
//       setIsPlaying(!isPlaying);
//     } else {
//       setCurrentSong(song);
//       setIsPlaying(true);
//     }
//   };

//   const handleNextSong = () => {
//     const randomIndex = Math.floor(Math.random() * songs.length);
//     setCurrentSong(songs[randomIndex]);
//     setIsPlaying(true);
//   };

//   const handleCreatePlaylist = async () => {
//     if (newPlaylistName && selectedSongs.length > 0) {
//       const newPlaylist = {
//         name: newPlaylistName,
//         songs: selectedSongs,
//         createdAt: new Date().toISOString()
//       };

//       await addDoc(collection(db, 'playlists'), newPlaylist);
//       setShowCreateModal(false);
//       setNewPlaylistName('');
//       setSelectedSongs([]);
//     }
//   };

//   const toggleSongSelection = (songId) => {
//     setSelectedSongs(prev => 
//       prev.includes(songId) 
//         ? prev.filter(id => id !== songId) 
//         : [...prev, songId]
//     );
//   };

//   return (
//     <div className="p-6 bg-slate-900 min-h-screen">
//       {/* Stats Section */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-gray-500 text-sm">Total Songs</h3>
//           <p className="text-2xl font-bold">{songs.length}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-gray-500 text-sm">Total Plays</h3>
//           <p className="text-2xl font-bold">{totalPlays}</p>
//         </div>
//       </div>

//       {/* Playlists Section */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Your Playlists</h2>
//           <button 
//             onClick={() => setShowCreateModal(true)}
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//           >
//             <Plus size={16} /> Create Playlist
//           </button>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {playlists.map(playlist => (
//             <div 
//               key={playlist.id}
//               onClick={() => setShowPlaylistModal(playlist)}
//               className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
//             >
//               <h3 className="font-semibold">{playlist.name}</h3>
//               <p className="text-sm text-gray-500">
//                 {playlist.songs?.length || 0} songs
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Songs List */}
//       <div className="mb-16">
//         <h2 className="text-xl font-bold mb-4">All Songs</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {songs.map(song => (
//             <div 
//               key={song.id} 
//               className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="font-semibold">{song.name}</h3>
//                   <p className="text-sm text-gray-500">{song.artist}</p>
//                   <p className="text-xs text-gray-400">{song.genre}</p>
//                 </div>
//                 <button 
//                   onClick={() => handlePlayPause(song)}
//                   className="p-2 bg-blue-500 text-white rounded-full"
//                 >
//                   {currentSong?.id === song.id && isPlaying ? (
//                     <Pause size={16} />
//                   ) : (
//                     <Play size={16} />
//                   )}
//                 </button>
//               </div>
//               <audio
//                 controls
//                 className="w-full mt-2"
//                 src={song.url}
//                 autoPlay={currentSong?.id === song.id && isPlaying}
//               >
//                 Your browser does not support the audio element.
//               </audio>
//             </div>
//           ))}
//         </div>
//       </div>


// {/* Play Bar */}
// {currentSong && (
//         <div className="  Play Bar fixed bottom-0 left-64 right-0 bg-white border-t shadow-lg p-4"> {/* Adjusted left spacing */}
//           <div className="max-w-screen-xl mx-auto flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button 
//                 onClick={() => setIsPlaying(!isPlaying)}
//                 className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
//               >
//                 {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//               </button>
//               <div>
//                 <h3 className="font-semibold">{currentSong.name}</h3>
//                 <p className="text-sm text-gray-500">{currentSong.artist}</p>
//               </div>
//             </div>
//             <button
//               onClick={handleNextSong}
//               className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
//             >
//               <SkipForward size={20} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Create Playlist Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0  bg-slate-950/70 bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">Create New Playlist</h2>
//               <button 
//                 onClick={() => setShowCreateModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <input
//               type="text"
//               placeholder="Playlist Name"
//               value={newPlaylistName}
//               onChange={(e) => setNewPlaylistName(e.target.value)}
//               className="w-full p-2 border rounded mb-4"
//             />

//             <div className="max-h-96 overflow-y-auto">
//               {songs.map(song => (
//                 <label 
//                   key={song.id}
//                   className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedSongs.includes(song.id)}
//                     onChange={() => toggleSongSelection(song.id)}
//                     className="mr-2"
//                   />
//                   <span>{song.name}</span>
//                 </label>
//               ))}
//             </div>

//             <button
//               onClick={handleCreatePlaylist}
//               className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
//             >
//               Create Playlist
//             </button>
//           </div>
//         </div>
//       )}


//        {/* Playlist Songs Modal */}
//        {showPlaylistModal && (
//         <div className="fixed inset-0 bg-slate-950/70 bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">{showPlaylistModal.name}</h2>
//               <button 
//                 onClick={() => setShowPlaylistModal(null)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="max-h-96 overflow-y-auto">
//               {showPlaylistModal.songs?.map(songId => {
//                 const song = songs.find(s => s.id === songId);
//                 return song ? (
//                   <div key={song.id} className="p-2 hover:bg-gray-50 rounded">
//                     <h3 className="font-medium">{song.name}</h3>
//                     <p className="text-sm text-gray-500">{song.artist}</p>
//                   </div>
//                 ) : null;
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export { Streaming };


// import React, { useEffect, useState, useRef } from 'react';
// import { collection, query, getDocs, where } from 'firebase/firestore';
// import { db } from '../components/firebase';
// import { Play, Pause, SkipBack, SkipForward, Search, X } from 'lucide-react';

// const WaveformBackground = () => (
//   <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 20">
//     <path d="M0 10 Q25 0, 50 10 T100 10" stroke="currentColor" fill="none" strokeWidth="0.5" />
//     <path d="M0 10 Q25 20, 50 10 T100 10" stroke="currentColor" fill="none" strokeWidth="0.5" />
//   </svg>
// );

// const formatTime = (seconds) => {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// };

// const Streaming = () => {
//   const [songs, setSongs] = useState([]);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedGenre, setSelectedGenre] = useState('');
//   const [genres, setGenres] = useState([]);
//   const audioRef = useRef(new Audio());

//   useEffect(() => {
//     const fetchData = async () => {
//       const songsQuery = query(collection(db, 'songs'));
//       const songsSnap = await getDocs(songsQuery);
//       const songsData = songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setSongs(songsData);
      
//       // Extract unique genres
//       const uniqueGenres = [...new Set(songsData.map(song => song.genre))];
//       setGenres(uniqueGenres);
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const audio = audioRef.current;

//     const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
//     const handleLoadedMetadata = () => setDuration(audio.duration);
//     const handleEnded = () => handleNextSong();

//     audio.addEventListener('timeupdate', handleTimeUpdate);
//     audio.addEventListener('loadedmetadata', handleLoadedMetadata);
//     audio.addEventListener('ended', handleEnded);

//     return () => {
//       audio.removeEventListener('timeupdate', handleTimeUpdate);
//       audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
//       audio.removeEventListener('ended', handleEnded);
//     };
//   }, []);

//   useEffect(() => {
//     if (currentSong) {
//       audioRef.current.src = currentSong.url;
//       if (isPlaying) {
//         audioRef.current.play();
//       }
//     }
//   }, [currentSong]);

//   useEffect(() => {
//     if (isPlaying) {
//       audioRef.current.play();
//     } else {
//       audioRef.current.pause();
//     }
//   }, [isPlaying]);

//   const handlePlayPause = (song) => {
//     if (currentSong?.id === song.id) {
//       setIsPlaying(!isPlaying);
//     } else {
//       setCurrentSong(song);
//       setIsPlaying(true);
//     }
//   };

//   const handlePreviousSong = () => {
//     const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
//     const newIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
//     setCurrentSong(songs[newIndex]);
//     setIsPlaying(true);
//   };

//   const handleNextSong = () => {
//     const randomIndex = Math.floor(Math.random() * songs.length);
//     setCurrentSong(songs[randomIndex]);
//     setIsPlaying(true);
//   };

//   const handleTimelineChange = (e) => {
//     const time = parseFloat(e.target.value);
//     audioRef.current.currentTime = time;
//     setCurrentTime(time);
//   };

//   const filteredSongs = songs.filter(song => {
//     const matchesSearch = song.songName.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesGenre = !selectedGenre || song.genre === selectedGenre;
//     return matchesSearch && matchesGenre;
//   });

//   return (
//     <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
//       {/* Search and Filter Section */}
//       <div className="mb-8 flex flex-col md:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//           <input
//             type="text"
//             placeholder="Search songs..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <select
//           value={selectedGenre}
//           onChange={(e) => setSelectedGenre(e.target.value)}
//           className="px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Genres</option>
//           {genres.map(genre => (
//             <option key={genre} value={genre}>{genre}</option>
//           ))}
//         </select>
//       </div>

//       {/* Songs List */}
//       <div className="space-y-4 mb-24">
//         {filteredSongs.map(song => (
//           <div
//             key={song.id}
//             onClick={() => handlePlayPause(song)}
//             className="relative overflow-hidden group bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all"
//           >
//             <WaveformBackground />
//             <div className="relative flex items-center justify-between">
//               <div className="flex-1">
//                 <h3 className="font-semibold text-lg">{song.songName}</h3>
//                 <p className="text-gray-400">{song.artist}</p>
//               </div>
//               <button className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors group-hover:scale-105">
//                 {currentSong?.id === song.id && isPlaying ? (
//                   <Pause size={20} />
//                 ) : (
//                   <Play size={20} />
//                 )}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Playbar */}
//       {currentSong && (
//         <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur border-t border-white/10 p-4">
//           <div className="max-w-screen-xl mx-auto">
//             <div className="flex items-center gap-4">
//               <div className="flex-1">
//                 <h3 className="font-semibold">{currentSong.songName}</h3>
//                 <p className="text-sm text-gray-400">{currentSong.artist}</p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={handlePreviousSong}
//                   className="p-2 hover:bg-white/10 rounded-full transition-colors"
//                 >
//                   <SkipBack size={20} />
//                 </button>
//                 <button
//                   onClick={() => setIsPlaying(!isPlaying)}
//                   className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
//                 >
//                   {isPlaying ? <Pause size={24} /> : <Play size={24} />}
//                 </button>
//                 <button
//                   onClick={handleNextSong}
//                   className="p-2 hover:bg-white/10 rounded-full transition-colors"
//                 >
//                   <SkipForward size={20} />
//                 </button>
//               </div>
//             </div>
            
//             <div className="mt-2 flex items-center gap-3">
//               <span className="text-sm">{formatTime(currentTime)}</span>
//               <input
//                 type="range"
//                 min="0"
//                 max={duration || 0}
//                 value={currentTime}
//                 onChange={handleTimelineChange}
//                 className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
//               />
//               <span className="text-sm">{formatTime(duration)}</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export { Streaming};