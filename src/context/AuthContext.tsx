import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/auth';
import { hashPassword } from '../utils/crypto';
import {
  findUserByEmailInDb,
  saveUserToDb,
  updateUserInDb,
} from '../services/dbService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lockScreen: () => void;
  unlockScreen: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updated: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'aura_finance_users_registry_v1';
const SESSION_KEY = 'aura_finance_current_session_v1';
const LOCKED_KEY = 'aura_finance_screen_locked_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize users and session
  useEffect(() => {
    async function init() {
      try {
        const storedUsersRaw = localStorage.getItem(USERS_KEY);
        let userList: User[] = [];

        if (storedUsersRaw) {
          userList = JSON.parse(storedUsersRaw);
        } else {
          // Create default demo user
          const demoHash = await hashPassword('senha123');
          const demoUser: User = {
            id: 'user-demo-001',
            name: 'Alexandre Silveira',
            email: 'demo@aurafinancas.com',
            passwordHash: demoHash,
            createdAt: '2026-01-15T10:00:00.000Z',
          };
          userList = [demoUser];
          localStorage.setItem(USERS_KEY, JSON.stringify(userList));
          saveUserToDb(demoUser).catch((e) => console.warn(e));
        }

        setUsers(userList);

        // Check active session
        const sessionUserId = localStorage.getItem(SESSION_KEY);
        if (sessionUserId) {
          const matched = userList.find((u) => u.id === sessionUserId);
          if (matched) {
            setCurrentUser(matched);
            const wasLocked = localStorage.getItem(LOCKED_KEY) === 'true';
            setIsLocked(wasLocked);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsInitialized(true);
      }
    }

    init();
  }, []);

  // Save users whenever updated
  useEffect(() => {
    if (isInitialized && users.length > 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users, isInitialized]);

  // Login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check locally first, or in Cloud Firestore
    let targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      const dbUser = await findUserByEmailInDb(cleanEmail);
      if (dbUser) {
        targetUser = dbUser;
        setUsers((prev) => [...prev, dbUser]);
      }
    }

    if (!targetUser) {
      return { success: false, error: 'Email não cadastrado. Verifique ou crie uma nova conta.' };
    }

    const hashedInput = await hashPassword(password);
    if (hashedInput !== targetUser.passwordHash) {
      return { success: false, error: 'Senha incorreta. Tente novamente.' };
    }

    setCurrentUser(targetUser);
    setIsLocked(false);
    localStorage.setItem(SESSION_KEY, targetUser.id);
    localStorage.removeItem(LOCKED_KEY);
    return { success: true };
  };

  // Demo Login (quick 1-click)
  const loginDemo = async () => {
    const demo = users.find((u) => u.email === 'demo@aurafinancas.com');
    if (demo) {
      setCurrentUser(demo);
      setIsLocked(false);
      localStorage.setItem(SESSION_KEY, demo.id);
      localStorage.removeItem(LOCKED_KEY);
      saveUserToDb(demo).catch(() => {});
    } else {
      // Re-create demo
      const demoHash = await hashPassword('senha123');
      const newDemo: User = {
        id: 'user-demo-001',
        name: 'Alexandre Silveira',
        email: 'demo@aurafinancas.com',
        passwordHash: demoHash,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newDemo, ...prev]);
      setCurrentUser(newDemo);
      setIsLocked(false);
      localStorage.setItem(SESSION_KEY, newDemo.id);
      localStorage.removeItem(LOCKED_KEY);
      saveUserToDb(newDemo).catch(() => {});
    }
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Por favor, informe seu nome completo.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Por favor, informe um endereço de email válido.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    // Check duplicate
    const existsLocally = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (existsLocally) {
      return { success: false, error: 'Este email já está cadastrado. Faça login ou use outro.' };
    }

    const existsInDb = await findUserByEmailInDb(cleanEmail);
    if (existsInDb) {
      return { success: false, error: 'Este email já está cadastrado no banco de dados. Faça login.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLocked(false);
    localStorage.setItem(SESSION_KEY, newUser.id);
    localStorage.removeItem(LOCKED_KEY);

    // Save to Cloud Firestore
    await saveUserToDb(newUser);

    return { success: true };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setIsLocked(false);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCKED_KEY);
  };

  // Lock Screen
  const lockScreen = () => {
    setIsLocked(true);
    localStorage.setItem(LOCKED_KEY, 'true');
  };

  // Unlock Screen
  const unlockScreen = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Sessão expirada' };

    const hashedInput = await hashPassword(password);
    if (hashedInput === currentUser.passwordHash) {
      setIsLocked(false);
      localStorage.removeItem(LOCKED_KEY);
      return { success: true };
    }
    return { success: false, error: 'Senha incorreta para desbloqueio.' };
  };

  // Update profile
  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const newObj = { ...currentUser, ...updated };
    setCurrentUser(newObj);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? newObj : u)));
    updateUserInDb(currentUser.id, updated).catch((e) => console.warn(e));
  };

  // Change Password
  const changePassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    const hashedOld = await hashPassword(oldPass);
    if (hashedOld !== currentUser.passwordHash) {
      return { success: false, error: 'A senha atual informada está incorreta.' };
    }

    if (newPass.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const hashedNew = await hashPassword(newPass);
    const updated = { ...currentUser, passwordHash: hashedNew };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    await updateUserInDb(currentUser.id, { passwordHash: hashedNew });

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLocked,
        login,
        loginDemo,
        register,
        logout,
        lockScreen,
        unlockScreen,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
