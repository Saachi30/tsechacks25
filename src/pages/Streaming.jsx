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

export { Streaming};
//GPT
// import React, { useState, useEffect, useRef } from 'react';
// import { Play, Pause, SkipForward, SkipBack, Plus, X, Search, Music2 } from 'lucide-react';
// import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
// import { db, auth } from '../components/firebase';

//  export const Streaming = () => {
//   const [songs, setSongs] = useState([]);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playlists, setPlaylists] = useState([]);
//   const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
//   const [showPlaylistSongs, setShowPlaylistSongs] = useState(false);
//   const [selectedPlaylist, setSelectedPlaylist] = useState(null);
//   const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
//   const [selectedSong, setSelectedSong] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [totalPlays, setTotalPlays] = useState(0);
//   const [trendingSongs, setTrendingSongs] = useState([]);
//   const audioRef = useRef(new Audio());

//   useEffect(() => {
//     fetchSongs();
//     fetchPlaylists();
//     fetchTotalPlays();
//   }, []);
//   const fetchTotalPlays = async () => {
//     try {
//       const songsCollection = collection(db, 'songs');
//       const songSnapshot = await getDocs(songsCollection);
//       let totalPlaysCount = 0;
  
//       songSnapshot.forEach(doc => {
//         const songData = doc.data();
//         totalPlaysCount += songData.plays || 0; // Ensure `plays` field exists
//       });
  
//       setTotalPlays(totalPlaysCount);
//     } catch (error) {
//       console.error('Error fetching total plays:', error);
//     }
//   };
  
//   const fetchSongs = async () => {
//     try {
//       const songsCollection = collection(db, 'songs');
//       const songSnapshot = await getDocs(songsCollection);
//       const songList = songSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setSongs(songList);
//       setTrendingSongs(songList.sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5));
//     } catch (error) {
//       console.error('Error fetching songs:', error);
//     }
//   };

//   const fetchPlaylists = async () => {
//     try {
//       const userDoc = doc(db, 'Users', auth.currentUser.uid);
//       const userSnapshot = await getDoc(userDoc);
//       if (userSnapshot.exists()) {
//         setPlaylists(userSnapshot.data().playlists || []);
//       }
//     } catch (error) {
//       console.error('Error fetching playlists:', error);
//     }
//   };

//   const createPlaylist = async (name, selectedSongs) => {
//     try {
//       const userDoc = doc(db, 'Users', auth.currentUser.uid);
//       const newPlaylist = {
//         id: Date.now().toString(),
//         name,
//         songs: selectedSongs
//       };
      
//       await updateDoc(userDoc, {
//         playlists: arrayUnion(newPlaylist)
//       });
      
//       setPlaylists([...playlists, newPlaylist]);
//       setShowCreatePlaylist(false);
//     } catch (error) {
//       console.error('Error creating playlist:', error);
//     }
//   };

//   const addToPlaylist = async (playlistId, song) => {
//     try {
//       const updatedPlaylists = playlists.map(playlist => {
//         if (playlist.id === playlistId) {
//           return {
//             ...playlist,
//             songs: [...playlist.songs, song]
//           };
//         }
//         return playlist;
//       });

//       const userDoc = doc(db, 'Users', auth.currentUser.uid);
//       await updateDoc(userDoc, {
//         playlists: updatedPlaylists
//       });

//       setPlaylists(updatedPlaylists);
//       setShowAddToPlaylist(false);
//     } catch (error) {
//       console.error('Error adding to playlist:', error);
//     }
//   };

//   const playSong = async (song) => {
//     try {
//       if (currentSong?.id === song.id) {
//         if (isPlaying) {
//           audioRef.current.pause();
//         } else {
//           audioRef.current.play();
//         }
//         setIsPlaying(!isPlaying);
//       } else {
//         if (currentSong) {
//           audioRef.current.pause();
//         }
//         audioRef.current.src = song.url;
//         audioRef.current.play();
//         setCurrentSong(song);
//         setIsPlaying(true);
        
//         // Update play count
//         const songDoc = doc(db, 'songs', song.id);
//         await updateDoc(songDoc, {
//           plays: (song.plays || 0) + 1
//         });
//       }
//     } catch (error) {
//       console.error('Error playing song:', error);
//     }
//   };

//   const filteredSongs = songs.filter(song => 
//     song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     song.genre.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col h-full bg-gray-100">
//       {/* Search and Stats Section */}
//       <div className="p-6 bg-white shadow">
//         <div className="flex items-center mb-4">
//           <Search className="w-5 h-5 text-gray-400 mr-2" />
//           <input
//             type="text"
//             placeholder="Search songs, artists, or genres..."
//             className="w-full p-2 border rounded-lg"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
        
