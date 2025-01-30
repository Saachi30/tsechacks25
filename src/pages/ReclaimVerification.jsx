import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

const ReclaimVerification = () => {
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingStatus, setSendingStatus] = useState('');

  const sendProofsToBackend = async (proofs) => {
    try {
      setSendingStatus('sending');
      
      // Log the received proofs for debugging
      console.log('Processing proofs:', proofs);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSendingStatus('success');
      return { success: true, message: 'Proofs processed successfully' };
      
      // If you want to actually send to an API, uncomment this:
      /*
      const response = await fetch('/api/verify-proofs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proofs }),
      });

      if (!response.ok) {
        throw new Error('Failed to send proofs');
      }

      const data = await response.json();
      setSendingStatus('success');
      return data;
      */
      
    } catch (error) {
      console.error('Error sending proofs:', error);
      setSendingStatus('error');
      setError('Failed to send verification proofs to server');
      throw error;
    }
  };

  const handleVerification = async () => {
    try {
      setLoading(true);
      setError('');
      setSendingStatus('');

      const APP_ID = '0x50f3A9593d26B26AdDa35c9d014A98829Efe8B13';
      const APP_SECRET = '0xd7a2d2753bee3f4bfa40a5cd275ecf638871c4303b8bc91aefcb3bd4670a83cf';
      const PROVIDER_ID = 'f9f383fd-32d9-4c54-942f-5e9fda349762';

      const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
      const requestUrl = await reclaimProofRequest.getRequestUrl();
      setRequestUrl(requestUrl);

      await reclaimProofRequest.startSession({
        onSuccess: async (proofs) => {
          console.log('Verification success', proofs);
          setProofs(proofs);
          
          try {
            await sendProofsToBackend(proofs);
          } catch (error) {
            // Error handling is done in sendProofsToBackend
          }
          
          setLoading(false);
        },
        onError: (error) => {
          console.error('Verification failed', error);
          setError('Verification failed. Please try again.');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error during verification:', error);
      setError('Failed to start verification process');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg max-w-md mx-auto shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Gmail with Reclaim Protocol</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800 font-semibold">Error</div>
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <button
        onClick={handleVerification}
        disabled={loading}
        className={`w-full p-3 rounded-md text-white ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors duration-200`}
      >
        {loading ? 'Verifying...' : 'Verify Gmail'}
      </button>

      {requestUrl && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold mb-3">Scan QR Code to Verify</h3>
          <div className="inline-block p-4 bg-white rounded-lg border border-gray-200">
            <QRCode value={requestUrl} />
          </div>
        </div>
      )}

      {proofs && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
          <div className={`p-4 rounded-md mb-4 ${
            sendingStatus === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : sendingStatus === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className={`font-semibold ${
              sendingStatus === 'success' 
                ? 'text-green-800' 
                : sendingStatus === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }`}>
              {sendingStatus === 'sending' && 'Processing proofs...'}
              {sendingStatus === 'success' && 'Verification Complete!'}
              {sendingStatus === 'error' && 'Error Processing Proofs'}
            </div>
            <div className={`mt-1 ${
              sendingStatus === 'success' 
                ? 'text-green-600' 
                : sendingStatus === 'error'
                ? 'text-red-600'
                : 'text-blue-600'
            }`}>
              {sendingStatus === 'success' 
                ? 'Your Gmail has been successfully verified.' 
                : 'Verification proofs received. Processing...'}
            </div>
          </div>
          
          <div className="mt-4">
            <details className="cursor-pointer">
              <summary className="font-medium hover:text-blue-600 transition-colors duration-200">
                View Proof Details
              </summary>
              <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-x-auto text-sm border border-gray-200">
                {JSON.stringify(proofs, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclaimVerification;