
export interface FeedSource {
  id: string;
  url: string;
  title: string;
  addedAt: Date;
  isTurkish: boolean;
  category?: string;
}

export interface Article {
  id: string;
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: Date;
  imageUrl?: string;
  sourceId: string;
  sourceTitle: string;
  isTurkish: boolean;
  category?: string;
}

export interface CityWeather {
  city: string;
  status: string;
  maxTemp: string;
}

export type Category = 'ALL' | 'TURKISH' | 'INTERNATIONAL' | 'BASKETBALL';
