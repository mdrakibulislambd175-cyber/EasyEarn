import React, { useState, useEffect } from 'react';
import { User, SellRequest, UserStatus, RequestStatus } from '../types';
import { getSystemStats, getAllUsers, getAllSellRequests, updateUserStatus, updateSellRequestStatus, logout } from '../services/db';
import { Users, CheckCircle, XCircle, ShoppingBag, BarChart3, LogOut, RefreshCw } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'SELLS' | 'STATS'>('STATS');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [stats, setStats] = useState(getSystemStats());

  const refreshData = () => {
    setUsers(getAllUsers());
    setRequests(getAllSellRequests());
    setStats(getSystemStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleUserAction = (userId: string, action: 'APPROVE' | 'BAN') => {
    if (action === 'APPROVE') updateUserStatus(userId, UserStatus.ACTIVE);
    else updateUserStatus(userId, UserStatus.BANNED);
    refreshData();
  };

  const handleRequestAction = (reqId: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE') updateSellRequestStatus(reqId, RequestStatus.APPROVED);
    else updateSellRequestStatus(reqId, RequestStatus.REJECTED);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold text-xl">Admin Panel</h1>
        <div className="flex items-center gap-4">
          <button onClick={refreshData} className="p-2 hover:bg-slate-700 rounded-full">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button onClick={() => { logout(); window.location.reload(); }} className="text-red-300 hover:text-red-100 flex items-center gap-1">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('STATS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'STATS' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <BarChart3 className="h-5 w-5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'USERS' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Users className="h-5 w-5" />
            Users
            {stats.pendingActivation > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingActivation}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('SELLS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'SELLS' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <ShoppingBag className="h-5 w-5" />
            Sell Requests
            {stats.pendingSells > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingSells}</span>}
          </button>
        </div>

        {/* Stats View */}
        {activeTab === 'STATS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.activeUsers}</p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <h3 className="text-gray-500 text-sm font-medium">Pending Activations</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingActivation}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <h3 className="text-gray-500 text-sm font-medium">Pending Sells</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingSells}</p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm mt-4">
                <h3 className="font-bold text-lg mb-4">Financial Overview (Simulated)</h3>
                <div className="flex justify-between items-center border-b py-2">
                    <span className="text-gray-600">Total User Wallet Balance</span>
                    <span className="font-bold">৳{users.reduce((acc, u) => acc + u.balance, 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Withdrawn</span>
                    <span className="font-bold">৳{users.reduce((acc, u) => acc + u.totalWithdrawn, 0)}</span>
                </div>
            </div>
          </div>
        )}

        {/* Users View */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment Details</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold 
                        ${user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                          user.status === UserStatus.PENDING_APPROVAL ? 'bg-yellow-100 text-yellow-700' : 
                          user.status === UserStatus.BANNED ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {user.activationPayment ? (
                        <div>
                          <p><span className="font-semibold">{user.activationPayment.method}</span></p>
                          <p className="font-mono text-xs">{user.activationPayment.trxId}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">No payment</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {user.status === UserStatus.PENDING_APPROVAL && (
                        <button 
                          onClick={() => handleUserAction(user.id, 'APPROVE')}
                          className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                      )}
                      {user.status !== UserStatus.BANNED && (
                         <button 
                           onClick={() => handleUserAction(user.id, 'BAN')}
                           className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
                         >
                           Ban
                         </button>
                      )}
                      {user.status === UserStatus.BANNED && (
                         <button 
                           onClick={() => handleUserAction(user.id, 'APPROVE')}
                           className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200"
                         >
                           Unban
                         </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {users.length === 0 && <p className="p-8 text-center text-gray-500">No users found.</p>}
          </div>
        )}

        {/* Sell Requests View */}
        {activeTab === 'SELLS' && (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{req.platform}</span>
                    <span className="text-sm text-gray-500">from {req.userEmail}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-sm select-all">
                    {req.credentials}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Requested: {new Date(req.date).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <span className="font-bold text-lg text-gray-800">৳{req.amount}</span>
                  
                  {req.status === RequestStatus.PENDING ? (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleRequestAction(req.id, 'APPROVE')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleRequestAction(req.id, 'REJECT')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  ) : (
                     <span className={`px-3 py-1 rounded-full text-xs font-bold 
                        ${req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {req.status}
                      </span>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
                <div className="bg-white p-12 text-center rounded-xl">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No sell requests found.</p>
                </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};