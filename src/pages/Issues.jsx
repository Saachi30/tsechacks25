// import React from 'react'

// export const Issues = () => {
//     const [activeTab, setActiveTab] = React.useState('reported');
    
//     const issues = [
//         {
//           id: 1,
//           track: "Summer Beats",
//           reportedBy: "0x9876...5432",
//           type: "Copyright Violation",
//           evidence: "Original Registration Certificate",
//           status: "Under Review",
//           dateReported: "2024-01-15",
//           priority: "High",
//           lastUpdate: "2024-01-16"
//         },
//         {
//           id: 2,
//           track: "Midnight Dreams",
//           reportedBy: "0x1234...8765",
//           type: "Unauthorized Sample",
//           evidence: "Original Track Comparison",
//           status: "In Progress",
//           dateReported: "2024-01-18",
//           priority: "Medium",
//           lastUpdate: "2024-01-20"
//         },
//         {
//           id: 3,
//           track: "Urban Flow",
//           reportedBy: "0x5678...4321",
//           type: "Royalty Dispute",
//           evidence: "Contract Documents",
//           status: "Pending Resolution",
//           dateReported: "2024-01-20",
//           priority: "High",
//           lastUpdate: "2024-01-22"
//         },
//         {
//           id: 4,
//           track: "Rock Anthem",
//           reportedBy: "0x3456...7890",
//           type: "License Violation",
//           evidence: "Usage Documentation",
//           status: "Under Review",
//           dateReported: "2024-01-22",
//           priority: "Low",
//           lastUpdate: "2024-01-23"
//         },
//         {
//           id: 5,
//           track: "Electric Dreams",
//           reportedBy: "0x7890...1234",
//           type: "Content Claim",
//           evidence: "Ownership Proof",
//           status: "New",
//           dateReported: "2024-01-25",
//           priority: "Medium",
//           lastUpdate: "2024-01-25"
//         }
//       ];
    
  
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">Issues</h1>
//             <p className="text-gray-600">Track and manage reported issues</p>
//           </div>
//           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
//             Report Issue
//           </button>
//         </div>
  
