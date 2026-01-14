import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar } from 'lucide-react';

const Clock: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 text-slate-600">
        <ClockIcon className="w-5 h-5" />
        <span className="text-3xl font-bold tracking-tight text-slate-900">{timeString}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{dateString}</span>
      </div>
    </div>
  );
};

export default Clock;
