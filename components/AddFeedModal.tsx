import React, { useState } from 'react';
import { X, Plus, Rss } from 'lucide-react';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, category: string, isTurkish: boolean) => void;
}

const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [categoryType, setCategoryType] = useState('INTERNATIONAL'); // 'INTERNATIONAL', 'TURKISH', 'BASKETBALL'

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const isTurkish = categoryType === 'TURKISH';
      // Pass category name if it's special, like BASKETBALL
      const category = categoryType === 'BASKETBALL' ? 'BASKETBALL' : undefined;
      
      onAdd(url.trim(), category || '', isTurkish);
      
      setUrl('');
      setCategoryType('INTERNATIONAL');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Rss className="w-5 h-5 text-orange-500" />
            Add New RSS Feed
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">RSS Feed URL</label>
            <input 
              type="url" 
              required
              placeholder="https://example.com/rss.xml"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="INTERNATIONAL">Global News</option>
              <option value="TURKISH">Turkish News</option>
              <option value="BASKETBALL">Basketball</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Feed
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFeedModal;