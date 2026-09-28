import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  gradient = 'from-primary/10 to-primary/5',
  iconBg = 'bg-primary/15',
  iconColor = 'text-primary',
}: StatCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${gradient} p-5 card-shine transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover`}>
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>

      {/* Trend */}
      {trend && (
        <p className={`mt-3 text-xs font-medium ${trend.positive ? 'text-success' : 'text-danger'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}

      {/* Corner glow */}
      <div className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40 bg-gradient-to-br ${gradient}`} />
    </div>
  );
}
