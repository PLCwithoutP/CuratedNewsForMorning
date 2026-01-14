export interface FeedSource {
  id: string;
  url: string;
  title: string;
  addedAt: Date;
  isTurkish: boolean;
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
}

export type Category = 'ALL' | 'TURKISH' | 'INTERNATIONAL';