//         <div className="grid grid-cols-3 gap-4">
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <h3 className="font-semibold">Total Plays</h3>
//             <p className="text-2xl font-bold text-blue-600">{totalPlays}</p>
//           </div>
//           <div className="bg-purple-50 p-4 rounded-lg">
//             <h3 className="font-semibold">Your Playlists</h3>
//             <p className="text-2xl font-bold text-purple-600">{playlists.length}</p>
//           </div>
//           <div className="bg-green-50 p-4 rounded-lg">
//             <h3 className="font-semibold">Available Songs</h3>
//             <p className="text-2xl font-bold text-green-600">{songs.length}</p>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-6 overflow-hidden">
//         <div className="grid grid-cols-3 gap-6 h-full">
//           {/* Playlists Section */}
//           <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Your Playlists</h2>
//               <button
//                 onClick={() => setShowCreatePlaylist(true)}
//                 className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
//               >
//                 Create New
//               </button>
//             </div>
            
//             <div className="space-y-2">
//               {playlists.map(playlist => (
//                 <div
//                   key={playlist.id}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
//                   onClick={() => {
//                     setSelectedPlaylist(playlist);
//                     setShowPlaylistSongs(true);
//                   }}
//                 >
//                   <div className="flex items-center">
//                     <Music2 className="w-5 h-5 mr-2 text-gray-500" />
//                     <span>{playlist.name}</span>
//                   </div>
//                   <span className="text-sm text-gray-500">{playlist.songs.length} songs</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Songs Section */}
//           <div className="col-span-2 bg-white rounded-lg shadow p-4 overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4">All Songs</h2>
//             <div className="space-y-2">
//               {filteredSongs.map(song => (
//                 <div
//                   key={song.id}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
//                 >
//                   <div className="flex items-center flex-1">
//                     <button
//                       onClick={() => playSong(song)}
//                       className="mr-4"
//                     >
//                       {currentSong?.id === song.id && isPlaying ? (
//                         <Pause className="w-6 h-6 text-blue-600" />
//                       ) : (
//                         <Play className="w-6 h-6 text-blue-600" />
//                       )}
//                     </button>
//                     <div>
//                       <h3 className="font-semibold">{song.name}</h3>
//                       <p className="text-sm text-gray-500">{song.artist}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <span className="text-sm text-gray-500">{song.genre}</span>
//                     <span className="text-sm text-gray-500">{song.duration}</span>
//                     <button
//                       onClick={() => {
//                         setSelectedSong(song);
//                         setShowAddToPlaylist(true);
//                       }}
//                       className="p-1 hover:bg-gray-200 rounded"
//                     >
//                       <Plus className="w-5 h-5 text-gray-600" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Create Playlist Modal */}
//       {showCreatePlaylist && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
//             <input
//               type="text"
//               placeholder="Playlist name"
//               className="w-full p-2 border rounded-lg mb-4"
//             />
//             <div className="max-h-64 overflow-y-auto mb-4">
//               {songs.map(song => (
//                 <div key={song.id} className="flex items-center p-2">
//                   <input type="checkbox" className="mr-2" />
//                   <span>{song.name}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setShowCreatePlaylist(false)}
//                 className="px-4 py-2 bg-gray-100 rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => createPlaylist("New Playlist", [])}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//               >
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add to Playlist Modal */}
//       {showAddToPlaylist && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>
//             <div className="max-h-64 overflow-y-auto mb-4">
//               {playlists.map(playlist => (
//                 <div
//                   key={playlist.id}
//                   onClick={() => addToPlaylist(playlist.id, selectedSong)}
//                   className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
//                 >
//                   {playlist.name}
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={() => setShowAddToPlaylist(false)}
//               className="w-full px-4 py-2 bg-gray-100 rounded-lg"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Player Controls */}
//       {currentSong && (
//         <div className="fixed bottom-0 left-64 right-0 bg-white border-t p-4">
//           <div className="flex items-center justify-between max-w-4xl mx-auto">
//             <div className="flex items-center space-x-4">
//               <button onClick={() => {/* Handle previous */}}>
//                 <SkipBack className="w-6 h-6" />
//               </button>
//               <button onClick={() => playSong(currentSong)}>
//                 {isPlaying ? (
//                   <Pause className="w-8 h-8 text-blue-600" />
//                 ) : (
//                   <Play className="w-8 h-8 text-blue-600" />
//                 )}
//               </button>
//               <button onClick={() => {/* Handle next */}}>
//                 <SkipForward className="w-6 h-6" />
//               </button>
//             </div>
//             <div>
//               <h3 className="font-semibold">{currentSong.name}</h3>
//               <p className="text-sm text-gray-500">{currentSong.artist}</p>
//             </div>
//             <div className="w-48 bg-gray-200 rounded-full h-2">
//               <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // export default Streaming;



