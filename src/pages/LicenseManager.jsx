import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Lottie from 'lottie-web';
import { motion } from 'framer-motion';
import abi from '../abi.json';

const CONTRACT_ADDRESS = "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638";
const CONTRACT_ABI = abi;

const regions = [
  "Global",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "India",
  "China",
  "Japan",
  "Australia",
  "Other",
];

const usageTypes = [
  "Streaming",
  "Download",
  "Public Performance",
  "Synchronization",
  "Other",
];

const LicenseManager = () => {
  const [formData, setFormData] = useState({
    musicId: '',
    licensee: '',
    price: '',
    expiry: '',
    usageType: '',
    region: '',
    isExclusive: false,
    otherUsageType: '',
  });
  const [licenseId, setLicenseId] = useState('');
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [showNFTAnimation, setShowNFTAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUsageTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      usageType: value,
      otherUsageType: value === 'Other' ? '' : prev.otherUsageType,
    }));
  };

  const createLicense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.createLicense(
        formData.musicId,
        formData.licensee,
        ethers.utils.parseEther(formData.price),
        Math.floor(new Date(formData.expiry).getTime() / 1000),
        formData.usageType === 'Other' ? formData.otherUsageType : formData.usageType,
        formData.region,
        formData.isExclusive
      );

      await tx.wait();
      setShowNFTAnimation(true);
      setTimeout(() => setShowNFTAnimation(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseDetails = async () => {
    if (!licenseId) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const details = await contract.getLicenseDetails(licenseId);
      setLicenseDetails({
        musicId: details.musicId.toString(),
        licensee: details.licensee,
        price: ethers.utils.formatEther(details.price),
        expiry: new Date(details.expiry.toNumber() * 1000).toLocaleDateString(),
        usageType: details.usageType,
        region: details.region,
        isExclusive: details.isExclusive,
        isActive: details.isActive,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Music License Manager</h1>

          {/* Create License Form */}
          <form onSubmit={createLicense} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Music ID</label>
                <input
                  type="number"
                  name="musicId"
                  value={formData.musicId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Licensee Address</label>
                <input
                  type="text"
                  name="licensee"
                  value={formData.licensee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Price (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Usage Type</label>
                <select
                  name="usageType"
                  value={formData.usageType}
                  onChange={handleUsageTypeChange}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {usageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {formData.usageType === 'Other' && (
                  <input
                    type="text"
                    name="otherUsageType"
                    value={formData.otherUsageType}
                    onChange={handleInputChange}
                    placeholder="Specify usage type"
                    className="w-full mt-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isExclusive"
                checked={formData.isExclusive}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <label className="ml-2 text-gray-700">Exclusive License</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating License...' : 'Create License'}
            </button>
          </form>

          {/* Get License Details */}
          <div className="mt-12 p-6 bg-gray-100 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">View License Details</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                placeholder="Enter License ID"
                className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={getLicenseDetails}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold transform hover:scale-105 transition-all duration-300"
              >
                Get Details
              </button>
            </div>

            {licenseDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-white rounded-xl"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">License Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-gray-700"><span className="opacity-70">Music ID:</span> {licenseDetails.musicId}</div>
                  <div className="text-gray-700"><span className="opacity-70">Licensee:</span> {licenseDetails.licensee}</div>
                  <div className="text-gray-700"><span className="opacity-70">Price:</span> {licenseDetails.price} ETH</div>
                  <div className="text-gray-700"><span className="opacity-70">Expiry:</span> {licenseDetails.expiry}</div>
                  <div className="text-gray-700"><span className="opacity-70">Usage Type:</span> {licenseDetails.usageType}</div>
                  <div className="text-gray-700"><span className="opacity-70">Region:</span> {licenseDetails.region}</div>
                  <div className="text-gray-700"><span className="opacity-70">Exclusive:</span> {licenseDetails.isExclusive ? 'Yes' : 'No'}</div>
                  <div className="text-gray-700"><span className="opacity-70">Active:</span> {licenseDetails.isActive ? 'Yes' : 'No'}</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* NFT Minted Animation */}
        {showNFTAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center">
              <div className="w-24 h-24 mx-auto mb-4">
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-purple-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">NFT Minted Successfully!</h3>
              <p className="text-gray-700">Your license has been created and minted as an NFT</p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseManager;