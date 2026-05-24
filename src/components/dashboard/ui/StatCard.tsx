import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  change: number;
  changeLabel: string;
  icon: ReactNode;
  accentColor: string;
  invertChange?: boolean;
  index?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  accentColor,
  invertChange = false,
  index = 0,
}: StatCardProps) {
  const isPositiveChange = change >= 0;
  const isGood = invertChange ? !isPositiveChange : isPositiveChange;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        isMobile
          ? { duration: 0 }
          : {
              duration: 0.5,
              delay: 0.1 + index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }
      }
      whileHover={
        isMobile
          ? {}
          : {
              y: -4,
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
            }
      }
      className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-colors"
    >
      {/* Subtle accent glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header row: title + icon */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}14` }}
        >
          <div style={{ color: accentColor }} className="[&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-warm-earth">
          {value}
        </span>
        <span className="text-sm font-medium text-gray-400">{subtitle}</span>
      </div>

      {/* Change indicator */}
      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            isGood
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-500'
          }`}
        >
          {isPositiveChange ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositiveChange ? '+' : ''}
          {change}%
        </span>
        <span className="text-xs text-gray-400">{changeLabel}</span>
      </div>
    </motion.div>
  );
}
