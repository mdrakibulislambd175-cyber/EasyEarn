import { User, SellRequest, UserRole, UserStatus, RequestStatus, PRICE_LIST, SellPlatform, ADMIN_EMAIL } from '../types';

const USERS_KEY = 'easyearn_users';
const REQUESTS_KEY = 'easyearn_requests';
const CURRENT_USER_KEY = 'easyearn_current_user_id';

// Initialize DB with Admin if empty
const initDB = () => {
  const usersStr = localStorage.getItem(USERS_KEY);
  if (!usersStr) {
    const admin: User = {
      id: 'admin-1',
      fullName: 'Super Admin',
      email: ADMIN_EMAIL,
      password: 'admin', // simplified
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      balance: 0,
      totalWithdrawn: 0
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([admin]));
  }
};

export const getSessionUser = (): User | null => {
  initDB();
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return null;
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.find((u: User) => u.id === id) || null;
};

export const login = (email: string, pass: string): { success: boolean; message?: string; user?: User } => {
  initDB();
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email && u.password === pass);
  
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    return { success: true, user };
  }
  return { success: false, message: 'Invalid credentials' };
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const register = (fullName: string, email: string, pass: string): { success: boolean; message?: string } => {
  initDB();
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email already exists' };
  }

  const newUser: User = {
    id: Date.now().toString(),
    fullName,
    email,
    password: pass,
    role: UserRole.USER,
    status: UserStatus.PENDING_ACTIVATION,
    balance: 0,
    totalWithdrawn: 0
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, newUser.id); // Auto login
  return { success: true };
};

export const submitActivationPayment = (userId: string, method: string, trxId: string) => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].activationPayment = { method, trxId, date: new Date().toISOString() };
    users[index].status = UserStatus.PENDING_APPROVAL;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }
  return false;
};

// --- Sell Requests ---

export const submitSellRequest = (userId: string, userEmail: string, platform: SellPlatform, credentials: string) => {
  const requests: SellRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  const newReq: SellRequest = {
    id: Date.now().toString(),
    userId,
    userEmail,
    platform,
    credentials,
    status: RequestStatus.PENDING,
    amount: PRICE_LIST[platform],
    date: new Date().toISOString()
  };
  requests.push(newReq);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const getUserSellRequests = (userId: string): SellRequest[] => {
  const requests: SellRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  return requests.filter(r => r.userId === userId).reverse();
};

// --- Admin Functions ---

export const getAllUsers = (): User[] => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.filter(u => u.role === UserRole.USER).reverse();
};

export const updateUserStatus = (userId: string, status: UserStatus) => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].status = status;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const getAllSellRequests = (): SellRequest[] => {
  const requests: SellRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  return requests.reverse(); // Newest first
};

export const updateSellRequestStatus = (requestId: string, status: RequestStatus) => {
  const requests: SellRequest[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  const reqIndex = requests.findIndex(r => r.id === requestId);
  
  if (reqIndex !== -1) {
    const request = requests[reqIndex];
    request.status = status;
    
    // If approved, add money to user balance
    if (status === RequestStatus.APPROVED) {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const userIndex = users.findIndex(u => u.id === request.userId);
      if (userIndex !== -1) {
        users[userIndex].balance += request.amount;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
    
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }
};

export const getSystemStats = () => {
  const users = getAllUsers();
  const requests = getAllSellRequests();
  
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE).length;
  const pendingActivation = users.filter(u => u.status === UserStatus.PENDING_APPROVAL).length;
  const pendingSells = requests.filter(r => r.status === RequestStatus.PENDING).length;
  
  return { totalUsers, activeUsers, pendingActivation, pendingSells };
};