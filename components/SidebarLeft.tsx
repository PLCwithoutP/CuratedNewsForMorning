import React from 'react';
import Clock from './Clock';
import { Plus, RefreshCw } from 'lucide-react';

interface SidebarLeftProps {
  onAddFeedClick: () => void;
  onRefreshClick: () => void;
  isRefreshing: boolean;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ onAddFeedClick, onRefreshClick, isRefreshing }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <Clock />
      </div>
      
      <div className="flex-1"></div>

      <div className="flex flex-col gap-3 mt-auto">
        <button 
          onClick={onAddFeedClick}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Feed Link
        </button>

        <button 
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default SidebarLeft;
