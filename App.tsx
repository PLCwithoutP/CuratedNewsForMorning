import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Article, FeedSource, Category } from './types';
import { DEFAULT_FEEDS } from './constants';
import { fetchFeed } from './services/rssService';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import NewsCard from './components/NewsCard';
import ArticleModal from './components/ArticleModal';
import AddFeedModal from './components/AddFeedModal';
import { Search, Filter } from 'lucide-react';

const App: React.FC = () => {
  const [feeds, setFeeds] = useState<FeedSource[]>(() => {
    // Initialize with defaults if localStorage is empty (persistance is bonus, but good for "Real" app feel)
    const saved = localStorage.getItem('feeds');
    if (saved) {
      return JSON.parse(saved, (key, value) => key === 'addedAt' ? new Date(value) : value);
    }
    return DEFAULT_FEEDS.map(f => ({ ...f, addedAt: new Date() }));
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
  
  // Modal states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('feeds', JSON.stringify(feeds));
  }, [feeds]);

  // Fetch logic
  const loadFeeds = useCallback(async () => {
    setIsLoading(true);
    let allArticles: Article[] = [];
    
    // Fetch all feeds in parallel
    const promises = feeds.map(feed => fetchFeed(feed));
    const results = await Promise.all(promises);
    
    results.forEach(feedArticles => {
      allArticles = [...allArticles, ...feedArticles];
    });

    // Sort by date descending
    allArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    
    setArticles(allArticles);
    setIsLoading(false);
  }, [feeds]);

  // Initial Load
  useEffect(() => {
    loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount, then depend on manual refresh or feed changes

  // Handlers
  const handleAddFeed = (url: string, isTurkish: boolean) => {
    const newFeed: FeedSource = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      title: 'New Feed (Loading...)', // Will update title on next fetch or simple parse
      addedAt: new Date(),
      isTurkish
    };
    
    // Optimistic add, then reload to get real title and articles
    setFeeds(prev => [...prev, newFeed]);
    setTimeout(() => loadFeeds(), 100);
  };

  const handleDeleteFeed = (id: string) => {
    if (window.confirm('Are you sure you want to remove this feed?')) {
      setFeeds(prev => prev.filter(f => f.id !== id));
      // Re-fetch/filter logic handled by useEffect on [feeds] if we added it, 
      // but to be efficient, we might just filter existing articles or reload.
      // Simpler to just reload to clean up.
      setTimeout(() => loadFeeds(), 100);
    }
  };

  // Filtering
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Category Filter
      if (selectedCategory === 'TURKISH' && !article.isTurkish) return false;
      if (selectedCategory === 'INTERNATIONAL' && article.isTurkish) return false;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(query) || 
          article.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      
      {/* LEFT COLUMN - Fixed width */}
      <aside className="w-[280px] flex-shrink-0 p-6 border-r border-slate-200 hidden md:block">
        <SidebarLeft 
          onAddFeedClick={() => setIsAddModalOpen(true)}
          onRefreshClick={loadFeeds}
          isRefreshing={isLoading}
        />
      </aside>

      {/* MIDDLE COLUMN - Fluid width */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Bar for Middle Column */}
        <header className="px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
             <button 
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedCategory === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               All
             </button>
             <button 
              onClick={() => setSelectedCategory('TURKISH')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedCategory === 'TURKISH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Turkish
             </button>
             <button 
              onClick={() => setSelectedCategory('INTERNATIONAL')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedCategory === 'INTERNATIONAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Global
             </button>
          </div>
        </header>

        {/* Article List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoading && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p>Fetching latest news...</p>
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="flex flex-col">
                {filteredArticles.map((article) => (
                  <NewsCard 
                    key={article.id} 
                    article={article} 
                    onClick={setSelectedArticle}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter className="w-12 h-12 mb-2 opacity-20" />
                <p>No articles found.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* RIGHT COLUMN - Fixed width */}
      <aside className="w-[300px] flex-shrink-0 p-4 border-l border-slate-200 hidden lg:block bg-slate-50/50">
        <SidebarRight 
          feeds={feeds} 
          onDeleteFeed={handleDeleteFeed}
        />
      </aside>

      {/* Mobile Controls (Floating) */}
      <div className="md:hidden fixed bottom-6 right-6 z-20 flex flex-col gap-2">
        <button 
          onClick={loadFeeds}
          className="p-3 bg-white text-slate-800 rounded-full shadow-lg border border-slate-200"
        >
          <div className={isLoading ? 'animate-spin' : ''}>
            <Filter className="w-6 h-6" /> 
          </div>
        </button>
        <button 
           onClick={() => setIsAddModalOpen(true)}
           className="p-3 bg-blue-600 text-white rounded-full shadow-lg"
        >
          <Search className="w-6 h-6" /> 
        </button>
      </div>

      {/* Modals */}
      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
      />
      
      <AddFeedModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddFeed}
      />
    </div>
  );
};

export default App;