import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User as UserIcon, CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth, AuthMode } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    pendingOtpPreview,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword
  } = useAuth();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // OTP state
  const [otpInput, setOtpInput] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!loginIdentifier || !loginPassword) {
      setLocalError('Please enter your email/phone and password');
      return;
    }
    setIsSubmitting(true);
    await login(loginIdentifier, loginPassword);
    setIsSubmitting(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword) {
      setLocalError('All fields are required');
      return;
    }

    if (!signupEmail.includes('@') || !signupEmail.includes('.')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (signupPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const success = await register({
      fullName: signupName.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      password: signupPassword
    });
    setIsSubmitting(false);

    if (success) {
      setOtpInput('');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!otpInput.trim()) {
      setLocalError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    await verifyOtp(otpInput.trim());
    setIsSubmitting(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!forgotEmail.trim()) {
      setLocalError('Please provide your registered email');
      return;
    }

    setIsSubmitting(true);
    const res = await forgotPassword(forgotEmail.trim());
    setIsSubmitting(false);
    if (res.success) {
      setResetStep('reset');
      if (res.preview) {
        setResetOtp(res.preview);
      }
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!resetOtp.trim() || !resetNewPassword) {
      setLocalError('OTP and new password are required');
      return;
    }

    if (resetNewPassword.length < 8) {
      setLocalError('New password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    const success = await resetPassword({
      email: forgotEmail.trim(),
      otp: resetOtp.trim(),
      newPassword: resetNewPassword
    });
    setIsSubmitting(false);
    if (success) {
      setResetStep('request');
      setAuthModalMode('login');
    }
  };

  const fillDemoAccount = (role: 'admin' | 'customer') => {
    setLocalError(null);
    if (role === 'admin') {
      setLoginIdentifier('admin@varenya.com');
      setLoginPassword('Admin@123456');
    } else {
      setLoginIdentifier('riya.sharma@example.com');
      setLoginPassword('Password@123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-black transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <span className="text-xl font-serif tracking-[0.25em] text-[#1C1A17] font-semibold uppercase block">
            VARENYA
          </span>
          <p className="text-xs text-stone-500 mt-1">
            {authModalMode === 'login' && 'Sign in to access your orders and secure checkout'}
            {authModalMode === 'signup' && 'Create your bespoke atelier customer profile'}
            {authModalMode === 'verify' && 'Verify your account credentials'}
            {authModalMode === 'forgot' && 'Reset your account security credentials'}
          </p>
        </div>

        {/* Notice for Guest Checkout transition */}
        <div className="mb-5 p-3 bg-[#F2EFEB] rounded-sm border border-[#E8E5DF] text-[11px] text-stone-700 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
          <p>
            An account is required to securely manage orders, doorstep returns, and customer information.
          </p>
        </div>

        {/* Local Error Banner */}
        {localError && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-sm">
            {localError}
          </div>
        )}

        {/* MODE: LOGIN */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Email Address or Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. riya.sharma@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('forgot')}
                  className="text-[11px] text-stone-500 hover:text-black underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Pre-fill */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-[10px] tracking-wider uppercase text-stone-400 block text-center mb-2">
                One-Click Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('customer')}
                  className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium rounded-sm border border-stone-200 transition-colors"
                >
                  Customer Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium rounded-sm border border-amber-200 transition-colors"
                >
                  Admin Atelier
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-stone-500">New to VARENYA? </span>
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="text-xs font-semibold text-[#1C1A17] hover:underline"
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* MODE: SIGNUP */}
        {authModalMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="e.g. Kabir Mehta"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="e.g. kabir@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={e => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupConfirmPassword}
                  onChange={e => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Registering...' : 'Register Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-stone-500">Already registered? </span>
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-xs font-semibold text-[#1C1A17] hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* MODE: OTP VERIFICATION */}
        {authModalMode === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="text-center p-3 bg-stone-100 rounded-sm border border-stone-200">
              <p className="text-xs text-stone-600">
                We have generated a 6-digit verification code to confirm your contact credentials.
              </p>
              {pendingOtpPreview && (
                <p className="mt-2 text-xs font-mono font-bold text-amber-900 bg-amber-100 py-1 px-2 rounded inline-block">
                  Verification Code: {pendingOtpPreview}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-2.5 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>

            <div className="flex justify-between items-center text-xs pt-2">
              <button
                type="button"
                onClick={resendOtp}
                className="text-stone-600 hover:text-black underline"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-stone-500 hover:text-black"
              >
                Back to Sign in
              </button>
            </div>
          </form>
        )}

        {/* MODE: FORGOT / RESET PASSWORD */}
        {authModalMode === 'forgot' && (
          <div className="space-y-4">
            {resetStep === 'request' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. riya.sharma@example.com"
                    className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Send Password Reset Code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-xs text-stone-500 hover:text-black underline"
                  >
                    Return to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3.5">
                <div className="p-2.5 bg-stone-100 text-xs text-stone-700 rounded-sm">
                  Enter the reset code sent to <strong>{forgotEmail}</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    value={resetOtp}
                    onChange={e => setResetOtp(e.target.value)}
                    placeholder="Enter 6-digit code (or 123456)"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={e => setResetNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
