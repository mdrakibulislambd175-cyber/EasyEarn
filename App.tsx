import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, ADMIN_EMAIL, ADMIN_PASS, PAYMENT_NUMBER } from './types';
import { getSessionUser, login, register, submitActivationPayment } from './services/db';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Loader2, Lock, Smartphone, UserPlus, LogIn, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Activation State
  const [paymentMethod, setPaymentMethod] = useState('Bkash');
  const [trxId, setTrxId] = useState('');
  const [activationSubmitted, setActivationSubmitted] = useState(false);

  useEffect(() => {
    // Check for existing session
    const existingUser = getSessionUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setLoading(false);
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const res = login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setError(res.message || 'Login failed');
      }
    } else {
      if (!fullName || !email || !password) {
        setError('All fields are required');
        return;
      }
      const res = register(fullName, email, password);
      if (res.success) {
        const newUser = getSessionUser(); // Auto login logic in register sets LS
        if(newUser) setUser(newUser);
      } else {
        setError(res.message || 'Registration failed');
      }
    }
  };

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && trxId) {
      const success = submitActivationPayment(user.id, paymentMethod, trxId);
      if (success) {
        setActivationSubmitted(true);
        // Refresh user state
        const updated = getSessionUser();
        if(updated) setUser(updated);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 1. Not Logged In
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">EASY EARN</h1>
              <p className="text-gray-500 mt-2">Start earning by selling accounts</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
              >
                {isLogin ? <><LogIn className="h-5 w-5" /> Login</> : <><UserPlus className="h-5 w-5" /> Sign Up</>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-blue-600 font-medium hover:underline text-sm"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
             Demo Admin: {ADMIN_EMAIL} / {ADMIN_PASS}
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged In as Admin
  if (user.role === UserRole.ADMIN) {
    return <AdminPanel />;
  }

  // 3. Logged In as User - Status Checks

  // Banned
  if (user.status === UserStatus.BANNED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Banned</h2>
          <p className="text-gray-600">Your account has been suspended due to policy violations.</p>
          <button onClick={() => window.location.reload()} className="mt-6 text-red-600 underline">Refresh</button>
        </div>
      </div>
    );
  }

  // Pending Activation (Payment Screen)
  if (user.status === UserStatus.PENDING_ACTIVATION) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Activate Account</h1>
            <p className="text-blue-100 mt-1">One-time payment required</p>
          </div>
          
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium text-center">
                Please send <span className="font-bold text-lg">50 BDT</span> to the number below to activate your dashboard.
              </p>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">Send Money To (Personal)</p>
              <div className="flex items-center justify-center gap-2 bg-gray-100 py-3 px-4 rounded-lg">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <span className="text-xl font-mono font-bold text-gray-800 select-all">{PAYMENT_NUMBER}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Nagad / Bkash / Rocket</p>
            </div>

            <form onSubmit={handleActivationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Bkash', 'Nagad', 'Rocket'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-lg text-sm font-medium border ${paymentMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 8JSD73..."
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg mt-4 flex items-center justify-center gap-2"
              >
                Submit Payment <ArrowRight className="h-5 w-5" />
              </button>
            </form>
             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full text-center mt-6 text-gray-400 text-xs">Cancel & Logout</button>
          </div>
        </div>
      </div>
    );
  }

  // Pending Approval (Waiting for Admin)
  if (user.status === UserStatus.PENDING_APPROVAL) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Activation Pending</h2>
          <p className="text-gray-600 text-sm mb-6">
            We have received your payment request. The admin will verify your transaction ID shortly.
          </p>
          <div className="bg-gray-50 rounded p-3 mb-6 text-xs text-left">
            <p><span className="font-semibold">Transaction ID:</span> {user.activationPayment?.trxId}</p>
            <p><span className="font-semibold">Method:</span> {user.activationPayment?.method}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Check Status
          </button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 text-gray-400 text-xs">Logout</button>
        </div>
      </div>
    );
  }

  // 4. Active User Dashboard
  return (
    <Dashboard 
      user={user} 
      onRefresh={() => {
        const u = getSessionUser();
        if(u) setUser(u);
      }} 
    />
  );
};

export default App;