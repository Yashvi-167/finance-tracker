const LoadingSpinner = ({ fullPage = true, size = 'lg' }) => {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeMap[size]} border-2 border-border border-t-accent rounded-full animate-spin`} />
      {size === 'lg' && <p className="text-sm text-muted">Loading...</p>}
    </div>
  );

  if (!fullPage) return spinner;

  return (
    <div className="flex items-center justify-center h-64">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
