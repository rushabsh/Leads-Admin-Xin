'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight, Fingerprint, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuthStore();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'Admin' || user.role === 'Super Admin')) {
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrUsername || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    const result = await login(emailOrUsername, password);
    if (result.success) {
      if (result.role === 'Admin' || result.role === 'Super Admin') {
        router.replace('/admin');
      } else {
        setErrorMsg('Unauthorized access. This portal is for Administrators only.');
        useAuthStore.getState().logout();
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-[#02020a] p-6 text-zinc-300 font-sans antialiased overflow-x-hidden selection:bg-purple-900/50">

      {/* Back to Gateway Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Gateway
        </Link>
      </div>

      {/* --- Main Dashboard Modular Interface Container --- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-zinc-900 bg-[#050512] md:grid-cols-2 shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
      >

        {/* ================= LEFT SIDE: DECORATIVE ARTWORK ================= */}
        <div className="relative hidden md:flex flex-col items-center justify-center border-r border-zinc-900/60 p-12 bg-[radial-gradient(ellipse_at_center,#090821_0%,transparent_70%)]">
          {/* Subtle Dot matrix technical grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#161530_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

          {/* Layered Cybernetic Radial Rings */}
          <div className="relative flex items-center justify-center w-64 h-64">
            <div className="absolute inset-0 rounded-full border border-purple-500/5 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-purple-500/10 animate-[spin_25s_linear_infinite_reverse]" />
            <div className="absolute inset-8 rounded-full border border-purple-500/5 bg-gradient-to-b from-purple-950/10 to-transparent" />

            {/* Core Shield Floating Token */}
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-500/20 bg-[#090822] shadow-[0_0_30px_rgba(147,51,234,0.15)]">
              <div className="relative flex items-center justify-center">
                <Shield className="h-10 w-10 text-purple-500/80" />
                <Lock className="absolute h-4 w-4 text-white mt-1" />
              </div>
            </div>
          </div>

          {/* Lower Informational Micro-Badge */}
          <div className="absolute bottom-8 left-8 right-8 rounded-xl border border-zinc-900 bg-[#070719]/80 p-4 backdrop-blur-sm flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-950/20">
              <Shield className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-zinc-200">Secure. Reliable. Trusted.</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Your security is our priority</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: AUTHENTICATION FORM ================= */}
        <div className="p-8 md:p-12 flex flex-col justify-center relative">

          {/* Mini Token Shield Header */}
          <div className="w-10 h-10 rounded-xl border border-purple-500/10 bg-purple-950/10 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.05)] mb-6">
            <Shield className="w-4 h-4 text-purple-400/90" />
          </div>

          {/* Title Headers */}
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Access</h1>
            <p className="text-zinc-400 text-xs font-light tracking-wide">
              Provide secure keys to initialize administrative privileges.
            </p>
          </div>

          {/* Error Banner System */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-xl bg-rose-500/5 border border-rose-500/20 p-3.5 text-xs text-rose-400 flex items-start gap-2.5 leading-normal"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Form Processing */}
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

            {/* Field: Security Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <Mail className="w-3 h-3 text-zinc-500" /> Security Email
              </label>
              <div className="relative group">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  disabled={isLoading}
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full rounded-xl border border-zinc-900 bg-[#03030d] pl-11 pr-4 py-3.5 outline-none text-zinc-200 placeholder-zinc-700 focus:border-purple-500/30 focus:bg-[#03030d]/90 transition-all duration-200"
                />
              </div>
            </div>

            {/* Field: Master Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <Lock className="w-3 h-3 text-zinc-500" /> Master Password
              </label>
              <div className="relative group">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-900 bg-[#03030d] pl-11 pr-12 py-3.5 outline-none text-zinc-200 placeholder-zinc-700 focus:border-purple-500/30 focus:bg-[#03030d]/90 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox and Forgot password sub-links */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-zinc-500 font-medium select-none cursor-pointer hover:text-zinc-400 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-zinc-900 bg-[#03030d] accent-purple-600 focus:ring-0 cursor-pointer"
                />
                Remember this device
              </label>
              <Link href="#" className="text-purple-400/80 hover:text-purple-400 hover:underline transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Action Trigger Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-[50px] overflow-hidden rounded-xl bg-[#7c2bf2] hover:bg-[#8b3eff] text-white font-medium text-xs shadow-[0_0_30px_rgba(124,43,242,0.3)] hover:shadow-[0_0_40px_rgba(124,43,242,0.5)] active:scale-[0.99] transition-all duration-300 flex items-center disabled:opacity-40 disabled:scale-100"
              >
                {/* Embedded left side fingerprint block */}
                <div className="flex h-full w-14 items-center justify-center border-r border-white/10 bg-black/10 shrink-0">
                  <Fingerprint className="w-5 h-5 text-white/90" />
                </div>

                {/* Main Label and Loading state wrapper */}
                <div className="flex-1 flex items-center justify-center gap-2 pr-4 font-semibold tracking-wide text-sm">
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Verify Identity
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

          </form>
        </div>
      </motion.div>

      {/* --- Footer Note --- */}
      <footer className="mt-8 flex items-center gap-2.5 font-mono text-[10px] text-zinc-600">
        <Shield className="w-3.5 h-3.5 text-zinc-700" />
        <p>All connections are encrypted <span className="text-zinc-800 font-sans mx-1">//</span> <span className="text-zinc-700 font-medium">AES-256 SSL Secured</span></p>
      </footer>

    </div>
  );
}