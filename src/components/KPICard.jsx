import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color = 'accent', prefix = '', suffix = '', trend, trendLabel }) => {
  const colorMap = {
    accent: { bg: 'bg-accent/10', text: 'text-accent-light', border: 'border-accent/20', icon: 'text-accent' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', icon: 'text-success' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20', icon: 'text-danger' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', icon: 'text-warning' },
    info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20', icon: 'text-info' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'text-purple-400' },
  };

  const c = colorMap[color] || colorMap.accent;

  const formatValue = (v) => {
    if (typeof v !== 'number') return v;
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toLocaleString();
  };

  return (
    <div className={`glass-card p-5 border ${c.border} hover:shadow-glass transition-all duration-300 hover:-translate-y-0.5 group animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium
            ${trend > 0 ? 'bg-success/10 text-success' : trend < 0 ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-muted'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-2xl font-bold ${c.text} leading-none`}>
          {prefix}{formatValue(value)}{suffix}
        </p>
        {trendLabel && <p className="text-xs text-muted mt-1.5">{trendLabel}</p>}
      </div>
    </div>
  );
};

export default KPICard;
