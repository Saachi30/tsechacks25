import React from 'react'
import { Upload } from 'lucide-react';
export const UploadMusic = () => {
    const [formData, setFormData] = React.useState({
      title: '',
      description: '',
      genre: '',
      collaborators: [],
      royaltySplits: []
    });
  
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Upload Music</h1>
        <p className="text-gray-600 mb-6">Upload and tokenize your music rights</p>
  
        <div className="bg-white rounded-lg shadow p-6">
          <form className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Track Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter track title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  >
                    <option value="">Select genre</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="electronic">Electronic</option>
                  </select>
                </div>
              </div>
            </div>
  
            {/* File Upload */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Music File</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your music file here</p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
  
            {/* Rights Management */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Rights Management</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collaborators
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter wallet address"
                    />
                    <input
                      type="number"
                      className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Split %"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Added Collaborators List */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Added Collaborators</p>
                  {/* Render added collaborators here */}
                </div>
              </div>
            </div>
  
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Upload and Tokenize
            </button>
          </form>
        </div>
      </div>
    );
  };
