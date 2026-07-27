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
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Leads Pipeline Overview</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.totalLeads}</h3>
              )}
              <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 mt-1">
                <TrendingUp className="h-3 w-3" /> +12% vs last month
              </span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">InProgress Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.todaysLeads}</h3>
              )}
              <span className="text-[10px] text-slate-550 mt-1 block">Intake queue active</span>
            </div>
          </motion.div>

          {/* Card 3 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('qualified', '')}
            className="glass-card p-5 flex flex-col justify-between cursor-pointer hover:border-success/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expected Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.qualifiedLeads}</h3>
              )}
              <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="h-3 w-3" /> {stats.totalLeads > 0 ? Math.round((stats.qualifiedLeads / stats.totalLeads) * 100) : 0}% Conversion
              </span>
            </div>
          </motion.div>

          {/* Card 4 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('disqualified')}
            className="glass-card p-5 flex flex-col justify-between cursor-pointer hover:border-rose-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Closed Leads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.disqualifiedLeads}</h3>
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
            className="glass-card p-5 flex flex-col justify-between cursor-pointer hover:border-warning/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed Retainers</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.signedRetainers}</h3>
              )}
              <span className="text-[10px] text-warning font-semibold flex items-center gap-0.5 mt-1">
                {stats.signedRetainers} Cases transferred
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Operations & Finance Analytics</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 6 */}
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Cases</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/10 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isLoadingCases ? (
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{activeCasesCount}</h3>
              )}
              <span className="text-[10px] text-slate-550 mt-1 block">In discovery phase</span>
            </div>
          </motion.div>

          {/* Card 7 */}
          {/* <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Banknote className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{formatCurrency(stats.revenue > 0 ? stats.revenue : 670000)}</h3>
              )}
              <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 mt-1">
                Settlements finalized
              </span>
            </div>
          </motion.div> */}

          {/* Card 8 */}
          {/* <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Payments</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{formatCurrency(stats.pendingPayments > 0 ? stats.pendingPayments : 15800)}</h3>
              )}
              <span className="text-[10px] text-danger font-semibold mt-1 block">Invoices outstanding</span>
            </div>
          </motion.div> */}

          {/* Card 9 */}
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Law Firms</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.lawFirms}</h3>
              )}
              <span className="text-[10px] text-slate-450 mt-1 block">Panel associates active</span>
            </div>
          </motion.div>

          {/* Card 10 (Clickable) */}
          <motion.div
            variants={itemVariants}
            onClick={() => onSelectTab('vendors')}
            className="glass-card p-5 flex flex-col justify-between cursor-pointer hover:border-success/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Vendors</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.vendors}</h3>
              )}
              <span className="text-[10px] text-slate-450 mt-1 block">Marketing feeds linked</span>
            </div>
          </motion.div>

          {/* Card 11 */}
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Campaigns</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              {isStatsLoading ? (
                <div className="h-7 w-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <h3 className="text-2xl font-bold">{stats.campaigns}</h3>
              )}
              <span className="text-[10px] text-slate-450 mt-1 block">Active marketing campaigns</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
