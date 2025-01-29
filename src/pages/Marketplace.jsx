import React, { useState } from 'react';
import { 
  Play,
  Pause,
  Filter,
  Heart,
  Share2,
  DollarSign,
  Music
} from 'lucide-react';

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['All', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical'];
  
  const listings = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "Sarah Johnson",
      genre: "Electronic",
      price: 299.99,
      duration: "3:45",
      likes: 1243,
      cover: "/api/placeholder/200/200"
    },
    {
      id: 2,
      title: "Urban Rhythm",
      artist: "Mike Williams",
      genre: "Hip Hop",
      price: 199.99,
      duration: "4:20",
      likes: 892,
      cover: "/api/placeholder/200/200"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Music Marketplace</h1>
          <p className="text-gray-600">Discover and license music</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          List New Track
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="text-gray-400" />
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex-1"></div>
          <select className="border p-2 rounded-lg">
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
            <option>Recently Added</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-4 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative">
              <img 
                src={listing.cover} 
                alt={listing.title} 
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100">
                <Play className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{listing.artist}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{listing.genre}</span>
                <span className="text-sm text-gray-500">{listing.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">{listing.likes}</span>
                </div>
                <span className="font-semibold text-lg">${listing.price}</span>
              </div>
            </div>
            <div className="border-t p-4">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                License Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;