import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary', delay = 0 }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/20',
    accent: 'from-accent/20 to-accent/5 border-accent/20',
    success: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    warning: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
  };

  const iconColorClasses = {
    primary: 'text-primary',
    accent: 'text-accent',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card-hover p-6 bg-gradient-to-br ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold font-display text-foreground">
            {count.toLocaleString()}
          </p>
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              <span className="text-muted-foreground ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-background/50 ${iconColorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
