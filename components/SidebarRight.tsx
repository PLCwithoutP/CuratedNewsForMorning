import React from 'react';
import { FeedSource } from '../types';
import { Trash2, ExternalLink } from 'lucide-react';

interface SidebarRightProps {
  feeds: FeedSource[];
  onDeleteFeed: (id: string) => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ feeds, onDeleteFeed }) => {
  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-bold text-slate-800">Added Sources</h2>
        <p className="text-xs text-slate-500 mt-1">{feeds.length} active feeds</p>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {feeds.length === 0 ? (
          <div className="text-center p-4 text-slate-400 text-sm">
            No feeds added yet.
          </div>
        ) : (
          feeds.map((feed) => (
            <div 
              key={feed.id} 
              className="group flex flex-col p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-slate-800 line-clamp-1" title={feed.title}>
                  {feed.title}
                </span>
                <button 
                  onClick={() => onDeleteFeed(feed.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                  title="Remove Feed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{feed.isTurkish ? '🇹🇷 Turkish' : '🌐 International'}</span>
                <span className="text-[10px]">
                  {feed.addedAt.toLocaleDateString()}
                </span>
              </div>
              <a href={feed.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 mt-1 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 Source Link <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarRight;
