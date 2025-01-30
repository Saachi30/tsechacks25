import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Unplug, SendHorizontal, MessageCircle } from 'lucide-react';
import abi from '../abi.json';

const MusicRightsChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef(null);

  const CA = "0x8Ab34d6DE6Bc0144b18183d5ff6B530DE1a95638"; // Replace with your contract address
  const GEMINI_API_KEY = 'AIzaSyCFKswhga9q7KF-qZ4ZzwcTxZRtrg6sb7Y';

  const CONTRACT_ABI = abi;

  const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : null;
  const signer = provider?.getSigner();
  const contract = CA && signer ? new ethers.Contract(CA, CONTRACT_ABI, signer) : null;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, isBot = false) => {
    setMessages(prev => [...prev, { text, isBot, timestamp: Date.now() }]);
  };

  const connectWallet = async () => {
    try {
      if (!provider) {
        addMessage("Please install MetaMask!", true);
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);
      addMessage("Wallet connected successfully!", true);
    } catch (error) {
      addMessage("Failed to connect wallet: " + error.message, true);
    }
  };

  const processWithGemini = async (userInput) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant for a blockchain Music Rights Management platform.
                     Parse this user request and respond with a JSON object containing 'function' and 'parameters'.
                     Available functions: registerMusic, addCollaborators, distributeRoyalties, startCrowdfunding, contributeToCrowdfunding, withdrawCrowdfunding, createLicense, transferLicenseRights, getCollaborators, getMusicDetails, getLicenseDetails, hasAccessToLicense.
                     Give answer in the language of the user.
                     
                     User request: "${userInput}"
                     
                     If the request doesn't match any function, respond with:
                     {
                       "function": "chat",
                       "response": "your helpful response about Music Rights Management"
                     }
                     
                     For functions, respond with format:
                     {
                       "function": "registerMusic",
                       "parameters": {
                         "title": "Song Title",
                         "genre": "Pop",
                         "ipfsHash": "Qm..."
                       }
                     }`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 1,
            topK: 1,
            maxOutputTokens: 1000,
          },
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', errorData);
        throw new Error(`API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      try {
        const parsedResponse = JSON.parse(aiResponse.trim());
        
        if (parsedResponse.function === 'chat') {
          addMessage(parsedResponse.response, true);
          return null;
        }
        
        return processAIResponse(parsedResponse, userInput);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('AI Processing error:', error);
      addMessage(`Error: ${error.message}. Please try again.`, true);
      return null;
    }
  };

  const processAIResponse = (aiResponse, originalInput) => {
    if (!aiResponse.function || !aiResponse.parameters) {
      throw new Error('Invalid AI response format');
    }

    return {
      function: aiResponse.function,
      params: aiResponse.parameters
    };
  };

  const executeTransaction = async (action) => {
    try {
      let tx;
      let result;
      switch (action.function) {
        case 'registerMusic':
          tx = await contract.registerMusic(action.params.title, action.params.genre, action.params.ipfsHash);
          break;
        case 'addCollaborators':
          tx = await contract.addCollaborators(action.params.musicId, action.params.collaborators, action.params.royaltySplits);
          break;
        case 'distributeRoyalties':
          tx = await contract.distributeRoyalties(action.params.musicId, action.params.amount);
          break;
        case 'startCrowdfunding':
          tx = await contract.startCrowdfunding(action.params.musicId, action.params.targetAmount);
          break;
        case 'contributeToCrowdfunding':
          tx = await contract.contributeToCrowdfunding(action.params.musicId, action.params.amount);
          break;
        case 'withdrawCrowdfunding':
          tx = await contract.withdrawCrowdfunding(action.params.musicId);
          break;
        case 'createLicense':
          tx = await contract.createLicense(action.params.musicId, action.params.licensee, action.params.price, action.params.expiry, action.params.usageType, action.params.region, action.params.isExclusive);
          break;
        case 'transferLicenseRights':
          tx = await contract.transferLicenseRights(action.params.licenseId, action.params.newOwner);
          break;
        case 'getCollaborators':
          result = await contract.getCollaborators(action.params.musicId);
          addMessage(`Collaborators: ${result[0].join(', ')}\nRoyalty Splits: ${result[1].join(', ')}`, true);
          return;
        case 'getMusicDetails':
          result = await contract.getMusicDetails(action.params.musicId);
          addMessage(`Music Details: ${JSON.stringify(result, null, 2)}`, true);
          return;
        case 'getLicenseDetails':
          result = await contract.getLicenseDetails(action.params.licenseId);
          addMessage(`License Details: ${JSON.stringify(result, null, 2)}`, true);
          return;
        case 'hasAccessToLicense':
          result = await contract.hasAccessToLicense(action.params.licenseId, action.params.user);
          addMessage(`Has Access: ${result ? 'Yes' : 'No'}`, true);
          return;
        default:
          throw new Error('Unknown function');
      }
      
      if (tx) {
        const receipt = await tx.wait();
        addMessage(`Transaction successful! Hash: ${receipt.transactionHash}`, true);
      }
    } catch (error) {
      addMessage("Transaction failed: " + error.message, true);
    }
    setShowModal(false);
    setPendingAction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage(input, false);
    setInput('');

    if (!isConnected) {
      addMessage("Please connect your wallet first!", true);
      return;
    }

    const action = await processWithGemini(input);
    if (action) {
      if (action.function.startsWith('get') || action.function === 'hasAccessToLicense') {
        // Directly execute read-only functions without confirmation
        executeTransaction(action);
      } else {
        setPendingAction(action);
        setShowModal(true);
      }
    }
  };

  const formatTransactionDetails = (action) => {
    const details = [];
    
    switch (action.function) {
      case 'registerMusic':
        details.push(
          ['Title', action.params.title],
          ['Genre', action.params.genre],
          ['IPFS Hash', action.params.ipfsHash]
        );
        break;
      
      case 'addCollaborators':
        details.push(
          ['Music ID', action.params.musicId],
          ['Collaborators', action.params.collaborators.join(', ')],
          ['Royalty Splits', action.params.royaltySplits.join(', ')]
        );
        break;
      
      case 'distributeRoyalties':
        details.push(
          ['Music ID', action.params.musicId],
          ['Amount', action.params.amount]
        );
        break;
      
      case 'startCrowdfunding':
        details.push(
          ['Music ID', action.params.musicId],
          ['Target Amount', action.params.targetAmount]
        );
        break;
      
      case 'contributeToCrowdfunding':
        details.push(
          ['Music ID', action.params.musicId],
          ['Amount', action.params.amount]
        );
        break;
      
      case 'withdrawCrowdfunding':
        details.push(
          ['Music ID', action.params.musicId]
        );
        break;
      
      case 'createLicense':
        details.push(
          ['Music ID', action.params.musicId],
          ['Licensee', action.params.licensee],
          ['Price', action.params.price],
          ['Expiry', action.params.expiry],
          ['Usage Type', action.params.usageType],
          ['Region', action.params.region],
          ['Is Exclusive', action.params.isExclusive ? 'Yes' : 'No']
        );
        break;
      
      case 'transferLicenseRights':
        details.push(
          ['License ID', action.params.licenseId],
          ['New Owner', action.params.newOwner]
        );
        break;
      
      default:
        details.push(['Details', 'Unknown transaction type']);
    }
    
    return details;
  };

  const renderModal = () => {
    if (!showModal || !pendingAction) return null;

    const details = formatTransactionDetails(pendingAction);
    const functionName = pendingAction.function
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Confirm Transaction</h2>
          <div className="mb-6">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                {functionName}
              </h3>
              <div className="space-y-2">
                {details.map(([label, value], index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <span className="text-sm font-medium text-gray-600">{label}:</span>
                    <span className="text-sm text-gray-800 break-words">
                      {typeof value === 'string' && value.startsWith('0x') 
                        ? `${value.slice(0, 6)}...${value.slice(-4)}`
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => executeTransaction(pendingAction)}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors"
      >
        <MessageCircle size={24} />
      </button>

      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
          <div className="mb-4 flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Sarang</h1>
            <h4 text-2xl font-bold text-gray-500>Ai Agent</h4>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Unplug />
              </button>
            ) : (
              <span className="text-sm text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto mb-4 p-4 space-y-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isBot ? 'bg-gray-100' : 'bg-blue-500 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <SendHorizontal />
            </button>
          </form>

          {renderModal()}
        </div>
      )}
    </div>
  );
};

export default MusicRightsChatbot;