import { motion } from 'framer-motion';
import {
  Users, UserCheck, Scale, Banknote, Clock, ArrowUpRight, TrendingUp,
  Award, Briefcase, Landmark
} from 'lucide-react';

interface KpiCardsProps {
  stats: {
    totalLeads: number;
    todaysLeads: number;
    qualifiedLeads: number;
    disqualifiedLeads: number;
    signedRetainers: number;
    campaigns: number;
    vendors: number;
    lawFirms: number;
    revenue: number;
    pendingPayments: number;
  };
  isStatsLoading: boolean;
  isLoadingCases: boolean;
  activeCasesCount: number;
  onSelectTab: (tab: 'qualified' | 'disqualified' | 'vendors', status?: string) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function KpiCards({
  stats,
  isStatsLoading,
  isLoadingCases,
  activeCasesCount,
  onSelectTab
}: KpiCardsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Leads Pipeline Overview</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-16 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.totalLeads}</h3>
              )}
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                <TrendingUp className="h-3 w-3" /> +12% vs last month
              </span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">InProgress Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.todaysLeads}</h3>
              )}
              <span className="text-[10px] text-slate-500 mt-1 block">Intake queue active</span>
            </div>
          </motion.div>

          {/* Card 3 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('qualified', '')}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-14 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.qualifiedLeads}</h3>
              )}
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="h-3 w-3" /> {stats.totalLeads > 0 ? Math.round((stats.qualifiedLeads / stats.totalLeads) * 100) : 0}% Conversion
              </span>
            </div>
          </motion.div>

          {/* Card 4 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('disqualified')}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.disqualifiedLeads}</h3>
              )}
              <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5 mt-1">
                Rejected / Inactive claims
              </span>
            </div>
          </motion.div>

          {/* Card 5 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('qualified', 'SIGNED_RETAINER')}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed Retainers</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.signedRetainers}</h3>
              )}
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5 mt-1">
                {stats.signedRetainers} Cases transferred
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Operations & Finance Analytics</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 6 */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cases</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isLoadingCases ? (
                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{activeCasesCount}</h3>
              )}
              <span className="text-[10px] text-slate-500 mt-1 block">In discovery phase</span>
            </div>
          </motion.div>

          {/* Card 9 */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Law Firms</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-10 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.lawFirms}</h3>
              )}
              <span className="text-[10px] text-slate-500 mt-1 block">Panel associates active</span>
            </div>
          </motion.div>

          {/* Card 10 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('vendors')}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendors</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-10 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.vendors}</h3>
              )}
              <span className="text-[10px] text-slate-500 mt-1 block">Marketing feeds linked</span>
            </div>
          </motion.div>

          {/* Card 11 */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campaigns</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-10 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stats.campaigns}</h3>
              )}
              <span className="text-[10px] text-slate-500 mt-1 block">Active marketing campaigns</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
