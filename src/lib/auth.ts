import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'advisor' | 'manager' | 'referral' | 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  mockGoogleLogin: () => Promise<User>;
}

// Demo users with predefined credentials
const demoUsers: Record<string, User> = {
  'advisor@advisor.com': {
    id: '1',
    email: 'advisor@advisor.com',
    role: 'advisor',
    name: 'Sarah Thompson'
  },
  'manager@manager.com': {
    id: '2', 
    email: 'manager@manager.com',
    role: 'manager',
    name: 'Michael Chen'
  },
  'referral@referral.com': {
    id: '3',
    email: 'referral@referral.com', 
    role: 'referral',
    name: 'Emma Wilson'
  },
  'admin@admin.com': {
    id: '4',
    email: 'admin@admin.com',
    role: 'admin', 
    name: 'David Rodriguez'
  },
  'client@client.com': {
    id: '5',
    email: 'client@client.com',
    role: 'client',
    name: 'Jennifer Lee'
  }
};

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simple demo validation - in real app this would be secure
        const user = demoUsers[email];
        if (user && (password === user.role || password === 'demo')) {
          set({ user, isAuthenticated: true });
          return user;
        }
        throw new Error('Invalid credentials');
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      mockGoogleLogin: async () => {
        // Mock Google SSO - defaults to advisor role
        const user = demoUsers['advisor@advisor.com'];
        set({ user, isAuthenticated: true });
        return user;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

// Route redirects based on role
export const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case 'advisor':
    case 'manager':
      return '/advisor/dashboard';
    case 'referral':
      return '/advisor/reports';
    case 'admin':
      return '/admin/compliance';
    case 'client':
      return '/client/cases';
    default:
      return '/';
  }
};