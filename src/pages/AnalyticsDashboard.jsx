// AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../components/firebase';
import emailjs from '@emailjs/browser';
import { getAuth } from 'firebase/auth';

export const AnalyticsDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [emailSending, setEmailSending] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'songs'))),
          getDocs(query(collection(db, 'users')))
        ]);

        setSongs(songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePlaybackStats = () => {
    return songs.map(song => ({
      name: song.songName,
      plays: song.plays || 0,
      uniqueListeners: song.uniqueListeners?.length || 0,
      averagePlayTime: song.totalPlayTime ? song.totalPlayTime / (song.plays || 1) : 0
    }));
  };

  const calculateUserEngagement = () => {
    return songs.map(song => ({
      name: song.songName,
      likes: song.likes || 0,
      shares: song.shares || 0,
      comments: song.comments || 0,
      engagementScore: ((song.likes || 0) + (song.shares || 0) * 2 + (song.comments || 0) * 3) / 6
    }));
  };

  const calculateArtistStats = () => {
    const artistStats = {};
    songs.forEach(song => {
      if (!artistStats[song.artist]) {
        artistStats[song.artist] = {
          totalPlays: 0,
          totalLikes: 0,
          totalShares: 0,
          songCount: 0
        };
      }
      artistStats[song.artist].totalPlays += song.plays || 0;
      artistStats[song.artist].totalLikes += song.likes || 0;
      artistStats[song.artist].totalShares += song.shares || 0;
      artistStats[song.artist].songCount += 1;
    });
    return Object.entries(artistStats).map(([artist, stats]) => ({
      name: artist,
      ...stats,
      averagePlayPerSong: stats.totalPlays / stats.songCount
    }));
  };
  const generateEmailReport = () => {
    const totalSongs = songs.length;
    const totalArtists = new Set(songs.map(song => song.artist)).size;
    const totalPlays = songs.reduce((sum, song) => sum + (song.plays || 0), 0);
    const totalUsers = users.length;
    
    const artistStats = calculateArtistStats();
    const topArtists = [...artistStats]
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 5);

    const topSongs = [...songs]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5);

    return {
      totalSongs,
      totalArtists,
      totalPlays,
      totalUsers,
      topArtists,
      topSongs,
      timeRange: selectedTimeRange,
      reportDate: new Date().toLocaleDateString()
    };
  };

  const sendAnalyticsReport = async () => {
    if (!auth.currentUser?.email) {
      setError('No user email found');
      return;
    }

    setEmailSending(true);
    const reportData = generateEmailReport();

    try {
      await emailjs.send(
        'service_i3t8r4m',
        'template_e254j4c',
        {
          to_email: auth.currentUser.email,
          report_date: reportData.reportDate,
          time_range: reportData.timeRange,
          total_songs: reportData.totalSongs,
          total_artists: reportData.totalArtists,
          total_plays: reportData.totalPlays,
          total_users: reportData.totalUsers,
          top_artists: reportData.topArtists
            .map(artist => `${artist.name} (${artist.totalPlays} plays)`)
            .join('\n'),
          top_songs: reportData.topSongs
            .map(song => `${song.songName} by ${song.artist} (${song.plays || 0} plays)`)
            .join('\n')
        },
        'hfx--3KcbLgX-EWIv'
      );

      alert('Analytics report sent successfully!');
    } catch (err) {
      setError('Failed to send email report: ' + err.message);
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics data...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
  
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Music Analytics Dashboard</h1>
      <button
        onClick={sendAnalyticsReport}
        disabled={emailSending}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
      >
        {emailSending ? 'Sending Report...' : 'Send Email Report'}
      </button>
    </div>
      {/* Time Range Selector */}
      <div className="mb-6">
        <select 
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Songs</h3>
          <p className="text-2xl font-bold">{songs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Artists</h3>
          <p className="text-2xl font-bold">
            {new Set(songs.map(song => song.artist)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Plays</h3>
          <p className="text-2xl font-bold">
            {songs.reduce((sum, song) => sum + (song.plays || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
      </div>

      {/* Playback Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Playback Statistics</h2>
          <LineChart width={500} height={300} data={calculatePlaybackStats()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="plays" stroke="#8884d8" />
            <Line type="monotone" dataKey="uniqueListeners" stroke="#82ca9d" />
          </LineChart>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Engagement</h2>
          <BarChart width={500} height={300} data={calculateUserEngagement()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="likes" fill="#8884d8" />
            <Bar dataKey="shares" fill="#82ca9d" />
            <Bar dataKey="comments" fill="#ffc658" />
          </BarChart>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Song Details</h2>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Song</th>
              <th className="p-3 text-left">Upload Date</th>
              <th className="p-3 text-left">Plays</th>
              <th className="p-3 text-left">Likes</th>
              <th className="p-3 text-left">Shares</th>
              <th className="p-3 text-left">Comments</th>
              <th className="p-3 text-left">Genre</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id} className="border-b">
                <td className="p-3">{song.songName}</td>
                <td className="p-3">{new Date(song.uploadedAt).toLocaleDateString()}</td>
                <td className="p-3">{song.plays || 0}</td>
                <td className="p-3">{song.likes || 0}</td>
                <td className="p-3">{song.shares || 0}</td>
                <td className="p-3">{song.comments || 0}</td>
                <td className="p-3">{song.genre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
    </div>
  );
};

export default AnalyticsDashboard;