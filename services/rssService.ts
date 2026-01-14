import { Article, FeedSource } from '../types';

// Exported helper to be used by other services (like weather)
export const fetchTextWithProxy = async (url: string): Promise<string | null> => {
  const fetchStrategies = [
    // Strategy 1: AllOrigins (JSON wrapped)
    async () => {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`AllOrigins status: ${res.status}`);
      const data = await res.json();
      return data.contents;
    },
    // Strategy 2: CorsProxy.io (Direct proxy)
    async () => {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`CorsProxy status: ${res.status}`);
      return await res.text();
    },
    // Strategy 3: AllOrigins Raw
    async () => {
       const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
       if (!res.ok) throw new Error(`AllOrigins Raw status: ${res.status}`);
       return await res.text();
    }
  ];

  for (const strategy of fetchStrategies) {
    try {
      const result = await strategy();
      if (result && result.trim().length > 0) return result;
    } catch (e) {
      console.warn(`Fetch strategy failed for ${url}:`, e);
    }
  }
  
  return null;
};

export const fetchFeed = async (feedSource: FeedSource): Promise<Article[]> => {
  const xmlText = await fetchTextWithProxy(feedSource.url);

  if (!xmlText) {
    console.error(`All fetch strategies failed for ${feedSource.url}`);
    return [];
  }

  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parser errors
    const parserError = xml.querySelector('parsererror');
    if (parserError) {
        console.error('XML Parse Error for ' + feedSource.url, parserError.textContent);
        return [];
    }

    const items = Array.from(xml.querySelectorAll('item'));
    const channelTitle = xml.querySelector('channel > title')?.textContent || feedSource.title;

    return items.map((item) => {
      const title = item.querySelector('title')?.textContent || 'No Title';
      const link = item.querySelector('link')?.textContent || '';
      
      // Handle description/content
      let description = item.querySelector('description')?.textContent || '';
      const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent 
                          || item.querySelector('content\\:encoded')?.textContent;
      
      const content = contentEncoded || description;
      
      const pubDateStr = item.querySelector('pubDate')?.textContent;
      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

      // Attempt to find an image
      let imageUrl: string | undefined;
      
      const mediaElements = item.getElementsByTagNameNS('*', 'content');
      if (mediaElements.length > 0) {
          for(let i=0; i<mediaElements.length; i++) {
              const el = mediaElements[i];
              const url = el.getAttribute('url');
              const type = el.getAttribute('type');
              const medium = el.getAttribute('medium');
              
              if (url && (type?.startsWith('image') || medium === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i))) {
                  imageUrl = url;
                  break;
              }
          }
      }
      
      if (!imageUrl) {
        const enclosures = item.querySelectorAll('enclosure');
        for(let i=0; i<enclosures.length; i++) {
             const url = enclosures[i].getAttribute('url');
             const type = enclosures[i].getAttribute('type');
             if(url && type?.startsWith('image')) {
                 imageUrl = url;
                 break;
             }
        }
      }

      if (!imageUrl) {
        const imgRegex = /<img[^>]+src="([^">]+)"/;
        const match = description.match(imgRegex) || (content ? content.match(imgRegex) : null);
        if (match) {
          imageUrl = match[1];
        }
      }
      
      if (imageUrl && !imageUrl.startsWith('http')) {
          try {
              imageUrl = new URL(imageUrl, link || feedSource.url).href;
          } catch (e) {
          }
      }

      return {
        id: link || Math.random().toString(36).substr(2, 9),
        title: stripHtml(title),
        link,
        description: stripHtml(description).substring(0, 150) + '...',
        content: content,
        pubDate,
        imageUrl,
        sourceId: feedSource.id,
        sourceTitle: channelTitle,
        isTurkish: feedSource.isTurkish,
        category: feedSource.category,
      };
    });
  } catch (error) {
    console.error(`Error parsing feed ${feedSource.url}:`, error);
    return [];
  }
};

const stripHtml = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};