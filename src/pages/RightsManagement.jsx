import React, { useState, useEffect } from 'react';
import { auth } from '../components/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  getFirestore,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';

export const RightsManagement = () => {
  const [activeTab, setActiveTab] = useState('owned');
  const [ownedSongs, setOwnedSongs] = useState([]);
  const [rightsRequests, setRightsRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [allSongs, setAllSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState('');
  const [selectedRightType, setSelectedRightType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const db = getFirestore();

  const rightTypes = [
    { id: 'licensing', label: 'Licensing Rights' },
    { id: 'partial', label: 'Partial Rights' },
    { id: 'full', label: 'Full Rights Transfer' },
  ];

  // Fetch all songs
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const songsSnapshot = await getDocs(collection(db, 'songs'));
        const songsData = songsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllSongs(songsData);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchAllSongs();
  }, [db]);

  // Fetch owned songs
  useEffect(() => {
    const fetchOwnedSongs = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
        const userData = userDoc.data();

        if (!userData?.playlist) {
          setOwnedSongs([]);
          return;
        }

        const songsPromises = userData.playlist.map(async (songId) => {
          const songDoc = await getDoc(doc(db, 'songs', songId));
          const songData = songDoc.data();

          if (!songData) return null;

          return {
            id: songId,
            songName: songData.songName || songData.name || 'Untitled',
            requestor: '-',
            type: 'Owner',
            offer: '-',
            status: 'Confirmed',
          };
        });

        const songs = (await Promise.all(songsPromises)).filter((song) => song !== null);
        setOwnedSongs(songs);
      } catch (error) {
        console.error('Error fetching owned songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedSongs();
  }, [db]);

  // Fetch rights requests for the current user
  useEffect(() => {
    const fetchRightsRequests = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Query requests where the current user is one of the artists
        const requestsQuery = query(
          collection(db, 'rightsRequests'),
          where('artistEmails', 'array-contains', currentUser.email)
        );

        const requestsSnapshot = await getDocs(requestsQuery);
        const requests = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRightsRequests(requests);
      } catch (error) {
        console.error('Error fetching rights requests:', error);
      }
    };

    if (activeTab === 'requests') {
      fetchRightsRequests();
    }
  }, [activeTab, db]);

  // Helper function to get artist emails from user IDs
  const getArtistEmails = async (artistIds) => {
    try {
      const emails = [];
      for (const artistId of artistIds) {
        const artistDoc = await getDoc(doc(db, 'Users', artistId));
        if (artistDoc.exists()) {
          const artistData = artistDoc.data();
          if (artistData.email) {
            emails.push(artistData.email);
          }
        }
      }
      return emails;
    } catch (error) {
      console.error('Error fetching artist emails:', error);
      return [];
    }
  };

  // Submit rights request
  const handleSubmitRequest = async () => {
    if (!selectedSong || !selectedRightType) return;

    setSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const selectedSongData = allSongs.find((song) => song.id === selectedSong);

      // Get all artist IDs from the song's artists map
      const artistIds = selectedSongData.artists ? Object.keys(selectedSongData.artists) : [];

      // Get artist emails
      const artistEmails = await getArtistEmails(artistIds);

      // Create the request
      const requestData = {
        songId: selectedSong,
        songName: selectedSongData.songName || selectedSongData.name,
        requestorId: currentUser.uid,
        requestorEmail: currentUser.email,
        requestorName: currentUser.displayName || currentUser.email,
        rightType: selectedRightType,
        status: 'Pending',
        createdAt: serverTimestamp(),
        artistIds: artistIds,
        artistEmails: artistEmails,
        acceptedArtists: [], // Initialize acceptedArtists array
        offer: '-', // You can add an offer field if needed
      };

      // Add request to Firebase
      await addDoc(collection(db, 'rightsRequests'), requestData);

      // Refresh the requests list
      const requestsQuery = query(
        collection(db, 'rightsRequests'),
        where('artistEmails', 'array-contains', currentUser.email)
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRightsRequests(requests);

      setIsFormOpen(false);
      setSelectedSong('');
      setSelectedRightType('');
    } catch (error) {
      console.error('Error submitting rights request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle request actions (Accept/Reject)
  const handleRequestAction = async (requestId, action) => {
    try {
      const requestRef = doc(db, 'rightsRequests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) return;

      const requestData = requestDoc.data();
      const currentUser = auth.currentUser;

      // Update the request status
      await updateDoc(requestRef, {
        status: action === 'accept' ? 'Accepted' : 'Rejected',
        actionBy: currentUser.email,
        actionAt: serverTimestamp(),
      });

      // If the request is accepted, add the artist to the acceptedArtists array
      if (action === 'accept') {
        await updateDoc(requestRef, {
          acceptedArtists: arrayUnion(currentUser.uid),
        });

        // Check if all artists have accepted the request
        const updatedRequestDoc = await getDoc(requestRef);
        const updatedRequestData = updatedRequestDoc.data();

        const allArtistsAccepted = updatedRequestData.artistIds.every((artistId) =>
          updatedRequestData.acceptedArtists?.includes(artistId)
        );

        if (allArtistsAccepted) {
          // Move the request to the requestor's owned rights
          const requestorRef = doc(db, 'Users', updatedRequestData.requestorId);
          await updateDoc(requestorRef, {
            playlist: arrayUnion(updatedRequestData.songId),
          });

          // Update the song's artists array to include the requestor
          const songRef = doc(db, 'songs', updatedRequestData.songId);
          const songDoc = await getDoc(songRef);

          if (songDoc.exists()) {
            const songData = songDoc.data();
            const updatedArtists = {
              ...songData.artists, // Keep existing artists
              [updatedRequestData.requestorId]: 'collaborator', // Add requestor as a collaborator
            };

            await updateDoc(songRef, {
              artists: updatedArtists,
            });
          }

          // Update the request status to 'Confirmed'
          await updateDoc(requestRef, {
            status: 'Confirmed',
          });
        }
      }

      // Refresh requests
      const requestsQuery = query(
        collection(db, 'rightsRequests'),
        where('artistEmails', 'array-contains', currentUser.email)
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRightsRequests(requests);
    } catch (error) {
      console.error('Error handling request action:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayData = activeTab === 'owned' ? ownedSongs : rightsRequests;

  return (
    <div className="p-6 space-y-6 bg-blue-50">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rights Management</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Request Rights
        </button>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-4 ${
            activeTab === 'owned'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('owned')}
        >
          Owned Rights
        </button>
        <button
          className={`pb-2 px-4 ${
            activeTab === 'requests'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Rights Requests
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {displayData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {activeTab === 'owned'
              ? 'No owned songs found in your playlist.'
              : 'No rights requests available.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'owned' ? 'Song Name' : 'Track'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'owned' ? 'Requestor' : 'From'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.songName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeTab === 'owned' ? item.requestor : item.requestorEmail || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.type || item.rightType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.offer || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeTab === 'requests' && item.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRequestAction(item.id, 'accept')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(item.id, 'reject')}
                          className="text-red-600 hover:text-red-800"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Request Rights</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Song
                </label>
                <select
                  value={selectedSong}
                  onChange={(e) => setSelectedSong(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a song</option>
                  {allSongs.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.songName || song.name || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rights Type
                </label>
                <select
                  value={selectedRightType}
                  onChange={(e) => setSelectedRightType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose rights type</option>
                  {rightTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmitRequest}
                disabled={submitting || !selectedSong || !selectedRightType}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightsManagement;