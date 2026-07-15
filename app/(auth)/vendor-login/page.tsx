'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight, Store, ArrowLeft, Headphones } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Link from 'next/link';

export default function VendorLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuthStore();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'Vendor') {
      router.replace('/vendor-portal');
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
      if (result.role === 'Vendor') {
        router.replace('/vendor-portal');
      } else {
        setErrorMsg('Unauthorized access. This portal is for Vendors only.');
        useAuthStore.getState().logout();
      }
    } else {
      if (result.message && (result.message.toLowerCase().includes('credential') || result.message.toLowerCase().includes('password') || result.message.toLowerCase().includes('invalid'))) {
        setErrorMsg('Invalid Login ID or Password.');
      } else {
        setErrorMsg(result.message || 'Invalid Login ID or Password.');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-[#02020a] p-6 text-zinc-300 font-sans antialiased overflow-x-hidden selection:bg-emerald-950/50">

      {/* Back to Gateway Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-emerald-400 transition-colors"
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

        {/* ================= LEFT SIDE: DECORATIVE ARTWORK & METADATA ================= */}
        <div className="relative hidden md:flex flex-col items-center justify-center border-r border-zinc-900/60 p-12 bg-[radial-gradient(ellipse_at_center,#061818_0%,transparent_70%)]">
          {/* Technical Dot matrix grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#102a24_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Layered Cybernetic Radial Rings */}
          <div className="relative flex items-center justify-center w-64 h-64">
            <div className="absolute inset-0 rounded-full border border-emerald-500/5 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-teal-500/10 animate-[spin_25s_linear_infinite_reverse]" />
            <div className="absolute inset-8 rounded-full border border-emerald-500/5 bg-gradient-to-b from-emerald-950/10 to-transparent" />

            {/* Core Workspace Identity Token */}
            <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-emerald-500/20 bg-[#040d0f] shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="relative flex items-center justify-center">
                <Store className="h-10 w-10 text-emerald-500/80" />
              </div>
            </div>
          </div>

          {/* Lower Informational Panel Statement */}
          <div className="absolute bottom-28 left-12 text-left space-y-1">
            <h4 className="text-sm font-semibold text-zinc-200">Secure. Connected. Empowered.</h4>
            <p className="text-xs text-zinc-500 font-light">Your portal. Your dashboard. Your performance.</p>
          </div>

          {/* Lower Encrypted Session Badge */}
          <div className="absolute bottom-8 left-8 right-8 rounded-xl border border-zinc-950 bg-[#03070d]/60 p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950">
              <Shield className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="text-left font-mono text-[11px]">
              <p className="text-zinc-400 font-medium">All connections are encrypted</p>
              <p className="text-zinc-600 mt-0.5">AES-256 SSL Secured</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: AUTHENTICATION FORM ================= */}
        <div className="p-8 md:p-12 flex flex-col justify-center relative">

          {/* Modular Top Token Block */}
          <div className="w-10 h-10 rounded-xl border border-emerald-500/10 bg-emerald-950/10 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.05)] mb-6">
            <Store className="w-4 h-4 text-emerald-400/90" />
          </div>

          {/* Core Typography Titles */}
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Vendor Portal</h1>
            <p className="text-zinc-400 text-xs font-light tracking-wide">
              Access tracking, lead updates, and profiles securely.
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

          {/* Active Data Input Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

            {/* Field: Corporate Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <Mail className="w-3 h-3 text-zinc-500" /> Vendor Email / Username
              </label>
              <div className="relative group">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  disabled={isLoading}
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="vendoruser"
                  className="w-full rounded-xl border border-zinc-900 bg-[#03030d] pl-11 pr-4 py-3.5 outline-none text-zinc-200 placeholder-zinc-700 focus:border-emerald-500/30 focus:bg-[#03030d]/90 transition-all duration-200"
                />
              </div>
            </div>

            {/* Field: Secure Access Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <Lock className="w-3 h-3 text-zinc-500" /> Password
              </label>
              <div className="relative group">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-900 bg-[#03030d] pl-11 pr-12 py-3.5 outline-none text-zinc-200 placeholder-zinc-700 focus:border-emerald-500/30 focus:bg-[#03030d]/90 transition-all duration-200"
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

            {/* Remember Device & Recovery Control Links */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-zinc-500 font-medium select-none cursor-pointer hover:text-zinc-400 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md border-zinc-900 bg-[#03030d] accent-emerald-600 focus:ring-0 cursor-pointer"
                />
                Remember me
              </label>
              <Link href="#" className="text-zinc-400 hover:text-white transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Premium Interactive Action Trigger Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-[50px] overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] active:scale-[0.99] transition-all duration-300 flex items-center disabled:opacity-40 disabled:scale-100"
              >
                {/* Embedded functional icon slot */}
                <div className="flex h-full w-14 items-center justify-center border-r border-white/10 bg-black/10 shrink-0">
                  <Shield className="w-4 h-4 text-white/90" />
                </div>

                {/* Label text & spinner runtime indicator */}
                <div className="flex-1 flex items-center justify-center gap-2 pr-4 font-semibold tracking-wide text-sm">
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Authenticate
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Split Decorative Horizontal Line */}
            <div className="w-full h-[1px] bg-zinc-900/60 my-6" />

            {/* Support / Helpdesk Navigation Grid Row */}
            <Link
              href="#"
              className="group flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-[#03030d]/40 hover:bg-[#03030d]/80 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-left font-sans">
                  <p className="text-xs font-semibold text-zinc-300">Need help?</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Contact IT Support</p>
                </div>
              </div>
              <span className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all text-sm font-mono">
                &rarr;
              </span>
            </Link>

          </form>
        </div>
      </motion.div>

      {/* --- Footer Note --- */}
      <footer className="mt-8 text-center font-mono text-[10px] text-zinc-700">
        SECURE_NODE // VENDOR_AUTH_SYSTEM_v1.0.0
      </footer>

    </div>
  );
}