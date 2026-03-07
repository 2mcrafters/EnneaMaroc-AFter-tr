import React from 'react';

interface StatCardProps {
  // FIX: Explicitly type the `icon` prop to be a ReactElement that accepts a `className`, resolving the `cloneElement` type error.
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  value: string | number;
  colorClasses: string; // e.g., "from-blue-500 to-blue-400"
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClasses }) => {
  return (
    <div className={`bg-gradient-to-br ${colorClasses} text-white p-6 rounded-xl shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-4 -bottom-4 text-white/20">
        {React.cloneElement(icon, { className: 'w-24 h-24' })}
      </div>
      <div className="relative">
        <p className="text-4xl font-bold">{value}</p>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;