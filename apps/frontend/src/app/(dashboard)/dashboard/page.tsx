'use client';

import { motion } from 'framer-motion';
import { Bug, FolderGit2, ShieldAlert, TrendingUp, Sparkles, Terminal, FileText, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiJson } from '@/lib/api';
import { GithubImport } from '@/components/dashboard/github-import';

interface Stats {
  repositoriesCount: number;
  openIssuesCount: number;
  securityAlertsCount: number;
  avgQualityScore: number | null;
}

const STAT_CONFIGS = [
  {
    label: 'Total Repositories',
    icon: FolderGit2,
    gradient: 'from-primary/15 to-primary/5',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  {
    label: 'Open Issues',
    icon: Bug,
    gradient: 'from-warning/15 to-warning/5',
    iconBg: 'bg-warning/15',
    iconColor: 'text-warning',
  },
  {
    label: 'Security Alerts',
    icon: ShieldAlert,
    gradient: 'from-danger/15 to-danger/5',
    iconBg: 'bg-danger/15',
    iconColor: 'text-danger',
  },
  {
    label: 'Avg Quality Score',
    icon: TrendingUp,
    gradient: 'from-success/15 to-success/5',
    iconBg: 'bg-success/15',
    iconColor: 'text-success',
  },
];

const CODER_FEATURES = [
  {
    title: 'Security Audit',
    description: 'Run deep SAST scans on your active branch.',
    icon: ShieldAlert,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'group-hover:border-danger/30',
  },
  {
    title: 'Auto-Fix Bugs',
    description: 'Let Claude 3.5 automatically open PRs for logic errors.',
    icon: Zap,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'group-hover:border-warning/30',
  },
  {
    title: 'Generate Tests',
    description: 'Instantly generate unit & E2E tests for missing coverage.',
    icon: Terminal,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'group-hover:border-primary/30',
  },
  {
    title: 'Docs Generation',
    description: 'Update READMEs and inline JSDocs via AI.',
    icon: FileText,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'group-hover:border-secondary/30',
  },
];

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiJson<Stats>('/reviews/stats').then(setStats).catch(() => {});
  }, []);

  const statValues = [
    stats?.repositoriesCount ?? 0,
    stats?.openIssuesCount ?? 0,
    stats?.securityAlertsCount ?? 0,
    stats?.avgQualityScore != null ? `${Math.round(stats.avgQualityScore)}/100` : '—',
  ];

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold tracking-tight font-display">Dashboard</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Welcome back to Codentra. Import your repositories to run AI code reviews, detect security vulnerabilities, and generate instant fixes.
        </p>
      </motion.div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        
        {/* Main Content Column */}
        <div className="space-y-8 min-w-0">
          
          {/* Vercel-like Github Import */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GithubImport />
          </motion.section>

          {/* Developer Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">AI Developer Tools</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {CODER_FEATURES.map((feat, i) => (
                <button
                  key={feat.title}
                  className={`group relative flex flex-col items-start rounded-xl border border-border/50 bg-card/40 p-5 text-left transition-all hover:bg-card hover:shadow-lg ${feat.border} backdrop-blur-sm`}
                >
                  <div className={`mb-3 rounded-lg p-2.5 ${feat.bg}`}>
                    <feat.icon size={20} className={feat.color} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                  
                  {/* Hover arrow */}
                  <div className="absolute right-4 top-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                    <span className="text-muted-foreground text-sm">→</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Sidebar Column (Stats) */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold tracking-tight mb-4 px-1">Overview Stats</h2>
            <div className="flex flex-col gap-4">
              {STAT_CONFIGS.map((cfg, i) => (
                <StatCard
                  key={cfg.label}
                  label={cfg.label}
                  value={statValues[i]!}
                  icon={cfg.icon}
                  gradient={cfg.gradient}
                  iconBg={cfg.iconBg}
                  iconColor={cfg.iconColor}
                />
              ))}
            </div>
          </motion.div>

          {/* Quick Start Tip */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-primary flex items-center gap-2">
                  <Terminal size={14} />
                  CLI Integration
                </CardTitle>
                <CardDescription className="text-xs">
                  Run Codentra directly from your terminal before you commit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="block rounded bg-background p-3 text-xs font-mono text-muted-foreground border border-border/50">
                  <span className="text-primary">$</span> npm i -g codentra-cli<br/>
                  <span className="text-primary">$</span> codentra scan .
                </code>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
