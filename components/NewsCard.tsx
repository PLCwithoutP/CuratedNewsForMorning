import React from 'react';
import { Article } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  return (
    <div 
      onClick={() => onClick(article)}
      className="group flex flex-col p-4 bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer last:border-b-0"
    >
      <div className="flex justify-between items-start gap-3">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 line-clamp-2 mb-1">
          {article.title}
        </h3>
        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
           {formatDistanceToNow(article.pubDate, { addSuffix: true })}
        </span>
      </div>
      
      <div className="flex items-center gap-3 mt-1">
         <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
           {article.sourceTitle}
         </span>
         <p className="text-xs text-slate-500 line-clamp-1 truncate flex-1">
            {article.description}
         </p>
      </div>
    </div>
  );
};

export default NewsCard;