//         <div className="bg-white rounded-lg shadow">
//           <div className="border-b">
//             <div className="flex space-x-4 px-6">
//               <button
//                 className={`py-3 px-4 border-b-2 ${
//                   activeTab === 'reported'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500'
//                 }`}
//                 onClick={() => setActiveTab('reported')}
//               >
//                 Reported Issues
//               </button>
//               <button
//                 className={`py-3 px-4 border-b-2 ${
//                   activeTab === 'resolved'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500'
//                 }`}
//                 onClick={() => setActiveTab('resolved')}
//               >
//                 Resolved
//               </button>
//             </div>
//           </div>
  
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Track
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Reported By
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Type
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Evidence
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {issues.map((issue) => (
//                   <tr key={issue.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">{issue.track}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">{issue.reportedBy}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">{issue.type}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">{issue.evidence}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs rounded-full ${
//                         issue.status === 'Under Review'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-green-100 text-green-800'
//                       }`}>
//                         {issue.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">{issue.dateReported}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button className="text-blue-600 hover:text-blue-800">
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../components/firebase';
import issue from '../assets/issue.png';
import { AlertCircle } from 'lucide-react';

export const Issues = () => {
  const [activeTab, setActiveTab] = useState('reported');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState("null");
  const [issues, setIssues] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [formData, setFormData] = useState({
    track: '',
    type: '',
    evidence: '',
    ipfsHash: '',
    evidenceUrl: ''
  });

  const issueTypes = [
    "Copyright Violation", "Unauthorized Sample",
    "Royalty Dispute", "License Violation", "Content Claim"
  ];

  // Fetch songs from Firebase
  useEffect(() => {
    const fetchSongs = async () => {
      const songsCollection = collection(db, 'songs');
      const songSnapshot = await getDocs(songsCollection);
      const songsList = songSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSongs(songsList);
    };

    fetchSongs();
  }, []);

  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      });

      return {
        ipfsHash: response.data.IpfsHash,
        evidenceUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, evidence: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload evidence to IPFS first
      const { ipfsHash, evidenceUrl } = await uploadToIPFS(selectedFile);
      
      const newIssue = {
        id: issues.length + 1,
        track: formData.track,
        reportedBy: "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6),
        fullAddress: "0x" + Math.random().toString(16).slice(2, 40),
        type: formData.type,
        evidence: selectedFile.name,
        evidenceUrl: evidenceUrl,
        ipfsHash: ipfsHash,
        status: "Under Review",
        dateReported: new Date().toISOString().split('T')[0],
        priority: "Medium",
        statusMessage: "Initial review pending - Documentation verification in progress"
      };

      setIssues([newIssue, ...issues]);
      setShowReportDialog(false);
      setFormData({ track: '', type: '', evidence: '', ipfsHash: '', evidenceUrl: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error submitting issue:', error);
      // Add appropriate error handling UI here
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header section remains the same */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Issues Tracking</h1>
            <p className="text-gray-600 mt-2">Track and manage reported content issues</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            onClick={() => setShowReportDialog(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Report Issue</span>
          </motion.button>
        </div>

        {issues.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-lg"
          >
            <img src={issue} alt="No issues" className="mx-auto mb-6 w-1/4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Issues Reported</h2>
            <p className="text-gray-500 mb-6">Click the 'Report Issue' button to submit a new content issue</p>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Tabs remain the same */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-4 px-6">
                <button
                  className={`py-3 px-4 border-b-2 transition-colors duration-200 ${
                    activeTab === 'reported'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('reported')}
                >
                  Reported Issues
                </button>
                {/* <button
                  className={`py-3 px-4 border-b-2 transition-colors duration-200 ${
                    activeTab === 'resolved'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('resolved')}
                >
                  Resolved
                </button> */}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{issue.track}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span>{issue.fullAddress}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{issue.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={issue.evidenceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {issue.evidence}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          issue.status === 'Under Review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : issue.status === 'Resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{issue.dateReported}</td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <button
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                          onMouseEnter={() => setHoveredStatus(true)}
                          onMouseLeave={() => setHoveredStatus(null)}
                        >
                          <AlertCircle className="w-4 h-4 ml-5" />
                          
                        </button>
                        <AnimatePresence>
                          {hoveredStatus === issue.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute z-10 top-0 left-full ml-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200"
                            >
                              <h4 className="font-semibold mb-2">Status Update</h4>
                              <p className="text-sm text-gray-600">{issue.statusMessage}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showReportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Report New Issue</h3>
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Track
                  </label>
                  <select 
                    name="track"
                    value={formData.track}
                    onChange={(e) => setFormData({...formData, track: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a song...</option>
                    {songs.map(song => (
                      <option key={song.id} value={song.songName}>{song.songName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type
                  </label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select issue type...</option>
                    {issueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <svg
                       className="mx-auto h-12 w-12 text-gray-400"
                       stroke="currentColor"
                       fill="none"
                       viewBox="0 0 48 48"
                     >
                       <path
                         d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                         strokeWidth="2"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                       />
                     </svg>
                     <div className="flex text-sm text-gray-600">
                       <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                         <span>Upload a file</span>
                         <input 
                           type="file" 
                           className="sr-only"
                           onChange={handleFileChange}
                           required
                         />
                       </label>
                       <p className="pl-1">or drag and drop</p>
                     </div>
                     <p className="text-xs text-gray-500">
                       {selectedFile ? selectedFile.name : 'PDF, DOC, MP3 up to 10MB'}
                     </p>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end space-x-3 mt-6">
                 <motion.button
                   type="button"
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                   onClick={() => setShowReportDialog(false)}
                 >
                   Cancel
                 </motion.button>
                 <motion.button
                   type="submit"
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                 >
                   Submit Report
                 </motion.button>
               </div>
             </form>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   </div>
 );
};

export default Issues;