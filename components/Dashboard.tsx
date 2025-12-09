import React, { useState, useEffect } from 'react';
import { User, SellPlatform, PRICE_LIST, RequestStatus, SellRequest } from '../types';
import { submitSellRequest, getUserSellRequests, logout } from '../services/db';
import { CheckCircle, Wallet, LogOut, DollarSign, Send, MessageCircle, Facebook, Mail, RefreshCw } from 'lucide-react';

interface DashboardProps {
  user: User;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY'>('HOME');
  const [selectedPlatform, setSelectedPlatform] = useState<SellPlatform | null>(null);
  const [credentials, setCredentials] = useState('');
  const [history, setHistory] = useState<SellRequest[]>([]);

  useEffect(() => {
    setHistory(getUserSellRequests(user.id));
  }, [user.id, activeTab]);

  const handleSell = () => {
    if (!selectedPlatform || !credentials) return;
    submitSellRequest(user.id, user.email, selectedPlatform, credentials);
    setCredentials('');
    setSelectedPlatform(null);
    alert('Sell Request Submitted! Please wait for admin approval.');
    setHistory(getUserSellRequests(user.id));
    onRefresh(); // Refresh user data if needed, though balance updates later
  };

  const platformIcons = {
    [SellPlatform.GMAIL]: <Mail className="h-6 w-6 text-red-500" />,
    [SellPlatform.TELEGRAM]: <Send className="h-6 w-6 text-blue-400" />,
    [SellPlatform.WHATSAPP]: <MessageCircle className="h-6 w-6 text-green-500" />,
    [SellPlatform.FACEBOOK]: <Facebook className="h-6 w-6 text-blue-700" />,
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return 'text-green-600 bg-green-100';
      case RequestStatus.REJECTED: return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {user.fullName}
              <CheckCircle className="h-5 w-5 text-blue-200 fill-blue-500 bg-white rounded-full" />
            </h1>
            <p className="text-blue-100 text-sm">{user.email}</p>
          </div>
          <button onClick={() => { logout(); window.location.reload(); }} className="text-blue-100 hover:text-white">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-blue-100 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs uppercase font-medium">Income</span>
            </div>
            <p className="text-2xl font-bold">৳{user.balance}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-blue-100 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs uppercase font-medium">Withdraw</span>
            </div>
            <p className="text-2xl font-bold">৳{user.totalWithdrawn}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Tabs */}
        <div className="flex justify-center mb-6 bg-white p-1 rounded-full shadow-sm">
          <button 
            onClick={() => setActiveTab('HOME')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${activeTab === 'HOME' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
          >
            Sell Account
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
          >
            History
          </button>
        </div>

        {activeTab === 'HOME' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Select Platform to Sell</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(SellPlatform) as Array<keyof typeof SellPlatform>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(SellPlatform[key])}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
                >
                  <div className="p-3 bg-gray-50 rounded-full">
                    {platformIcons[SellPlatform[key]]}
                  </div>
                  <span className="font-semibold text-gray-700">{key}</span>
                  <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                    ৳{PRICE_LIST[SellPlatform[key]]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-3">
             <div className="flex justify-between items-center mb-2">
               <h2 className="text-lg font-bold text-gray-800">My Sells</h2>
               <button onClick={() => setHistory(getUserSellRequests(user.id))}><RefreshCw className="h-4 w-4 text-gray-500"/></button>
             </div>
            
            {history.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sell history found.</p>
            ) : (
              history.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {platformIcons[req.platform]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{req.platform}</p>
                      <p className="text-xs text-gray-500">{new Date(req.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">৳{req.amount}</p>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Sell {selectedPlatform}</h3>
              <button onClick={() => setSelectedPlatform(null)} className="hover:text-gray-200">Close</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter the details for your {selectedPlatform.toLowerCase()} account.
                Ensure the credentials are correct.
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Account Credentials</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Email/Phone & Password..."
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Rate: <span className="text-green-600 font-bold">৳{PRICE_LIST[selectedPlatform]}</span> will be added to your wallet upon approval.
                </p>
              </div>

              <button
                onClick={handleSell}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};