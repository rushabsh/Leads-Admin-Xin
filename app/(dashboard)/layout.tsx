'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Bell, Search, Plus, LogOut, Settings, Sun, Moon,
  LayoutDashboard, UserCheck, FolderKanban, Building2, Contact,
  BarChart3, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCRMStore } from '../../store/crmStore';

function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-screen animate-pulse bg-slate-50 dark:bg-[#0B0F19]">
      <div className="w-[260px] bg-[#111827] border-r border-slate-800" />
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-slate-200 dark:bg-[#0B0F19] dark:border-slate-800" />
        <div className="flex-1 p-8 space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const logout = useAuthStore(state => state.logout);
  const checkAuth = useAuthStore(state => state.checkAuth);

  const leads = useCRMStore(state => state.leads);
  const fetchLeads = useCRMStore(state => state.fetchLeads);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Failed to initialize session authentication:', error);
      }
    };
    init();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      try {
        await fetchLeads();
      } catch (error) {
        console.error('Failed to sync CRM dashboard lead items:', error);
      }
    };

    load();
  }, [isAuthenticated, fetchLeads]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = useCallback(async () => {
    await logout();
    const isVendor = pathname.startsWith('/vendor-portal');
    router.push(isVendor ? '/vendor-login' : '/admin-login');
  }, [logout, router, pathname]);

  const newLeadCount = useMemo(() => {
    return leads.filter(l => l.status === 'NEW').length;
  }, [leads]);

  const vendorLeadCount = useMemo(() => {
    if (!user) return 0;
    return leads.filter(l => l.status === 'NEW' && l.vendorId === user.vendorId).length;
  }, [leads, user]);

  const navItems = useMemo(() => {
    if (!user) return [];
    const role = user.role;

    const allItems = {
      dashboard: { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      leads: { name: 'Leads', icon: UserCheck, path: '/admin/leads', badge: newLeadCount },
      campaigns: { name: 'Campaigns', icon: FolderKanban, path: '/admin/campaigns' },
      lawfirms: { name: 'Law Firms', icon: Building2, path: '/admin/lawfirms' },
      vendors: { name: 'Vendors', icon: Contact, path: '/admin/vendors' },
      reports: { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
      settings: { name: 'Settings', icon: Settings, path: '/admin/settings' },
    };

    if (role === 'Vendor') {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/vendor-portal' },
        { name: 'Leads', icon: UserCheck, path: '/vendor-portal/leads', badge: vendorLeadCount },
        { name: 'Campaigns', icon: FolderKanban, path: '/vendor-portal/campaigns' },
        { name: 'Reports', icon: BarChart3, path: '/vendor-portal/reports' },
        { name: 'Settings', icon: Settings, path: '/vendor-portal/settings' },
      ];
    }

    return [
      allItems.dashboard,
      allItems.leads,
      allItems.campaigns,
      allItems.lawfirms,
      allItems.vendors,
      allItems.reports,
      allItems.settings,
    ];
  }, [user, newLeadCount, vendorLeadCount]);

  const breadcrumb = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Workspace';
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
  }, [pathname]);

  if (!isAuthenticated || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0B0F19] dark:text-slate-100">
      {/* SIDEBAR PANEL */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-35 flex h-full flex-col bg-[#111827] text-slate-300 border-r border-slate-800"
      >
        {/* Brand/Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight text-white animate-fade-in">
                MassCore <span className="text-primary">CRM</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none ${isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isSidebarCollapsed && (
                  <span className="flex-1 text-left whitespace-nowrap">{item.name}</span>
                )}
                {item.badge && item.badge > 0 && !isSidebarCollapsed && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger text-2xs font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse button bottom */}
        <div className="p-4 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-850 hover:bg-slate-800 hover:text-white"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* WORKSPACE & TOP BAR */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* STICKY TOP NAVBAR */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/70 px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B0F19]/70">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {breadcrumb}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Global search leads..."
                className="w-60 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-1.5 text-xs focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/50"
              />
            </div>

            {/* {user.role !== 'Viewer' && (
              <button
                onClick={() => router.push('/admin/leads?add=true')}
                className="flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary/10 hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Add</span>
              </button>
            )} */}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-primary" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger animate-pulse"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Active Alerts</span>
                      <button className="text-[10px] text-primary font-semibold hover:underline">Mark read</button>
                    </div>
                    <div className="mt-3 space-y-3.5 max-h-60 overflow-y-auto">
                      <div className="flex gap-3 text-xs leading-relaxed">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5"></div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">New Qualified Lead Signed</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">David Miller retainer validated automatically.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs leading-relaxed">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-warning mt-1.5"></div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">Callback Scheduled</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Callback with Sarah Connor is due in 3 hours.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-100/80 p-1.5 pr-3 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 focus:outline-none"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white font-bold text-xs uppercase shadow">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold leading-tight">{user.name}</p>
                  <p className="text-[10px] leading-none text-slate-400 mt-0.5">{user.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-850">
                      <p className="text-xs font-bold">{user.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          router.push('/admin/settings');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
                      >
                        <Settings className="h-4 w-4" />
                        <span>System Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-danger hover:bg-danger/5 dark:hover:bg-danger/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout Session</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}