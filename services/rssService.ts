import { Article, FeedSource } from '../types';

export const fetchFeed = async (feedSource: FeedSource): Promise<Article[]> => {
  let xmlText: string | null = null;

  // List of proxies to try in order.
  // We use a fallback strategy because public proxies can be flaky or blocked.
  const fetchStrategies = [
    // Strategy 1: AllOrigins (JSON wrapped) - usually handles CORS headers correctly
    async () => {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feedSource.url)}`);
      if (!res.ok) throw new Error(`AllOrigins status: ${res.status}`);
      const data = await res.json();
      return data.contents;
    },
    // Strategy 2: CorsProxy.io (Direct proxy)
    async () => {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(feedSource.url)}`);
      if (!res.ok) throw new Error(`CorsProxy status: ${res.status}`);
      return await res.text();
    },
    // Strategy 3: AllOrigins Raw (Fallback for different content types)
    async () => {
       const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedSource.url)}`);
       if (!res.ok) throw new Error(`AllOrigins Raw status: ${res.status}`);
       return await res.text();
    }
  ];

  // Try each strategy until one works
  for (const strategy of fetchStrategies) {
    try {
      xmlText = await strategy();
      if (xmlText && xmlText.trim().length > 0) break; // Success
    } catch (e) {
      console.warn(`Fetch strategy failed for ${feedSource.url}:`, e);
      // Continue to next strategy
    }
  }

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
      // Try to find content:encoded. Note: querySelector with namespaces can be tricky in HTML DOMParser.
      // We check multiple ways to be safe.
      const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent 
                          || item.querySelector('content\\:encoded')?.textContent;
      
      const content = contentEncoded || description;
      
      const pubDateStr = item.querySelector('pubDate')?.textContent;
      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

      // Attempt to find an image
      let imageUrl: string | undefined;
      
      // 1. Check media:content (namespace aware)
      // Some feeds use <media:content url="..."> or <media:group><media:content ...>
      const mediaElements = item.getElementsByTagNameNS('*', 'content');
      if (mediaElements.length > 0) {
          for(let i=0; i<mediaElements.length; i++) {
              const el = mediaElements[i];
              const url = el.getAttribute('url');
              const type = el.getAttribute('type');
              const medium = el.getAttribute('medium');
              
              // Basic check if it looks like an image
              if (url && (type?.startsWith('image') || medium === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i))) {
                  imageUrl = url;
                  break;
              }
          }
      }
      
      // 2. Check enclosure
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

      // 3. Regex on description/content (Last resort)
      if (!imageUrl) {
        const imgRegex = /<img[^>]+src="([^">]+)"/;
        const match = description.match(imgRegex) || (content ? content.match(imgRegex) : null);
        if (match) {
          imageUrl = match[1];
        }
      }
      
      // Fix relative URLs in images (rare in RSS but happens)
      if (imageUrl && !imageUrl.startsWith('http')) {
          try {
              // Try to resolve against the item link or feed url
              imageUrl = new URL(imageUrl, link || feedSource.url).href;
          } catch (e) {
              // ignore invalid url construction
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