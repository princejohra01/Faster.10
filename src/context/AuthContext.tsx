import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';
import { useToast } from './ToastContext';

export type AuthMode = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthMode;
  pendingOtpPreview: string | null;
  openAuthModal: (mode?: AuthMode, pendingAction?: () => void) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthMode) => void;
  login: (identifier: string, pass: string) => Promise<boolean>;
  register: (payload: { fullName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phone?: string }) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ success: boolean; preview?: string }>;
  resetPassword: (payload: { email: string; otp: string; newPassword: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [pendingOtpPreview, setPendingOtpPreview] = useState<string | null>(null);
  const [afterAuthCallback, setAfterAuthCallback] = useState<(() => void) | null>(null);

  const { showToast } = useToast();

  const openAuthModal = useCallback((mode: AuthMode = 'login', pendingAction?: () => void) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    if (pendingAction) {
      setAfterAuthCallback(() => pendingAction);
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const executePendingCallback = useCallback(() => {
    if (afterAuthCallback) {
      const cb = afterAuthCallback;
      setAfterAuthCallback(null);
      setTimeout(cb, 100);
    }
  }, [afterAuthCallback]);

  // Initial load
  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Stored token invalid, clearing session');
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login({ identifier, password: pass });
      setUser(res.user);
      setToken(res.token);
      setStoredToken(res.token);

      showToast(`Welcome back, ${res.user.fullName}`, 'success');
      closeAuthModal();
      executePendingCallback();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      return false;
    }
  };

  const register = async (payload: { fullName: string; email: string; phone: string; password: string }): Promise<boolean> => {
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setToken(res.token);
      setStoredToken(res.token);
      if (res.otpPreview) {
        setPendingOtpPreview(res.otpPreview);
      }
      showToast('Registration successful! Please verify your phone/email.', 'info');
      setAuthModalMode('verify');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      return false;
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    try {
      const res = await api.verifyOtp(otp);
      setUser(res.user);
      setPendingOtpPreview(null);
      showToast('Account successfully verified!', 'success');
      closeAuthModal();
      executePendingCallback();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
      return false;
    }
  };

  const resendOtp = async (): Promise<boolean> => {
    try {
      const res = await api.resendOtp();
      if (res.otpPreview) {
        setPendingOtpPreview(res.otpPreview);
      }
      showToast('New verification code sent', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to resend code', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      setStoredToken(null);
      showToast('You have been logged out', 'info');
    }
  };

  const updateProfile = async (data: { fullName?: string; phone?: string }) => {
    try {
      const res = await api.updateProfile(data);
      setUser(res.user);
      showToast('Profile updated', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Profile update failed', 'error');
      return false;
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      const res = await api.addAddress(address);
      if (user) {
        setUser({ ...user, savedAddresses: res.addresses });
      }
      showToast('Address saved', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Address save failed', 'error');
      return false;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await api.deleteAddress(id);
      if (user) {
        setUser({ ...user, savedAddresses: res.addresses });
      }
      showToast('Address removed', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to remove address', 'error');
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await api.forgotPassword(email);
      showToast(res.message, 'info');
      return { success: true, preview: res.resetOtpPreview };
    } catch (err: any) {
      showToast(err.message || 'Request failed', 'error');
      return { success: false };
    }
  };

  const resetPassword = async (payload: { email: string; otp: string; newPassword: string }) => {
    try {
      const res = await api.resetPassword(payload);
      showToast(res.message, 'success');
      setAuthModalMode('login');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Password reset failed', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        pendingOtpPreview,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
