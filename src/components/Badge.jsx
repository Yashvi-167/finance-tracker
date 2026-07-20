const STATUS_STYLES = {
  PENDING: 'badge-pending',
  SHIPPED: 'badge-shipped',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
};

const CATEGORY_STYLES = {
  RENT: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  MARKETING: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  STOCK: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  UTILITIES: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  SALARIES: 'bg-green-500/10 text-green-400 border-green-500/30',
  OTHER: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const Badge = ({ value, type = 'status' }) => {
  const style = type === 'status'
    ? STATUS_STYLES[value] || 'bg-surface-2 text-text-secondary border-border'
    : CATEGORY_STYLES[value] || 'bg-surface-2 text-text-secondary border-border';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {value}
    </span>
  );
};

export default Badge;
