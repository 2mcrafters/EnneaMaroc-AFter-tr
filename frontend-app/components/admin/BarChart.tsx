import React from 'react';

interface BarChartData {
  labels: string[];
  values: number[];
}

interface BarChartProps {
  title: string;
  data: BarChartData;
  color: string; // e.g., 'bg-sky-500'
  unit?: string;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, color, unit = '' }) => {
  const maxValue = Math.max(...data.values, 1); // Avoid division by zero

  return (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 h-full flex flex-col">
      <h3 className="font-bold text-slate-800 text-lg mb-4 flex-shrink-0">{title}</h3>
      {data.values.length > 0 ? (
        <div className="flex-grow flex justify-between items-end h-64 space-x-2">
            {data.labels.map((label, index) => (
            <div key={label + index} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="text-xs font-semibold text-slate-600 mb-1">
                    {data.values[index].toLocaleString('de-DE')}{unit}
                </div>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${color}`}
                  style={{ height: `${(data.values[index] / maxValue) * 100}%` }}
                  title={`${label}: ${data.values[index].toLocaleString('de-DE')}${unit}`}
                ></div>
                <div className="mt-2 text-xs text-slate-500 text-center font-medium h-8 flex items-center">{label}</div>
            </div>
            ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center h-64">
            <p className="text-slate-500">No data available.</p>
        </div>
      )}
    </div>
  );
};

export default BarChart;