// import React, { useEffect, useState } from 'react';
// import { collection, query, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
// import { db } from '../components/firebase';
// import { Music2, Plus, ListMusic, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

// export const Streaming = () => {
//   const [songs, setSongs] = useState([]);
//   const [playlists, setPlaylists] = useState([]);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//   const [newPlaylistName, setNewPlaylistName] = useState('');
//   const [selectedSongsForPlaylist, setSelectedSongsForPlaylist] = useState([]);

//   useEffect(() => {
//     fetchSongs();
//     fetchPlaylists();
//   }, []);

//   const fetchSongs = async () => {
//     const q = query(collection(db, 'songs'));
//     const querySnapshot = await getDocs(q);
//     const songsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     setSongs(songsData);
//   };

//   const fetchPlaylists = async () => {
//     const q = query(collection(db, 'playlists'));
//     const querySnapshot = await getDocs(q);
//     const playlistsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     setPlaylists(playlistsData);
//   };

//   const handlePlayPause = (song) => {
//     if (currentSong && currentSong.id === song.id) {
//       setIsPlaying(!isPlaying);
//     } else {
//       setCurrentSong(song);
//       setIsPlaying(true);
//     }
//   };

//   const handleAddToPlaylist = (songId) => {
//     setSelectedSongsForPlaylist([...selectedSongsForPlaylist, songId]);
//   };

//   const handleCreatePlaylist = async () => {
//     if (newPlaylistName && selectedSongsForPlaylist.length > 0) {
//       const newPlaylist = {
//         name: newPlaylistName,
//         songs: selectedSongsForPlaylist,
//       };
//       await setDoc(doc(collection(db, 'playlists')), newPlaylist);
//       setNewPlaylistName('');
//       setSelectedSongsForPlaylist([]);
//       setShowPlaylistModal(false);
//       fetchPlaylists();
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Streaming</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {songs.map(song => (
//           <div key={song.id} className="bg-white p-4 rounded-lg shadow">
//             <h2 className="text-lg font-semibold">{song.name}</h2>
//             <p className="text-sm text-gray-600">{song.artist}</p>
//             <p className="text-sm text-gray-600">{song.genre}</p>
//             <button onClick={() => handlePlayPause(song)} className="mt-2 p-2 bg-blue-500 text-white rounded">
//               {isPlaying && currentSong && currentSong.id === song.id ? <Pause /> : <Play />}
//             </button>
//             <button onClick={() => handleAddToPlaylist(song.id)} className="mt-2 p-2 bg-green-500 text-white rounded ml-2">
//               <Plus />
//             </button>
//           </div>
//         ))}
//       </div>

//       {showPlaylistModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg">
//             <h2 className="text-lg font-semibold mb-4">Create New Playlist</h2>
//             <input
//               type="text"
//               placeholder="Playlist Name"
//               value={newPlaylistName}
//               onChange={(e) => setNewPlaylistName(e.target.value)}
//               className="w-full p-2 border rounded mb-4"
//             />
//             <div className="mb-4">
//               {songs.map(song => (
//                 <div key={song.id} className="flex items-center mb-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedSongsForPlaylist.includes(song.id)}
//                     onChange={() => handleAddToPlaylist(song.id)}
//                     className="mr-2"
//                   />
//                   <span>{song.name}</span>
//                 </div>
//               ))}
//             </div>
//             <button onClick={handleCreatePlaylist} className="p-2 bg-blue-500 text-white rounded">
//               Create Playlist
//             </button>
//             <button onClick={() => setShowPlaylistModal(false)} className="p-2 bg-gray-500 text-white rounded ml-2">
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6">
//         <h2 className="text-xl font-bold mb-4">Playlists</h2>
//         {playlists.map(playlist => (
//           <div key={playlist.id} className="bg-white p-4 rounded-lg shadow mb-4">
//             <h3 className="text-lg font-semibold">{playlist.name}</h3>
//             <ul>
//               {playlist.songs.map(songId => {
//                 const song = songs.find(s => s.id === songId);
//                 return song ? <li key={song.id}>{song.name}</li> : null;
//               })}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // export default Streaming;