import Link from "next/link";
import { Shield, User, Lock, Eye, ShieldAlert } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-[#030214] text-zinc-400 p-6 font-sans antialiased overflow-hidden selection:bg-purple-900/50">

      {/* --- Ambient Cyber Glow Background & Particles --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep centered radial lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[140px]" />

        {/* Tech Grid Mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#16152b_1px,transparent_1px),linear-gradient(to_bottom,#16152b_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-30" />

        {/* Left and Right abstract abstract wavy particle meshes (Simulated via gradient bands) */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-gradient-to-tr from-purple-900/20 to-transparent blur-3xl opacity-40 rounded-full transform -rotate-12" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-gradient-to-tl from-blue-900/20 to-transparent blur-3xl opacity-40 rounded-full transform rotate-12" />
      </div>

      {/* --- Main Content Wrapper --- */}
      <div className="relative my-auto w-full max-w-5xl flex flex-col items-center space-y-12 py-12">

        {/* --- Header / System Identity --- */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-mono tracking-[0.15em] text-emerald-400 font-semibold uppercase">
              System Nominal
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Workspace <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Gateway</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs font-mono text-zinc-500">
              <span className="w-8 h-[1px] bg-zinc-800" />
              <span>SYS.LOC // AUTH_NODE_v1.0.0</span>
              <span className="w-8 h-[1px] bg-zinc-800" />
            </div>
            <p className="text-zinc-400 text-sm md:text-base font-light pt-2">
              Welcome! Select your workspace to continue.
            </p>
          </div>
        </header>

        {/* --- Multi-Column Portal Panels --- */}
        <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">

          {/* Panel 1: Admin Portal */}
          <div className="group relative rounded-2xl border border-purple-500/10 bg-gradient-to-b from-purple-950/10 to-transparent p-8 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500 flex flex-col justify-between min-h-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Ambient inner panel light */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />

            {/* Background Big Token Number */}
            <span className="absolute bottom-2 right-6 text-7xl md:text-8xl font-bold font-mono text-purple-950/20 select-none group-hover:text-purple-500/5 transition-colors duration-500">
              01
            </span>

            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-purple-400/80 uppercase font-semibold">
                  <span>01</span>
                  <span>/</span>
                  <span>Secure Access</span>
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100 tracking-wide">
                  Admin Portal
                </h2>
                <p className="text-zinc-400 text-xs font-light max-w-[240px] leading-relaxed">
                  Secure administrative dashboard for system management.
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <Link href="/admin-login" className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-900/50 to-purple-800/40 border border-purple-500/30 text-xs font-medium text-purple-200 hover:text-white hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300">
                Access Portal
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-mono text-sm group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Panel 2: Employee Workspace */}
          <div className="group relative rounded-2xl border border-blue-500/10 bg-gradient-to-b from-blue-950/10 to-transparent p-8 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between min-h-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Ambient inner panel light */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />

            {/* Background Big Token Number */}
            <span className="absolute bottom-2 right-6 text-7xl md:text-8xl font-bold font-mono text-blue-950/20 select-none group-hover:text-blue-500/5 transition-colors duration-500">
              02
            </span>

            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <User className="w-5 h-5 text-blue-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-blue-400/80 uppercase font-semibold">
                  <span>02</span>
                  <span>/</span>
                  <span>Workspace Access</span>
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100 tracking-wide">
                  Employee Workspace
                </h2>
                <p className="text-zinc-400 text-xs font-light max-w-[240px] leading-relaxed">
                  Your personal workspace to manage daily activities.
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <Link href="/vendor-login" className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-900/50 to-blue-800/40 border border-blue-500/30 text-xs font-medium text-blue-200 hover:text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
                Access Workspace
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-mono text-sm group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

        </nav>

        {/* --- Inline Status Monitor Box --- */}
        <div className="w-full max-w-2xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 px-2">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="font-mono text-[11px]">
                <p className="text-zinc-400 font-medium">Secure Access</p>
                <p className="text-zinc-600">256-bit Encryption</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 px-2 border-t sm:border-t-0 sm:border-x border-zinc-900 pt-3 sm:pt-0">
              <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="font-mono text-[11px]">
                <p className="text-zinc-400 font-medium">Authorized Only</p>
                <p className="text-zinc-600">Restricted Access</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 px-2 border-t sm:border-t-0 pt-3 sm:pt-0">
              <Eye className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="font-mono text-[11px]">
                <p className="text-zinc-400 font-medium">Activity Logged</p>
                <p className="text-zinc-600">All actions monitored</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- Footer Note --- */}
      <footer className="w-full text-center space-y-1 font-mono text-[11px] text-zinc-600 pt-6 pb-2 relative z-10 border-t border-zinc-950">
        <p>Authorized personnel only. Activities are logged.</p>
        <p className="flex items-center justify-center gap-1.5 text-zinc-700">
          <Lock className="w-3 h-3" /> © 2026 Workspace Gateway. All rights reserved.
        </p>
      </footer>

    </div>
  );
}