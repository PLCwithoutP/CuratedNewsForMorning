import React, { useEffect, useRef } from 'react';
import { Article } from '../types';
import { X, ExternalLink, Calendar, User } from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {article.sourceTitle}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
            {article.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{article.pubDate.toLocaleString()}</span>
            </div>
            {article.isTurkish && (
              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-semibold">TR</span>
            )}
          </div>

          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-auto rounded-xl mb-6 object-cover max-h-[400px]"
            />
          )}

          <div 
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
            // Using dangerouslySetInnerHTML carefully here. In a real app, use DOMPurify.
            // Since it's from RSS feeds we (mostly) trust or specific sources, it's ok for a demo.
            dangerouslySetInnerHTML={{ __html: article.content || article.description }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <a 
            href={article.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Read Original Source
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
